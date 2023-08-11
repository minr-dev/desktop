import { EVENT_TYPE, EventEntry } from '@shared/dto/EventEntry';
import { IEventEntryService } from './IEventEntryService';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { DataSource } from './DataSource';

@injectable()
export class EventEntryServiceImpl implements IEventEntryService {
  constructor(
    @inject(TYPES.DataSource)
    private readonly dataSource: DataSource<EventEntry>
  ) {
    this.dataSource.createDb(this.tableName, [{ fieldName: 'id', unique: true }]);
  }

  get tableName(): string {
    return 'eventEntry.db';
  }

  async list(start: Date, end: Date): Promise<EventEntry[]> {
    const data = await this.dataSource.find(
      this.tableName,
      { start: { $gte: start, $lt: end } },
      { start: 1 }
    );
    return data;
  }

  async get(id: string): Promise<EventEntry | undefined> {
    return await this.dataSource.get(this.tableName, { id: id });
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
    return await this.dataSource.upsert(this.tableName, data);
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.delete(this.tableName, { id: id });
  }
}
