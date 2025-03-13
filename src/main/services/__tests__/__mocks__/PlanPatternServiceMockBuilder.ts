import { jest } from '@jest/globals';
import { IPlanPatternService } from '@main/services/IPlanPatternService';
import { Page } from '@shared/data/Page';
import { PlanPattern } from '@shared/data/PlanPattern';

export class PlanPatternServiceMockBuilder {
  private list: jest.MockedFunction<() => Promise<Page<PlanPattern>>> = jest.fn();
  private get: jest.MockedFunction<() => Promise<PlanPattern>> = jest.fn();
  private save: jest.MockedFunction<() => Promise<PlanPattern>> = jest.fn();
  private delete: jest.MockedFunction<() => Promise<void>> = jest.fn();
  private bulkDelete: jest.MockedFunction<() => Promise<void>> = jest.fn();

  build(): IPlanPatternService {
    const mock: IPlanPatternService = {
      list: this.list,
      get: this.get,
      save: this.save,
      delete: this.delete,
      bulkDelete: this.bulkDelete,
    };
    return mock;
  }
}
