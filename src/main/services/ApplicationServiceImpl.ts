import { Application } from '@shared/data/Application';
import { IApplicationService } from './IApplicationService';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { DataSource } from './DataSource';
import { Page, Pageable } from '@shared/data/Page';
import type { IUserDetailsService } from './IUserDetailsService';
import { UniqueConstraintError } from '@shared/errors/UniqueConstraintError';

@injectable()
export class ApplicationServiceImpl implements IApplicationService {
  constructor(
    @inject(TYPES.DataSource)
    private readonly dataSource: DataSource<Application>,
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService
  ) {
    this.dataSource.createDb(this.tableName, [
      { fieldName: 'id', unique: true },
      { fieldName: 'basename', unique: true },
    ]);
  }

  get tableName(): string {
    return 'application.db';
  }

  async list(pageable: Pageable): Promise<Page<Application>> {
    const userId = await this.userDetailsService.getUserId();
    const query = { minr_user_id: userId };
    const sort = {};
    if (pageable.sort) {
      sort[pageable.sort.property] = pageable.sort.direction === 'asc' ? 1 : -1;
    }
    const totalElements = await this.dataSource.count(this.tableName, query);
    const content = await this.dataSource.find(
      this.tableName,
      query,
      sort,
      pageable.pageNumber * pageable.pageSize,
      pageable.pageSize
    );
    return new Page<Application>(content, totalElements, pageable);
  }

  async get(id: string): Promise<Application> {
    const userId = await this.userDetailsService.getUserId();
    return await this.dataSource.get(this.tableName, { id: id, minr_user_id: userId });
  }

  async save(Application: Application): Promise<Application> {
    const userId = await this.userDetailsService.getUserId();
    const data = { ...Application, minr_user_id: userId };
    if (!data.id || data.id.length === 0) {
      data.id = await this.dataSource.generateUniqueId();
    }
    try {
      return await this.dataSource.upsert(this.tableName, data);
    } catch (e) {
      if (this.dataSource.isUniqueConstraintViolated(e)) {
        throw new UniqueConstraintError(
          `Application basename must be unique: ${Application.basename}`,
          e as Error
        );
      }
      throw e;
    }
  }

  async delete(id: string): Promise<void> {
    const userId = await this.userDetailsService.getUserId();
    return await this.dataSource.delete(this.tableName, { id: id, minr_user_id: userId });
  }

  async bulkDelete(ids: string[]): Promise<void> {
    const userId = await this.userDetailsService.getUserId();
    return await this.dataSource.delete(this.tableName, { id: { $in: ids }, minr_user_id: userId });
  }

  async getByName(basename: string): Promise<Application> {
    const userId = await this.userDetailsService.getUserId();
    return await this.dataSource.get(this.tableName, { basename: basename, minr_user_id: userId });
  }
}
