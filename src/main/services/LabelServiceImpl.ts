import { inject, injectable } from 'inversify';

import { TYPES } from '@main/types';
import { DataSource } from './DataSource';
import type { IUserDetailsService } from './IUserDetailsService';
import { ILabelService } from './ILabelService';
import { Label } from '@shared/data/Label';
import { Page, Pageable } from '@shared/data/Page';
import { UniqueConstraintError } from '@shared/errors/UniqueConstraintError';
import type { ILoggerFactory } from './ILoggerFactory';

/**
 * Labelを永続化するサービス
 */
@injectable()
export class LabelServiceImpl implements ILabelService {
  private logger;

  constructor(
    @inject(TYPES.DataSource)
    private readonly dataSource: DataSource<Label>,
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService,
    @inject(TYPES.LoggerFactory)
    private readonly loggerFactory: ILoggerFactory
  ) {
    this.dataSource.createDb(this.tableName, [
      { fieldName: 'id', unique: true },
      { fieldName: 'name', unique: true },
    ]);
    this.logger = this.loggerFactory.getLogger({
      processType: 'main',
      loggerName: 'LabelServiceImpl',
    });
  }

  get tableName(): string {
    return 'label.db';
  }

  async list(pageable: Pageable): Promise<Page<Label>> {
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
    return new Page<Label>(content, totalElements, pageable);
  }

  async get(id: string): Promise<Label> {
    const userId = await this.userDetailsService.getUserId();
    return await this.dataSource.get(this.tableName, { id: id, minr_user_id: userId });
  }

  async save(label: Label): Promise<Label> {
    const userId = await this.userDetailsService.getUserId();
    const data = { ...label, minr_user_id: userId };
    if (!data.id || data.id.length === 0) {
      data.id = await this.dataSource.generateUniqueId();
    }
    try {
      return await this.dataSource.upsert(this.tableName, data);
    } catch (e) {
      if (this.dataSource.isUniqueConstraintViolated(e)) {
        this.logger.error(`Label name must be unique: ${label.name}, ${e}`);
        throw new UniqueConstraintError(`Label name must be unique: ${label.name}`, e as Error);
      }
      this.logger.error(`${e}`);
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
}
