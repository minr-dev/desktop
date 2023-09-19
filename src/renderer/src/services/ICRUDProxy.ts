import { Page, Pageable } from '@shared/data/Page';

export interface ICRUDProxy<T> {
  list(pageable: Pageable): Promise<Page<T>>;
  get(id: string): Promise<T>;
  save(project: T): Promise<void>;
  delete(id: string): Promise<void>;
  bulkDelete(ids: string[]): Promise<void>;
}
