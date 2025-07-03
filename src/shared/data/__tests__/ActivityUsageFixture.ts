import { ActivityUsage } from '../ActivityUsage';

export class ActivityUsageFixture {
  static default(override: Partial<ActivityUsage> = {}): ActivityUsage {
    return {
      basename: 'test.exe',
      color: '#888888',
      usageTime: 0,
      ...override,
    };
  }
}
