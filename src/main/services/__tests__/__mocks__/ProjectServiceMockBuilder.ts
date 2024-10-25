import { IProjectService } from '@main/services/IProjectService';
import { Page, Pageable } from '@shared/data/Page';
import { Project } from '@shared/data/Project';

export class ProjectServiceMockBuilder {
  private list: jest.MockedFunction<(pageable: Pageable) => Promise<Page<Project>>> = jest.fn();
  private get: jest.MockedFunction<(id: string) => Promise<Project>> = jest.fn();
  private getAll: jest.MockedFunction<(ids: string[]) => Promise<Project[]>> = jest.fn();
  private save: jest.MockedFunction<(project: Project) => Promise<Project>> = jest.fn();
  private delete: jest.MockedFunction<(id: string) => Promise<void>> = jest.fn();
  private bulkDelete: jest.MockedFunction<(ids: string[]) => Promise<void>> = jest.fn();

  constructor() {
    this.getAll.mockResolvedValue([]);
  }

  withList(result: Page<Project>): ProjectServiceMockBuilder {
    this.list.mockResolvedValue(result);
    return this;
  }

  withGet(result: Project): ProjectServiceMockBuilder {
    this.get.mockResolvedValue(result);
    return this;
  }

  withGetAll(result: Project[]): ProjectServiceMockBuilder {
    this.getAll.mockResolvedValue(result);
    return this;
  }

  withSave(result: Project): ProjectServiceMockBuilder {
    this.save.mockResolvedValue(result);
    return this;
  }

  withDelete(): ProjectServiceMockBuilder {
    this.delete.mockResolvedValue(undefined);
    return this;
  }

  withBulkDelete(): ProjectServiceMockBuilder {
    this.bulkDelete.mockResolvedValue(undefined);
    return this;
  }

  build(): IProjectService {
    const mock: IProjectService = {
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
