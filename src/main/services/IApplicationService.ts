import { Application } from '@shared/data/Application';
import { Page, Pageable } from '@shared/data/Page';

export interface IApplicationService {
  list(pageable: Pageable): Promise<Page<Application>>;
  get(id: string): Promise<Application>;
  save(Application: Application): Promise<Application>;
  delete(id: string): Promise<void>;
  bulkDelete(ids: string[]): Promise<void>;
  getByName(basename: string): Promise<Application | null>;
}
