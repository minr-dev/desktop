import { Application } from '@shared/data/Application';
import { Page, Pageable } from '@shared/data/Page';

export interface IApplicationProxy {
  list(pageable: Pageable): Promise<Page<Application>>;
  get(id: string): Promise<Application>;
  save(application: Application): Promise<Application>;
  delete(id: string): Promise<void>;
  bulkDelete(ids: string[]): Promise<void>;
  getByName(basename: string): Promise<Application | null>;
}
