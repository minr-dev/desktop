import { jest } from '@jest/globals';
import { ActivityColor } from '@shared/dto/ActivityColor';
import { IActivityColorService } from '../../IActivityColorService';

export class ActivityColorServiceMockBuilder {
  private get: jest.MockedFunction<(appPath: string) => Promise<ActivityColor | null>> = jest.fn();
  private create: jest.MockedFunction<(appPath: string) => Promise<ActivityColor>> = jest.fn();
  private getOrCreate: jest.MockedFunction<(appPath: string) => Promise<ActivityColor>> = jest.fn();
  private save: jest.MockedFunction<(ActivityColor: ActivityColor) => Promise<ActivityColor>> =
    jest.fn();

  constructor() {
    this.get.mockResolvedValue(null);
  }

  withGet(result: ActivityColor | null): ActivityColorServiceMockBuilder {
    this.get.mockResolvedValue(result);
    return this;
  }

  withCreate(result: ActivityColor): ActivityColorServiceMockBuilder {
    this.create.mockResolvedValue(result);
    return this;
  }

  withGetOrCreate(result: ActivityColor): ActivityColorServiceMockBuilder {
    this.getOrCreate.mockResolvedValue(result);
    return this;
  }

  withSave(result: ActivityColor): ActivityColorServiceMockBuilder {
    this.save.mockResolvedValue(result);
    return this;
  }

  build(): IActivityColorService {
    const mock: IActivityColorService = {
      get: this.get,
      create: this.create,
      getOrCreate: this.getOrCreate,
      save: this.save,
    };
    return mock;
  }
}
