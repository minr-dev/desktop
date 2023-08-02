import { inject, injectable } from 'inversify';

import { TYPES } from '@renderer/types';
import { IEventService } from './IEventService';
import type { IScheduleEventProxy } from '@renderer/services/IScheduleEventProxy';
import { ScheduleEvent } from '@shared/dto/ScheduleEvent';

/**
 * タイムテーブルのイベントデータとして予定と実績を取得するサービス
 *
 * scheduleEventProxy によって、予定と実績を取得し結合して、 ScheduleEvent の配列として返す。
 */
@injectable()
export class EventServiceImpl implements IEventService {
  constructor(
    @inject(TYPES.ScheduleEventProxy)
    private readonly scheduleEventProxy: IScheduleEventProxy
  ) {}

  async fetchEvents(startDate: Date, endDate: Date): Promise<ScheduleEvent[]> {
    const scheduleEvents = await this.scheduleEventProxy.list(startDate, endDate);
    return scheduleEvents;
  }
}
