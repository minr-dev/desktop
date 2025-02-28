import { BusinessClassificationUsage } from '../BusinessClassificationUsage';

export class BusinessClassificationUsageFixture {
  static default(override: Partial<BusinessClassificationUsage> = {}): BusinessClassificationUsage {
    return {
      basename: 'test',
      usageTime: 0,
      ...override,
    };
  }
}
