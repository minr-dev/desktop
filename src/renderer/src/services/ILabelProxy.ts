import { Label } from '@shared/data/Label';
import { Page, Pageable } from '@shared/data/Page';
import { ICRUDProxy } from './ICRUDProxy';

export interface ILabelProxy extends ICRUDProxy<Label> {
  list(pageable: Pageable): Promise<Page<Label>>;
  get(id: string): Promise<Label>;
  save(label: Label): Promise<void>;
  delete(id: string): Promise<void>;
  bulkDelete(ids: string[]): Promise<void>;
}
