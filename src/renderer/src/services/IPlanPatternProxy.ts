import { PlanPattern } from '@shared/data/PlanPattern';
import { Page, Pageable } from '@shared/data/Page';

export interface IPlanPatternProxy {
  list(pageable: Pageable): Promise<Page<PlanPattern>>;
  get(id: string): Promise<PlanPattern>;
  save(planPattern: PlanPattern): Promise<PlanPattern>;
  delete(id: string): Promise<void>;
  bulkDelete(ids: string[]): Promise<void>;
}
