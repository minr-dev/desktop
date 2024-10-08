import { TYPES } from '@main/types';
import { inject, injectable } from 'inversify';
import { add as addDate } from 'date-fns';
import type { IExternalCalendarService } from './IExternalCalendarService';
import type { IUserPreferenceStoreService } from './IUserPreferenceStoreService';
import type { IEventEntryService } from './IEventEntryService';
import { EventEntry } from '@shared/data/EventEntry';
import { ITaskProcessor } from './ITaskProcessor';
import {
  ExternalEventEntry,
  ExternalEventEntryId,
  toStringExternalEventEntryId,
} from '@shared/data/ExternalEventEntry';
import { EventEntryFactory } from './EventEntryFactory';
import { ExternalEventEntryFactory } from './ExternalEventEntryFactory';
import type { IUserDetailsService } from './IUserDetailsService';
import { CalendarSetting } from '@shared/data/CalendarSetting';
import { IpcChannel } from '@shared/constants';
import { IpcService } from './IpcService';
import type { ILoggerFactory } from './ILoggerFactory';

// 同期開始日を現在日から3日前
const SYNC_RANGE_START_OFFSET_DAYS = -3;
// 同期終了日を現在日から2週間後
const SYNC_RANGE_END_OFFSET_DAYS = 14;

/**
 * 他カレンダーと同期する
 *
 * ■同期対象のカレンダー
 * minr では、 UserPreference の CalendarSetting で同期用のカレンダーを設定するのだけど、
 * eventType によって、同期する対象を分けられるようになっている。
 *
 * - EVENT_TYPE.SHARED（共有カレンダー）
 *    - minr 側から新規のイベントが共有カレンダーに同期されることはない。
 *    - 常に取り込みが行われたあとの同期処理となる。
 *    - minr の UI 上は、予定のレーンに表示される。
 * - EVENT_TYPE.PLAN（予定カレンダー）
 *    - minr の予定のイベントと同期する
 *    - minr の UI 上は、予定のレーンに表示される。
 *    - minr の UI の予定のレーンから登録されたイベントは、予定カレンダーに同期される。
 * - EVENT_TYPE.ACTUAL（実績カレンダー）
 *    - minrの実績は、実績カレンダーと同期する。
 *
 * ■同期範囲
 * 同期する範囲は、現在日から -3 日～ 2 週間先までを範囲として、minr のイベントと同期する。
 * 過去のイベントを変更することはあまりないのと、仮に-5日の予定に変更があったとして、それが同期されなかったとして、
 * これから未来の仕事には、ほぼ影響しないと考えられるので、そもそも、全量同期することはしない。
 * 例えば、Googleカレンダーに同期されたあとに、Googleカレンダーの予定を動かした場合なども、
 * -3日の範囲内の移動に限定して、再同期される。
 *
 * ■同期管理用の項目
 * EventEntry.lastSynced で同期日時を管理していて、 Googleカレンダーなどの他カレンダーの
 * 更新日と比較することで、どっちが新しいかを判断して同期する。
 * EventEntry.updated は、同期の判定には使わない。
 *
 * ■削除
 * minr のイベントは EventEntry.deleted で論理削除になっているので、削除状態も同期する。
 * minr は論理削除して、外部カレンダーのイベントは削除APIで削除する。
 * 外部カレンダーによっては、物理的に削除されずに、ステータスが canceled などに変更される場合もあるが、
 * こういうケースでは、外部カレンダーの listEvents では、 canceled を filter することで、物理削除と同じ扱いする。
 */
@injectable()
export class CalendarSyncProcessorImpl implements ITaskProcessor {
  private logger;

  constructor(
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService,
    @inject(TYPES.UserPreferenceStoreService)
    private readonly userPreferenceStoreService: IUserPreferenceStoreService,
    @inject(TYPES.GoogleCalendarService)
    private readonly externalCalendarService: IExternalCalendarService,
    @inject(TYPES.EventEntryService)
    private readonly eventEntryService: IEventEntryService,
    @inject(TYPES.IpcService)
    private readonly ipcService: IpcService,
    @inject(TYPES.LoggerFactory)
    private readonly loggerFactory: ILoggerFactory
  ) {
    this.logger = this.loggerFactory.getLogger({
      processType: 'main',
      loggerName: 'CalendarSyncProcessorImpl',
    });
  }

  private async getUserId(): Promise<string> {
    const userDetails = await this.userDetailsService.get();
    return userDetails.userId;
  }

  async execute(): Promise<void> {
    if (this.logger.isDebugEnabled()) this.logger.debug('CalendarSyncProcessorImpl.execute');
    const userPreference = await this.userPreferenceStoreService.getOrCreate(
      await this.getUserId()
    );
    const start = addDate(new Date(), { days: SYNC_RANGE_START_OFFSET_DAYS });
    const end = addDate(new Date(), { days: SYNC_RANGE_END_OFFSET_DAYS });
    const minrEventsAll = await this.eventEntryService.list(await this.getUserId(), start, end);
    let updateCount = 0;
    for (const calendar of userPreference.calendars) {
      const externalEvents = await this.externalCalendarService.listEvents(
        calendar.calendarId,
        start,
        end
      );
      const minrEvents = minrEventsAll.filter((ev) => ev.eventType === calendar.eventType);
      updateCount += await this.processEventSynchronization(calendar, minrEvents, externalEvents);
    }
    if (updateCount > 0) {
      if (this.logger.isDebugEnabled()) this.logger.debug('send EVENT_ENTRY_NOTIFY');
      this.ipcService.send(IpcChannel.EVENT_ENTRY_NOTIFY);
    }
  }

  async terminate(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * 外部カレンダーのイベントと minr のイベントを同期する
   *
   * @param calendarSetting 対象の外部カレンダーの設定
   * @param minrEvents 対象カレンダーとの同期対象の minr のイベント
   * @param externalEvents 対象カレンダーのイベント
   */
  async processEventSynchronization(
    calendarSetting: CalendarSetting,
    minrEvents: EventEntry[],
    externalEvents: ExternalEventEntry[]
  ): Promise<number> {
    if (this.logger.isDebugEnabled())
      this.logger.debug(
        `processEventSynchronization: calendarSetting=${calendarSetting}, minrEvents=${minrEvents}, externalEvents=${externalEvents}`
      );
    const minrEventsMap = new Map<string, EventEntry>();
    for (const event of minrEvents) {
      if (!event.externalEventEntryId) {
        this.newExternalEvent(calendarSetting, event);
        continue;
      }
      minrEventsMap.set(toStringExternalEventEntryId(event.externalEventEntryId), event);
    }
    let updateCount = 0;
    for (const externalEvent of externalEvents) {
      if (!externalEvent.id) {
        this.logger.error('externalEvent.id is null');
        throw new Error('externalEvent.id is null');
      }
      const extKey = toStringExternalEventEntryId(externalEvent.id);
      const minrEvent = minrEventsMap.get(extKey);
      minrEventsMap.delete(extKey);
      if (!minrEvent) {
        await this.newMinrEvent(calendarSetting, externalEvent);
        updateCount++;
        continue;
      }
      if (!minrEvent.lastSynced) {
        this.logger.error('lastSynced is null');
        throw new Error('lastSynced is null');
      }
      if (!externalEvent.updated) {
        this.logger.error('externalEvent.updated is null');
        throw new Error('externalEvent.updated is null');
      }
      if (minrEvent.lastSynced.getTime() === externalEvent.updated.getTime()) {
        continue;
      }
      if (minrEvent.lastSynced.getTime() < externalEvent.updated.getTime()) {
        await this.updateMinrEvent(minrEvent, externalEvent);
        updateCount++;
        continue;
      }
      if (minrEvent.lastSynced.getTime() > externalEvent.updated.getTime()) {
        if (minrEvent.deleted) {
          if (!minrEvent.externalEventEntryId) {
            this.logger.error('externalEventEntryId is null');
            throw new Error('externalEventEntryId is null');
          }
          await this.deleteExternalEvent(minrEvent.externalEventEntryId);
        } else {
          await this.updateExternalEvent(externalEvent, minrEvent);
        }
        continue;
      }
      this.logger.error(
        `minrEvent.lastSynced: ${minrEvent.lastSynced} externalEvent.updated: ${externalEvent.updated}}`
      );
      throw new Error(
        `minrEvent.lastSynced: ${minrEvent.lastSynced} externalEvent.updated: ${externalEvent.updated}}`
      );
    }
    for (const minrEvent of minrEventsMap.values()) {
      if (minrEvent.externalEventEntryId) {
        if (minrEvent.deleted) {
          continue;
        }
        await this.deleteMinrEvent(minrEvent);
        updateCount++;
      } else if (!minrEvent.externalEventEntryId) {
        await this.newExternalEvent(calendarSetting, minrEvent);
      } else {
        this.logger.error('unreachable');
        throw new Error('unreachable');
      }
    }
    return updateCount;
  }

  private async newMinrEvent(
    calendarSetting: CalendarSetting,
    external: ExternalEventEntry
  ): Promise<void> {
    if (this.logger.isDebugEnabled()) this.logger.debug(`newMinrEvent: ${external}`);
    const usereId = await this.getUserId();
    if (this.logger.isDebugEnabled()) this.logger.debug(`newMinrEvent: ${usereId}`);
    const data = EventEntryFactory.createFromExternal(usereId, calendarSetting.eventType, external);
    await this.eventEntryService.save(data);
  }

  private async updateMinrEvent(minr: EventEntry, external: ExternalEventEntry): Promise<void> {
    if (this.logger.isDebugEnabled())
      this.logger.debug(`updateMinrEvent: minr.id=${minr.id}, minr=${minr}, external=${external}`);
    EventEntryFactory.updateFromExternal(minr, external);
    await this.eventEntryService.save(minr);
  }

  private async deleteMinrEvent(minr: EventEntry): Promise<void> {
    if (this.logger.isDebugEnabled())
      this.logger.debug(`deleteMinrEvent: minr.id=${minr.id}, minr=${minr}`);
    EventEntryFactory.updateLogicalDelete(minr);
    await this.eventEntryService.save(minr);
  }

  private async newExternalEvent(
    calendarSetting: CalendarSetting,
    minr: EventEntry
  ): Promise<void> {
    if (this.logger.isDebugEnabled())
      this.logger.debug(`newExternalEvent: minr.id=${minr.id}, minr=${minr}`);
    const external = ExternalEventEntryFactory.createFromMinr(minr, calendarSetting.calendarId);
    const updated = await this.externalCalendarService.saveEvent(external);
    EventEntryFactory.updateFromExternal(minr, updated);
    await this.eventEntryService.save(minr);
  }

  private async updateExternalEvent(external: ExternalEventEntry, minr: EventEntry): Promise<void> {
    if (this.logger.isDebugEnabled())
      this.logger.debug(
        `updateExternalEvent: minr.id=${minr.id}, external=${external}, minr=${minr}`
      );
    ExternalEventEntryFactory.updateFromMinr(external, minr);
    const updated = await this.externalCalendarService.saveEvent(external);
    EventEntryFactory.updateFromExternal(minr, updated);
    await this.eventEntryService.save(minr);
  }

  private async deleteExternalEvent(externalEventEntryId: ExternalEventEntryId): Promise<void> {
    if (this.logger.isDebugEnabled())
      this.logger.debug(`deleteExternalEvent: ${externalEventEntryId}`);
    if (!externalEventEntryId.id) {
      this.logger.error('externalEventEntryId.id is null');
      throw new Error('externalEventEntryId.id is null');
    }
    await this.externalCalendarService.deleteEvent(
      externalEventEntryId.calendarId,
      externalEventEntryId.id
    );
  }
}
