import { ILabelService } from '@main/services/ILabelService';
import { Label } from '@shared/data/Label';
import { Page, Pageable } from '@shared/data/Page';

export class LabelServiceMockBuilder {
  private list: jest.MockedFunction<(pageable: Pageable) => Promise<Page<Label>>> = jest.fn();
  private get: jest.MockedFunction<(id: string) => Promise<Label>> = jest.fn();
  private getAll: jest.MockedFunction<(ids: string[]) => Promise<Label[]>> = jest.fn();
  private save: jest.MockedFunction<(label: Label) => Promise<Label>> = jest.fn();
  private delete: jest.MockedFunction<(id: string) => Promise<void>> = jest.fn();
  private bulkDelete: jest.MockedFunction<(ids: string[]) => Promise<void>> = jest.fn();

  constructor() {
    this.getAll.mockResolvedValue([]);
  }

  withList(result: Page<Label>): LabelServiceMockBuilder {
    this.list.mockResolvedValue(result);
    return this;
  }

  withGet(result: Label): LabelServiceMockBuilder {
    this.get.mockResolvedValue(result);
    return this;
  }

  withGetAll(result: Label[]): LabelServiceMockBuilder {
    this.getAll.mockResolvedValue(result);
    return this;
  }

  withSave(result: Label): LabelServiceMockBuilder {
    this.save.mockResolvedValue(result);
    return this;
  }

  withDelete(): LabelServiceMockBuilder {
    this.delete.mockResolvedValue(undefined);
    return this;
  }

  withBulkDelete(): LabelServiceMockBuilder {
    this.bulkDelete.mockResolvedValue(undefined);
    return this;
  }

  build(): ILabelService {
    const mock: ILabelService = {
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
