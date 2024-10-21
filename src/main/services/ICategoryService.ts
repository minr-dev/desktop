import { Category } from '@shared/data/Category';
import { Page, Pageable } from '@shared/data/Page';

export interface ICategoryService {
  list(pageable: Pageable): Promise<Page<Category>>;
  get(id: string): Promise<Category>;
  getAll(ids: string[]): Promise<Category[]>;
  save(category: Category): Promise<Category>;
  delete(id: string): Promise<void>;
  bulkDelete(ids: string[]): Promise<void>;
}
