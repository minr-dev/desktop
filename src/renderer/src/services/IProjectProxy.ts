import { Project } from '@shared/data/Project';
import { Page, Pageable } from '@shared/data/Page';

export interface IProjectProxy {
  list(pageable: Pageable): Promise<Page<Project>>;
  get(id: string): Promise<Project>;
  save(project: Project): Promise<void>;
  delete(id: string): Promise<void>;
  bulkDelete(ids: string[]): Promise<void>;
}