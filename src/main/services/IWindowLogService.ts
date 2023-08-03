import { WindowLog } from '@shared/dto/WindowLog';

export interface IWindowLogService {
  list(start: Date, end: Date): Promise<WindowLog[]>;
  get(id: string): Promise<WindowLog | undefined>;
  create(basename: string, pid: string, title: string, path?: string | null): Promise<WindowLog>;
  save(data: WindowLog): Promise<WindowLog>;
  delete(id: string): Promise<void>;
}
