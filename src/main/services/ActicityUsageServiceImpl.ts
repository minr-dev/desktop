import { inject, injectable } from 'inversify';
import { IActivityUsageService } from './IActivityUsageService';
import { TYPES } from '@main/types';
import type { IActivityService } from './IActivityService';
import { ActivityUsage } from '@shared/data/ActivityUsage';

@injectable()
export class ActivityUsageServiceImpl implements IActivityUsageService {
  constructor(
    @inject(TYPES.ActivityService)
    private readonly activityService: IActivityService
  ) {}
  async get(startDate: Date, endDate: Date): Promise<ActivityUsage[]> {
    const activityEvents = await this.activityService.fetchActivities(startDate, endDate);
    const eventDataArray = new Map<string, ActivityUsage>();
    for (const event of activityEvents) {
      const start = event.start > startDate ? event.start : startDate;
      const end = event.end < endDate ? event.end : endDate;
      const usageTime = end.getTime() - start.getTime();
      const usageData = eventDataArray.get(event.basename);
      if (!usageData) {
        eventDataArray.set(event.basename, {
          basename: event.basename,
          color: event.appColor,
          usageTime: usageTime,
        });
      } else {
        usageData.usageTime += usageTime;
      }
    }
    return Array.from(eventDataArray.values()).sort((e1, e2) => {
      return e2.usageTime - e1.usageTime;
    });
  }
}
