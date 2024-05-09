import { ActivityUsage } from '@shared/data/ActivityUsage';

export interface IActivityUsageProxy {
  get(start: Date, end: Date): Promise<ActivityUsage[]>;
}
