import { ActiveWindowLog } from '@shared/dto/ActiveWindowLog';
import { IActiveWindowLogService } from './IActiveWindowLogService';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { DataSource } from './DataSource';

const DB_NAME = 'activeWindowLog.db';

@injectable()
export class ActiveWindowLogServiceImpl implements IActiveWindowLogService {
  constructor(
    @inject(TYPES.DataSource)
    private readonly dataSource: DataSource<ActiveWindowLog>
  ) {
    this.dataSource.initDb(DB_NAME, [{ fieldName: 'id', unique: true }]);
  }

  async list(start: Date, end: Date): Promise<ActiveWindowLog[]> {
    return await this.dataSource.find(
      DB_NAME,
      { activated: { $gte: start, $lt: end } },
      { activated: 1 }
    );
  }

  async get(id: string): Promise<ActiveWindowLog | undefined> {
    return await this.dataSource.get(DB_NAME, { id: id });
  }

  async create(
    basename: string,
    pid: string,
    windowTitle: string,
    path: string
  ): Promise<ActiveWindowLog> {
    const now = new Date();
    return {
      id: this.dataSource.generateUniqueId(),
      basename: basename,
      pid: pid,
      windowTitle: windowTitle,
      path: path,
      activated: now,
      deactivated: now,
    };
  }

  async save(data: ActiveWindowLog): Promise<ActiveWindowLog> {
    return await this.dataSource.upsert(DB_NAME, { id: data.id }, data);
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.delete(DB_NAME, { id: id });
  }
}
