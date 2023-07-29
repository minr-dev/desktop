import { ActiveWindowLog } from '@shared/dto/ActiveWindowLog';

export interface IActiveWindowLogService {
  list(start: Date, end: Date): Promise<ActiveWindowLog[]>;
  get(id: string): Promise<ActiveWindowLog | undefined>;
  create(basename: string, pid: string, title: string, path: string): Promise<ActiveWindowLog>;
  save(data: ActiveWindowLog): Promise<ActiveWindowLog>;
  delete(id: string): Promise<void>;
}
