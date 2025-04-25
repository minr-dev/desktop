import { inject, injectable } from 'inversify';
import { IPlanTemplateApplicationService } from './IPlanTemplateApplicationService';
import { TYPES } from '@main/types';
import type { IPlanTemplateEventService } from './IPlanTemplateEventService';
import { PlanTemplateEvent } from '@shared/data/PlanTemplateEvent';
import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { EventEntryFactory } from './EventEntryFactory';
import { Time } from '@shared/data/Time';
import { addDays, set } from 'date-fns';
import type { IEventEntryService } from './IEventEntryService';

@injectable()
export class PlanTemplateApplicationServiceImpl implements IPlanTemplateApplicationService {
  constructor(
    @inject(TYPES.PlanTemplateEventService)
    private readonly planTemplateEventService: IPlanTemplateEventService,
    @inject(TYPES.EventEntryService)
    private readonly eventEntryService: IEventEntryService
  ) {}
  async applyTemplate(targetDate: Date, templateId: string): Promise<void> {
    const templateEvents = await this.planTemplateEventService.list(templateId);
    const appliedEvents = templateEvents.map((templateEvent) =>
      this.convEventEntry(targetDate, templateEvent)
    );
    await Promise.all(appliedEvents.map((event) => this.eventEntryService.save(event)));
  }

  private convEventEntry(targetDate, templateEvent: PlanTemplateEvent): EventEntry {
    // 時と分だけの時刻データに日付を付与する
    const setTime = (time: Time): Date => {
      const date = set(targetDate, time);
      // targetDateは1日の開始時刻になる想定なので、それよりも後の時刻になるようにする
      return date < targetDate ? addDays(date, 1) : date;
    };
    return EventEntryFactory.create({
      userId: templateEvent.userId,
      eventType: EVENT_TYPE.PLAN,
      summary: templateEvent.summary,
      start: { dateTime: setTime(templateEvent.start) },
      end: { dateTime: setTime(templateEvent.end) },
      description: templateEvent.description,
      projectId: templateEvent.projectId,
      categoryId: templateEvent.categoryId,
      taskId: templateEvent.taskId,
      labelIds: templateEvent.labelIds,
      notificationSetting: templateEvent.notificationSetting,
      isProvisional: false,
    });
  }
}
