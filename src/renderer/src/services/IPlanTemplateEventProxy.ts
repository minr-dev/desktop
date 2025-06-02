import { PlanTemplateEvent } from '@shared/data/PlanTemplateEvent';
import { Time } from '@shared/data/Time';

export interface IPlanTemplateEventProxy {
  list(userId: string, templateId: string): Promise<PlanTemplateEvent[]>;
  get(id: string): Promise<PlanTemplateEvent>;
  bulkUpsert(events: PlanTemplateEvent[]): Promise<PlanTemplateEvent[]>;
  bulkDelete(ids: string[]): Promise<void>;
  create(
    userId: string,
    templateId: string,
    summary: string,
    start: Time,
    end: Time
  ): Promise<PlanTemplateEvent>;
}
