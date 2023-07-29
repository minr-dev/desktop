import { ActiveWindowLog } from '@shared/dto/ActiveWindowLog';

export interface IActiveWindowLogProxy {
  list(start: Date, end: Date): Promise<ActiveWindowLog[]>;
  get(id: string): Promise<ActiveWindowLog | undefined>;
  save(data: ActiveWindowLog): Promise<ActiveWindowLog>;
}
