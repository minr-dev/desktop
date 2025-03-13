import { Page, Pageable } from '@shared/data/Page';
import { PlanPattern } from '@shared/data/PlanPattern';

export interface IPlanPatternService {
  list(pageable: Pageable): Promise<Page<PlanPattern>>;
  get(id: string): Promise<PlanPattern>;
  save(pattern: PlanPattern): Promise<PlanPattern>;
  delete(id: string): Promise<void>;
  bulkDelete(ids: string[]): Promise<void>;
}
