import { Pattern } from '@shared/data/Pattern';
import { Page, Pageable } from '@shared/data/Page';

export interface IPatternProxy {
  list(pageable: Pageable): Promise<Page<Pattern>>;
  get(id: string): Promise<Pattern>;
  save(pattern: Pattern): Promise<Pattern>;
  delete(id: string): Promise<void>;
  bulkDelete(ids: string[]): Promise<void>;
}
