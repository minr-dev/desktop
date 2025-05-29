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
import { TimeSlot } from '@shared/data/TimeSlot';
import type { IUserDetailsService } from './IUserDetailsService';

@injectable()
export class PlanTemplateApplicationServiceImpl implements IPlanTemplateApplicationService {
  constructor(
    @inject(TYPES.PlanTemplateEventService)
    private readonly planTemplateEventService: IPlanTemplateEventService,
    @inject(TYPES.EventEntryService)
    private readonly eventEntryService: IEventEntryService,
    @inject(TYPES.UserDetailsService)
    private readonly userDetailService: IUserDetailsService
  ) {}
  async applyTemplate(targetDate: Date, templateId: string): Promise<void> {
    const userId = await this.userDetailService.getUserId();
    const templateEvents = (await this.planTemplateEventService.list(userId, templateId)).filter(
      (templateEvent) => !templateEvent.deleted
    );
    const appliedEvents = templateEvents.flatMap((templateEvent) =>
      this.convEventEntry(targetDate, templateEvent)
    );
    await Promise.all(appliedEvents.map((event) => this.eventEntryService.save(event)));
  }

  private convTimeSlotToDateTimeSlots(
    targetDate: Date,
    timeSlot: TimeSlot<Time>
  ): TimeSlot<Date>[] {
    // 時と分だけの時刻データに日付を付与する
    const setTime = (time: Time): Date => {
      const date = set(targetDate, time);
      // targetDateは1日の開始時刻になる想定なので、それよりも後の時刻になるようにする
      return date < targetDate ? addDays(date, 1) : date;
    };

    const start = setTime(timeSlot.start);
    const end = setTime(timeSlot.end);
    if (start < end) {
      return [{ start, end }];
    } else {
      // 1日の開始時刻をまたぐときは2つに分割する
      return [
        { start: targetDate, end },
        { start, end: addDays(targetDate, 1) },
      ];
    }
  }

  private convEventEntry(targetDate: Date, templateEvent: PlanTemplateEvent): EventEntry[] {
    const dateTimeSlots = this.convTimeSlotToDateTimeSlots(targetDate, {
      start: templateEvent.start,
      end: templateEvent.end,
    });

    return dateTimeSlots.map(({ start, end }) =>
      EventEntryFactory.create({
        userId: templateEvent.userId,
        eventType: EVENT_TYPE.PLAN,
        summary: templateEvent.summary,
        start: { dateTime: start },
        end: { dateTime: end },
        description: templateEvent.description,
        projectId: templateEvent.projectId,
        categoryId: templateEvent.categoryId,
        taskId: templateEvent.taskId,
        labelIds: templateEvent.labelIds,
        notificationSetting: templateEvent.notificationSetting,
        isProvisional: false,
      })
    );
  }
}
