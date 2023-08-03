import { EVENT_TYPE, EventEntry } from '@shared/dto/EventEntry';
import { IEventEntryService } from './IEventEntryService';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { DataSource } from './DataSource';

const DB_NAME = 'eventEntry.db';

@injectable()
export class EventEntryServiceImpl implements IEventEntryService {
  constructor(
    @inject(TYPES.DataSource)
    private readonly dataSource: DataSource<EventEntry>
  ) {
    this.dataSource.initDb(DB_NAME, [{ fieldName: 'id', unique: true }]);
  }

  async list(start: Date, end: Date): Promise<EventEntry[]> {
    const data = await this.dataSource.find(
      DB_NAME,
      { start: { $gte: start, $lt: end } },
      { start: 1 }
    );
    return data;
  }

  async get(id: string): Promise<EventEntry | undefined> {
    return await this.dataSource.get(DB_NAME, { id: id });
  }

  async create(
    eventType: EVENT_TYPE,
    summary: string,
    start: Date,
    end: Date
  ): Promise<EventEntry> {
    return {
      id: this.dataSource.generateUniqueId(),
      eventType: eventType,
      summary: summary,
      start: start,
      end: end,
      updated: new Date(),
    };
  }

  async save(data: EventEntry): Promise<EventEntry> {
    data.updated = new Date();
    return await this.dataSource.upsert(DB_NAME, { id: data.id }, data);
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.delete(DB_NAME, { id: id });
  }
}
