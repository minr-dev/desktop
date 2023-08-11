import { ActivityColor } from '@shared/dto/ActivityColor';

export interface IActivityColorService {
  get(appPath: string): Promise<ActivityColor | null>;
  create(appPath: string): Promise<ActivityColor>;
  getOrCreate(appPath: string): Promise<ActivityColor>;
  save(data: ActivityColor): Promise<ActivityColor>;
}
