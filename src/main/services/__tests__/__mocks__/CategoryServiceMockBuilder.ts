import { ICategoryService } from '@main/services/ICategoryService';
import { Category } from '@shared/data/Category';
import { Page, Pageable } from '@shared/data/Page';

export class CategoryServiceMockBuilder {
  private list: jest.MockedFunction<(pageable: Pageable) => Promise<Page<Category>>> = jest.fn();
  private get: jest.MockedFunction<(id: string) => Promise<Category>> = jest.fn();
  private getAll: jest.MockedFunction<(ids: string[]) => Promise<Category[]>> = jest.fn();
  private save: jest.MockedFunction<(category: Category) => Promise<Category>> = jest.fn();
  private delete: jest.MockedFunction<(id: string) => Promise<void>> = jest.fn();
  private bulkDelete: jest.MockedFunction<(ids: string[]) => Promise<void>> = jest.fn();

  constructor() {
    this.getAll.mockResolvedValue([]);
  }

  withList(result: Page<Category>): CategoryServiceMockBuilder {
    this.list.mockResolvedValue(result);
    return this;
  }

  withGet(result: Category): CategoryServiceMockBuilder {
    this.get.mockResolvedValue(result);
    return this;
  }

  withGetAll(result: Category[]): CategoryServiceMockBuilder {
    this.getAll.mockResolvedValue(result);
    return this;
  }

  withSave(result: Category): CategoryServiceMockBuilder {
    this.save.mockResolvedValue(result);
    return this;
  }

  withDelete(): CategoryServiceMockBuilder {
    this.delete.mockResolvedValue(undefined);
    return this;
  }

  withBulkDelete(): CategoryServiceMockBuilder {
    this.bulkDelete.mockResolvedValue(undefined);
    return this;
  }

  build(): ICategoryService {
    const mock: ICategoryService = {
      list: this.list,
      get: this.get,
      getAll: this.getAll,
      save: this.save,
      delete: this.delete,
      bulkDelete: this.bulkDelete,
    };
    return mock;
  }
}
