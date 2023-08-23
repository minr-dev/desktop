import { WindowLog } from '@shared/dto/WindowLog';
import { IWindowLogService } from './IWindowLogService';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { DataSource } from './DataSource';

@injectable()
export class WindowLogServiceImpl implements IWindowLogService {
  constructor(
    @inject(TYPES.DataSource)
    private readonly dataSource: DataSource<WindowLog>
  ) {
    this.dataSource.createDb(this.tableName, [{ fieldName: 'id', unique: true }]);
  }

  get tableName(): string {
    return 'windowLog.db';
  }

  async list(start: Date, end: Date): Promise<WindowLog[]> {
    return await this.dataSource.find(
      this.tableName,
      { activated: { $gte: start, $lt: end } },
      { activated: 1 }
    );
  }

  async get(id: string): Promise<WindowLog | undefined> {
    return await this.dataSource.get(this.tableName, { id: id });
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
    return await this.dataSource.upsert(this.tableName, data);
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.delete(this.tableName, { id: id });
  }
}
