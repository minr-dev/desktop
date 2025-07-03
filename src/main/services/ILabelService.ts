import { Label } from '@shared/data/Label';
import { Page, Pageable } from '@shared/data/Page';

export interface ILabelService {
  list(pageable: Pageable): Promise<Page<Label>>;
  get(id: string): Promise<Label>;
  getAll(ids: string[]): Promise<Label[]>;
  save(label: Label): Promise<Label>;
  delete(id: string): Promise<void>;
  bulkDelete(ids: string[]): Promise<void>;
}
