import { ActivityUsage } from '@shared/data/ActivityUsage';

export interface IActivityUsageService {
  get(start: Date, end: Date): Promise<ActivityUsage[]>;
}
