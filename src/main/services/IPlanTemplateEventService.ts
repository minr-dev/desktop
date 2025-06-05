import { PlanTemplateEvent } from '@shared/data/PlanTemplateEvent';

export interface IPlanTemplateEventService {
  list(userId: string, templateId: string): Promise<PlanTemplateEvent[]>;
  get(id: string): Promise<PlanTemplateEvent>;
  bulkUpsert(events: PlanTemplateEvent[]): Promise<PlanTemplateEvent[]>;
  bulkDelete(ids: string[]): Promise<void>;
}
