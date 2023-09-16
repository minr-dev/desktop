import { Label } from '@shared/data/Label';
import { Page, Pageable } from '@shared/data/Page';

export interface ILabelProxy {
  list(pageable: Pageable): Promise<Page<Label>>;
  get(id: string): Promise<Label>;
  save(category: Label): Promise<void>;
  delete(id: string): Promise<void>;
  bulkDelete(ids: string[]): Promise<void>;
}
