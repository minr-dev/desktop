import { ActivityColor } from '@shared/data/ActivityColor';

export interface IActivityColorService {
  get(appPath: string): Promise<ActivityColor | null>;
  create(appPath: string): Promise<ActivityColor>;
  getOrCreate(appPath: string): Promise<ActivityColor>;
  save(data: ActivityColor): Promise<ActivityColor>;
}
