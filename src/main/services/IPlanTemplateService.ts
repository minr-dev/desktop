import { PlanTemplate } from '@shared/data/PlanTemplate';
import { Page, Pageable } from '@shared/data/Page';

export interface IPlanTemplateService {
  list(pageable: Pageable): Promise<Page<PlanTemplate>>;
  get(id: string): Promise<PlanTemplate>;
  save(planTemplate: PlanTemplate): Promise<PlanTemplate>;
  delete(id: string): Promise<void>;
  bulkDelete(ids: string[]): Promise<void>;
}
