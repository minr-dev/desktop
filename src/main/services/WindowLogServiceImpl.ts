import { WindowLog } from '@shared/dto/WindowLog';
import { IWindowLogService } from './IWindowLogService';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { DataSource } from './DataSource';

const DB_NAME = 'windowLog.db';

@injectable()
export class WindowLogServiceImpl implements IWindowLogService {
  constructor(
    @inject(TYPES.DataSource)
    private readonly dataSource: DataSource<WindowLog>
  ) {
    this.dataSource.initDb(DB_NAME, [{ fieldName: 'id', unique: true }]);
  }

  async list(start: Date, end: Date): Promise<WindowLog[]> {
    return await this.dataSource.find(
      DB_NAME,
      { activated: { $gte: start, $lt: end } },
      { activated: 1 }
    );
  }

  async get(id: string): Promise<WindowLog | undefined> {
    return await this.dataSource.get(DB_NAME, { id: id });
  }

  async create(
    basename: string,
    pid: string,
    windowTitle: string,
    path?: string | null
  ): Promise<WindowLog> {
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

  async save(data: WindowLog): Promise<WindowLog> {
    return await this.dataSource.upsert(DB_NAME, { id: data.id }, data);
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.delete(DB_NAME, { id: id });
  }
}
