import { Project } from '@shared/data/Project';
import { Page, Pageable } from '@shared/data/Page';
import { ICRUDProxy } from './ICRUDProxy';

export interface IProjectProxy extends ICRUDProxy<Project> {
  list(pageable: Pageable): Promise<Page<Project>>;
  get(id: string): Promise<Project>;
  save(project: Project): Promise<Project>;
  delete(id: string): Promise<void>;
  bulkDelete(ids: string[]): Promise<void>;
}
