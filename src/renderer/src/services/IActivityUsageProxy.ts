import { ActivityUsageData } from './IActivityCalclateService';

export interface IActivityUsageProxy {
  get(start: Date, end: Date): Promise<ActivityUsageData[]>;
}
