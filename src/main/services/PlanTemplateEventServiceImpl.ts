import { PlanTemplateEvent } from '@shared/data/PlanTemplateEvent';
import { IPlanTemplateEventService } from './IPlanTemplateEventService';
import { TYPES } from '@main/types';
import { inject, injectable } from 'inversify';
import { DataSource } from './DataSource';
import type { IUserDetailsService } from './IUserDetailsService';

@injectable()
export class PlanTemplateEventServiceImpl implements IPlanTemplateEventService {
  constructor(
    @inject(TYPES.DataSource)
    private readonly dataSource: DataSource<PlanTemplateEvent>,
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService
  ) {
    this.dataSource.createDb(this.tableName, [{ fieldName: 'id', unique: true }]);
  }

  get tableName(): string {
    return 'planTemplateEvent.db';
  }

  async list(userId: string, templateId: string): Promise<PlanTemplateEvent[]> {
    const data = await this.dataSource.find(
      this.tableName,
      {
        userId,
        templateId,
      },
      { start: 1 }
    );
    return data;
  }

  async get(id: string): Promise<PlanTemplateEvent> {
    const userId = await this.userDetailsService.getUserId();
    return await this.dataSource.get(this.tableName, { id: id, minr_user_id: userId });
  }

  private async save(event: PlanTemplateEvent): Promise<PlanTemplateEvent> {
    const userId = await this.userDetailsService.getUserId();
    const data = { ...event, minr_user_id: userId };
    if (!data.id || data.id.length === 0) {
      data.id = await this.dataSource.generateUniqueId();
    }
    return await this.dataSource.upsert(this.tableName, data);
  }

  bulkUpsert(events: PlanTemplateEvent[]): Promise<PlanTemplateEvent[]> {
    return Promise.all(events.map((event) => this.save(event)));
  }

  async bulkDelete(ids: string[]): Promise<void> {
    const userId = await this.userDetailsService.getUserId();
    return await this.dataSource.delete(this.tableName, { id: { $in: ids }, minr_user_id: userId });
  }
}
