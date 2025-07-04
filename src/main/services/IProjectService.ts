import { Project } from '@shared/data/Project';
import { Page, Pageable } from '@shared/data/Page';

export interface IProjectService {
  list(pageable: Pageable): Promise<Page<Project>>;
  get(id: string): Promise<Project>;
  getAll(ids: string[]): Promise<Project[]>;
  save(project: Project): Promise<Project>;
  delete(id: string): Promise<void>;
  bulkDelete(ids: string[]): Promise<void>;
}
