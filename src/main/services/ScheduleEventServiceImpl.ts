import { EVENT_TYPE, ScheduleEvent } from '@shared/dto/ScheduleEvent';
import { IScheduleEventService } from './IScheduleEventService';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { DataSource } from './DataSource';

const DB_NAME = 'scheduleEvent.db';

@injectable()
export class ScheduleEventServiceImpl implements IScheduleEventService {
  constructor(
    @inject(TYPES.DataSource)
    private readonly dataSource: DataSource<ScheduleEvent>
  ) {
    this.dataSource.initDb(DB_NAME, [{ fieldName: 'id', unique: true }]);
  }

  async list(start: Date, end: Date): Promise<ScheduleEvent[]> {
    return await this.dataSource.find(DB_NAME, { start: { $gte: start, $lt: end } });
  }

  async get(id: string): Promise<ScheduleEvent | undefined> {
    return await this.dataSource.get(DB_NAME, { id: id });
  }

  async create(
    eventType: EVENT_TYPE,
    summary: string,
    start: Date,
    end: Date
  ): Promise<ScheduleEvent> {
    return {
      id: this.dataSource.generateUniqueId(),
      eventType: eventType,
      summary: summary,
      start: start,
      end: end,
      updated: new Date(),
    };
  }

  async save(data: ScheduleEvent): Promise<ScheduleEvent> {
    if (!data.id) {
      data.id = this.dataSource.generateUniqueId();
    }
    data.updated = new Date();
    return await this.dataSource.save(DB_NAME, { id: data.id }, data);
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.delete(DB_NAME, { id: id });
  }
}
