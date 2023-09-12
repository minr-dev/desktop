import { Category } from '@shared/data/Category';
import { Page, Pageable } from '@shared/data/Page';

export interface ICategoryProxy {
  list(pageable: Pageable): Promise<Page<Category>>;
}
