import { v4 as uuidv4 } from 'uuid';
import { PlanTemplateEvent } from '@shared/data/PlanTemplateEvent';

export class PlanTemplateEventFactory {
  static create(overlaps: Omit<PlanTemplateEvent, 'id' | 'updated'>): PlanTemplateEvent {
    const updated = new Date();
    return {
      id: uuidv4(),
      updated: updated,
      ...overlaps,
    };
  }
}
