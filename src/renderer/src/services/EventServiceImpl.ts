import { inject, injectable } from 'inversify';
import { ProcessedEvent } from '@aldabil/react-scheduler/types';

import { IEventService } from './IEventService';
import { TYPES } from '@renderer/types';
import type { IScheduleEventProxy } from '@renderer/services/IScheduleEventProxy';
import type { IActiveWindowLogProxy } from '@renderer/services/IActiveWindowLogProxy';
import { EVENT_TYPE } from '@shared/dto/ScheduleEvent';

/**
 * タイムテーブルのイベントデータとして予定と実績およびアクティビティを取得するサービス
 *
 * scheduleEventProxy によって、予定と実績を取得し、activeWindowLogProxy でアクティビティを取得する。
 * それらを結合して、ProcessedEvent の配列として返す。
 * ScheduleEvent は、1対1で ProcessedEvent に変換され、ActiveWindowLog は、多対1で ProcessedEvent に変換される。
 * ActiveWindowLog は、basename の値が同じものが連続する場合には、それを1つにまとめて、title が明細リストとなって
 * description に格納される。
 */
@injectable()
export class EventServiceImpl implements IEventService {
  constructor(
    @inject(TYPES.ScheduleEventProxy)
    private readonly scheduleEventProxy: IScheduleEventProxy,
    @inject(TYPES.ActiveWindowLogProxy)
    private readonly activeWindowLogProxy: IActiveWindowLogProxy
  ) {}

  async fetchEvents(startDate: Date, endDate: Date): Promise<ProcessedEvent[]> {
    const scheduleEvents = await this.scheduleEventProxy.list(startDate, endDate);
    const activeWindowLogs = await this.activeWindowLogProxy.list(startDate, endDate);

    let events = scheduleEvents.map((storedEvent) => {
      const event: ProcessedEvent = {
        event_id: storedEvent.id,
        title: storedEvent.summary,
        start: storedEvent.start,
        end: storedEvent.end,
        event_type: storedEvent.eventType,
      };
      return event;
    });

    events = events.concat(
      activeWindowLogs.map((winlog) => {
        const event: ProcessedEvent = {
          event_id: winlog.id,
          title: winlog.basename,
          start: winlog.activated,
          end: winlog.deactivated ? winlog.deactivated : winlog.activated,
          event_type: EVENT_TYPE.ACTIVITY,
        };
        return event;
      })
    );

    return events;
  }
}
