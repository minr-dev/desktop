import { jest } from '@jest/globals';
import { IPatternService } from '@main/services/IPatternService';
import { Page } from '@shared/data/Page';
import { Pattern } from '@shared/data/Pattern';

export class PatternServiceMockBuilder {
  private list: jest.MockedFunction<() => Promise<Page<Pattern>>> = jest.fn();
  private get: jest.MockedFunction<() => Promise<Pattern>> = jest.fn();
  private save: jest.MockedFunction<() => Promise<Pattern>> = jest.fn();
  private delete: jest.MockedFunction<() => Promise<void>> = jest.fn();
  private bulkDelete: jest.MockedFunction<() => Promise<void>> = jest.fn();

  build(): IPatternService {
    const mock: IPatternService = {
      list: this.list,
      get: this.get,
      save: this.save,
      delete: this.delete,
      bulkDelete: this.bulkDelete,
    };
    return mock;
  }
}
