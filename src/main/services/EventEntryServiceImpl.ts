import { EventEntry } from '@shared/data/EventEntry';
import { IEventEntryService } from './IEventEntryService';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { DataSource } from './DataSource';
import { EventEntryFactory } from './EventEntryFactory';

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

  async list(userId: string, start: Date, end: Date): Promise<EventEntry[]> {
    const data = await this.dataSource.find(
      this.tableName,
      {
        userId: userId,
        'start.dateTime': { $lt: end },
        'end.dateTime': { $gte: start },
      },
      { start: 1 }
    );
    return data;
  }

  async get(id: string): Promise<EventEntry | undefined> {
    return await this.dataSource.get(this.tableName, { id: id });
  }

  async save(data: EventEntry): Promise<EventEntry> {
    data.updated = new Date();
    EventEntryFactory.validate(data);
    return await this.dataSource.upsert(this.tableName, data);
  }

  async logicalDelete(id: string): Promise<void> {
    const eventEntry = await this.get(id);
    if (!eventEntry) {
      return;
    }
    EventEntryFactory.updateLogicalDelete(eventEntry);
    await this.save(eventEntry);
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.delete(this.tableName, { id: id });
  }
}
