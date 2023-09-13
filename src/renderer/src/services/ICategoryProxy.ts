import { Category } from '@shared/data/Category';
import { Page, Pageable } from '@shared/data/Page';

export interface ICategoryProxy {
  list(pageable: Pageable): Promise<Page<Category>>;
  get(id: string): Promise<Category>;
  save(category: Category): Promise<void>;
  delete(id: string): Promise<void>;
  bulkDelete(ids: string[]): Promise<void>;
}
