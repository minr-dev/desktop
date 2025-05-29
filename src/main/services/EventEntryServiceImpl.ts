import { EventEntry } from '@shared/data/EventEntry';
import { IEventEntryService } from './IEventEntryService';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { DataSource } from './DataSource';
import { EventEntryFactory } from './EventEntryFactory';
import { DateUtil } from '@shared/utils/DateUtil';

@injectable()
export class EventEntryServiceImpl implements IEventEntryService {
  constructor(
    @inject(TYPES.DataSource)
    private readonly dataSource: DataSource<EventEntry>,
    @inject(TYPES.DateUtil)
    private readonly dateUtil: DateUtil
  ) {
    this.dataSource.createDb(this.tableName, [{ fieldName: 'id', unique: true }]);
  }

  get tableName(): string {
    return 'eventEntry.db';
  }

  async list(userId: string, start?: Date, end?: Date, eventType?: string): Promise<EventEntry[]> {
    const query = {
      userId: userId,
      'start.dateTime': { $lt: end },
      'end.dateTime': { $gt: start },
      eventType: eventType,
    };
    if (start === undefined) delete (query as Record<string, unknown>)['start.dateTime'];
    if (end === undefined) delete (query as Record<string, unknown>)['end.dateTime'];
    if (eventType === undefined) delete query.eventType;
    const data = await this.dataSource.find(this.tableName, query, { start: 1 });
    return data;
  }

  async get(id: string): Promise<EventEntry | undefined> {
    return await this.dataSource.get(this.tableName, { id: id });
  }

  async save(data: EventEntry): Promise<EventEntry> {
    data.updated = this.dateUtil.getCurrentDate();
    EventEntryFactory.validate(data);
    return await this.dataSource.upsert(this.tableName, data);
  }

  async bulkUpsert(data: EventEntry[]): Promise<EventEntry[]> {
    // TODO: nedbに一括登録・更新を行う機能がないため、ひとまず個別保存で対応するが、DBで一括処理できるようにしたい
    return Promise.all(data.map(this.save.bind(this)));
  }

  async logicalDelete(id: string): Promise<void> {
    const eventEntry = await this.get(id);
    if (!eventEntry) {
      return;
    }
    EventEntryFactory.updateLogicalDelete(eventEntry);
    await this.save(eventEntry);
  }

  async bulkLogicalDelete(ids: string[]): Promise<void> {
    // TODO: nedbに一括更新を行う機能がないため、ひとまず個別の論理削除で対応するが、DBで一括処理できるようにしたい
    Promise.all(ids.map(this.logicalDelete.bind(this)));
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.delete(this.tableName, { id: id });
  }
}
