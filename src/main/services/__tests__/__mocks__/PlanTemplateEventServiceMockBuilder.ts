import { jest } from '@jest/globals';
import { IPlanTemplateEventService } from '@main/services/IPlanTemplateEventService';
import { PlanTemplateEvent } from '@shared/data/PlanTemplateEvent';

export class PlanTemplateEventServiceMockBuilder {
  private list: jest.MockedFunction<() => Promise<PlanTemplateEvent[]>> = jest.fn();
  private get: jest.MockedFunction<() => Promise<PlanTemplateEvent>> = jest.fn();
  private bulkUpsert: jest.MockedFunction<() => Promise<PlanTemplateEvent[]>> = jest.fn();
  private bulkDelete: jest.MockedFunction<() => Promise<void>> = jest.fn();

  build(): IPlanTemplateEventService {
    const mock: IPlanTemplateEventService = {
      list: this.list,
      get: this.get,
      bulkUpsert: this.bulkUpsert,
      bulkDelete: this.bulkDelete,
    };
    return mock;
  }
}
