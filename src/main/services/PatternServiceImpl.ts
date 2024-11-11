import { Pattern } from '@shared/data/Pattern';
import { IPatternService } from './IPatternService';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { DataSource } from './DataSource';
import { Page, Pageable } from '@shared/data/Page';
import type { IUserDetailsService } from './IUserDetailsService';
import { UniqueConstraintError } from '@shared/errors/UniqueConstraintError';

@injectable()
export class PatternServiceImpl implements IPatternService {
  constructor(
    @inject(TYPES.DataSource)
    private readonly dataSource: DataSource<Pattern>,
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService
  ) {
    this.dataSource.createDb(this.tableName, [
      { fieldName: 'id', unique: true },
      { fieldName: 'name', unique: true },
    ]);
  }

  get tableName(): string {
    return 'pattern.db';
  }

  async list(pageable: Pageable): Promise<Page<Pattern>> {
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
    return new Page<Pattern>(content, totalElements, pageable);
  }

  async get(id: string): Promise<Pattern> {
    const userId = await this.userDetailsService.getUserId();
    return await this.dataSource.get(this.tableName, { id: id, minr_user_id: userId });
  }

  async save(pattern: Pattern): Promise<Pattern> {
    const userId = await this.userDetailsService.getUserId();
    const data = { ...pattern, minr_user_id: userId };
    if (!data.id || data.id.length === 0) {
      data.id = await this.dataSource.generateUniqueId();
    }
    try {
      return await this.dataSource.upsert(this.tableName, data);
    } catch (e) {
      if (this.dataSource.isUniqueConstraintViolated(e)) {
        throw new UniqueConstraintError(
          `Pattern basename must be unique: ${pattern.basename}`,
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
}
