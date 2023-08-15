import { TYPES } from '@main/types';
import { inject, injectable } from 'inversify';
import { add as addDate } from 'date-fns';
import type { IExternalCalendarService } from './IExternalCalendarService';
import type { IUserPreferenceStoreService } from './IUserPreferenceStoreService';
import type { IEventEntryService } from './IEventEntryService';
import { EventEntry } from '@shared/dto/EventEntry';
import { ISyncProcessor } from './ISyncProcessor';
import {
  ExternalEventEntry,
  ExternalEventEntryId,
  toStringExternalEventEntryId,
} from '@shared/dto/ExternalEventEntry';
import { EventEntryFactory } from './EventEntryFactory';
import { ExternalEventEntryFactory } from './ExternalEventEntryFactory';
import type { IUserDetailsService } from './IUserDetailsService';

// 同期開始日を現在日から3日前
const SYNC_RANGE_START_OFFSET_DAYS = -3;
// 同期終了日を現在日から2週間後
const SYNC_RANGE_END_OFFSET_DAYS = 14;

/**
 * 他カレンダーと同期する
 *
 * ■同期対象のカレンダー
 * minr では、 UserPreference の CalendarSetting で同期用のカレンダーを設定するのだけど、
 * CalendarType によって、同期する対象を分けられるようになっている。
 *
 * - PLAN: minr の予定のイベントと同期する
 * - ACTUAL: minr の実績のイベントと同期する
 * - OTHER: minr の予定に取り込みを行って、それ以降は、同期されるが、minr で最初に登録したイベントは、連携先のシステムには登録されない
 *
 * ■同期範囲
 * 同期する範囲は、現在日から -3 日の範囲内で、minr で登録したイベント（予定および実績）とを相互同期する。
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
export class CalendarSynchronizer implements ISyncProcessor {
  constructor(
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService,
    @inject(TYPES.UserPreferenceStoreService)
    private readonly userPreferenceStoreService: IUserPreferenceStoreService,
    @inject(TYPES.GoogleCalendarService)
    private readonly externalCalendarService: IExternalCalendarService,
    @inject(TYPES.EventEntryService)
    private readonly eventEntryService: IEventEntryService
  ) {}

  private async getUserId(): Promise<string> {
    const userDetails = await this.userDetailsService.get();
    return userDetails.userId;
  }

  async sync(): Promise<void> {
    console.log('CalendarSynchronizer.sync');
    const userPreference = await this.userPreferenceStoreService.getOrCreate(
      await this.getUserId()
    );
    const start = addDate(new Date(), { days: SYNC_RANGE_START_OFFSET_DAYS });
    const end = addDate(new Date(), { days: SYNC_RANGE_END_OFFSET_DAYS });
    const minrEvents = await this.eventEntryService.list(await this.getUserId(), start, end);
    const calendarIds = userPreference.calendars.map((c) => c.calendarId);
    let externalEvents: ExternalEventEntry[] = [];
    for (const calendarId of calendarIds) {
      const events = await this.externalCalendarService.listEvents(calendarId, start, end);
      externalEvents = externalEvents.concat(events);
    }
    this.processEventSynchronization(minrEvents, externalEvents);
  }

  async processEventSynchronization(
    minrEvents: EventEntry[],
    externalEvents: ExternalEventEntry[]
  ): Promise<void> {
    console.log('CalendarSynchronizer.processEventSynchronization', minrEvents, externalEvents);
    const minrEventsMap = new Map<string, EventEntry>();
    for (const event of minrEvents) {
      if (!event.externalEventEntryId) {
        this.newExternalEvent(event);
        continue;
      }
      minrEventsMap.set(toStringExternalEventEntryId(event.externalEventEntryId), event);
    }
    for (const externalEvent of externalEvents) {
      if (!externalEvent.id) {
        throw new Error('externalEvent.id is null');
      }
      const extKey = toStringExternalEventEntryId(externalEvent.id);
      const minrEvent = minrEventsMap.get(extKey);
      minrEventsMap.delete(extKey);
      if (!minrEvent) {
        this.newMinrEvent(externalEvent);
        continue;
      }
      if (!minrEvent.lastSynced) {
        throw new Error('lastSynced is null');
      }
      if (!externalEvent.updated) {
        throw new Error('externalEvent.updated is null');
      }
      if (minrEvent.lastSynced.getTime() === externalEvent.updated.getTime()) {
        continue;
      }
      if (minrEvent.lastSynced.getTime() < externalEvent.updated.getTime()) {
        this.updateMinrEvent(minrEvent, externalEvent);
        continue;
      }
      if (minrEvent.lastSynced.getTime() > externalEvent.updated.getTime()) {
        if (minrEvent.deleted) {
          if (!minrEvent.externalEventEntryId) {
            throw new Error('externalEventEntryId is null');
          }
          this.deleteExternalEvent(minrEvent.externalEventEntryId);
        } else {
          this.updateExternalEvent(externalEvent, minrEvent);
        }
        continue;
      }
      throw new Error(
        `minrEvent.lastSynced: ${minrEvent.lastSynced} externalEvent.updated: ${externalEvent.updated}}`
      );
    }
    for (const minrEvent of minrEventsMap.values()) {
      if (minrEvent.externalEventEntryId) {
        this.deleteMinrEvent(minrEvent);
      } else if (!minrEvent.externalEventEntryId) {
        this.newExternalEvent(minrEvent);
      } else {
        throw new Error('unreachable');
      }
    }
  }

  private async newMinrEvent(external: ExternalEventEntry): Promise<void> {
    console.log('newMinrEvent', external);
    const data = EventEntryFactory.createFromExternal(await this.getUserId(), external);
    await this.eventEntryService.save(data);
  }

  private async updateMinrEvent(minr: EventEntry, external: ExternalEventEntry): Promise<void> {
    console.log('updateMinrEvent', minr, external);
    EventEntryFactory.updateFromExternal(minr, external);
    await this.eventEntryService.save(minr);
  }

  private async deleteMinrEvent(minr: EventEntry): Promise<void> {
    console.log('deleteMinrEvent', minr);
    EventEntryFactory.updateLogicalDelete(minr);
    await this.eventEntryService.save(minr);
  }

  private async newExternalEvent(minr: EventEntry): Promise<void> {
    console.log('newExternalEvent', minr);
    const external = ExternalEventEntryFactory.createFromMinr(minr);
    const updated = await this.externalCalendarService.saveEvent(external);
    EventEntryFactory.updateFromExternal(minr, updated);
    await this.eventEntryService.save(minr);
  }

  private async updateExternalEvent(external: ExternalEventEntry, minr: EventEntry): Promise<void> {
    console.log('updateExternalEvent', external, minr);
    ExternalEventEntryFactory.updateFromMinr(external, minr);
    const updated = await this.externalCalendarService.saveEvent(external);
    EventEntryFactory.updateFromExternal(minr, updated);
    await this.eventEntryService.save(minr);
  }

  private async deleteExternalEvent(externalEventEntryId: ExternalEventEntryId): Promise<void> {
    console.log('deleteExternalEvent', externalEventEntryId);
    await this.externalCalendarService.deleteEvent(
      externalEventEntryId.calendarId,
      externalEventEntryId.id
    );
  }
}
