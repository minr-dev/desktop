import { inject, injectable } from 'inversify';

import { TYPES } from '@main/types';
import { DataSource } from './DataSource';
import type { IUserDetailsService } from './IUserDetailsService';
import { ICategoryService } from './ICategoryService';
import { Category } from '@shared/data/Category';
import { Page, Pageable } from '@shared/data/Page';
import { UniqueConstraintError } from '@shared/errors/UniqueConstraintError';

/**
 * Categoryを永続化するサービス
 */
@injectable()
export class CategoryServiceImpl implements ICategoryService {
  constructor(
    @inject(TYPES.DataSource)
    private readonly dataSource: DataSource<Category>,
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService
  ) {
    this.dataSource.createDb(this.tableName, [
      { fieldName: 'id', unique: true },
      { fieldName: 'name', unique: true },
    ]);
  }

  get tableName(): string {
    return 'category.db';
  }

  async list(pageable: Pageable): Promise<Page<Category>> {
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
    return new Page<Category>(content, totalElements, pageable);
  }

  async get(id: string): Promise<Category> {
    const userId = await this.userDetailsService.getUserId();
    return await this.dataSource.get(this.tableName, { id: id, minr_user_id: userId });
  }

  async save(category: Category): Promise<Category> {
    const userId = await this.userDetailsService.getUserId();
    const data = { ...category, minr_user_id: userId };
    if (!data.id || data.id.length === 0) {
      data.id = await this.dataSource.generateUniqueId();
    }
    try {
      return await this.dataSource.upsert(this.tableName, data);
    } catch (e) {
      if (this.dataSource.isUniqueConstraintViolated(e)) {
        throw new UniqueConstraintError(
          `Category name must be unique: ${category.name}`,
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
