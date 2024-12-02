import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import type { IUserDetailsService } from './IUserDetailsService';
import type { IEventEntryService } from './IEventEntryService';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { addDays, addMilliseconds, set } from 'date-fns';
import type { IUserPreferenceStoreService } from './IUserPreferenceStoreService';
import { IFreeTimeSlotService } from './IFreeTimeSlotService';
import { TimeSlot } from '@shared/data/TimeSlot';
import { Time } from '@shared/data/Time';

@injectable()
export class PlanAvailableTimeSlotServiceImpl implements IFreeTimeSlotService {
  constructor(
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService,
    @inject(TYPES.UserPreferenceStoreService)
    private readonly userPreferenceStoreService: IUserPreferenceStoreService,
    @inject(TYPES.EventEntryService)
    private readonly eventEntryService: IEventEntryService
  ) {}
  async calculateFreeTimeSlot(targetDate: Date): Promise<TimeSlot<Date>[]> {
    const userId = await this.userDetailsService.getUserId();
    const userPreference = await this.userPreferenceStoreService.get(userId);
    if (userPreference == null) {
      throw new Error('userPreference was not found.');
    }
    const startWorkTime = userPreference.dailyWorkStartTime;
    const businessTime = userPreference.dailyWorkHours * 60 * 60 * 1000;
    const breakTimeSlots: TimeSlot<Date>[] = [];
    const setTime = (time: Time): Date => {
      const date = set(targetDate, time);
      return date < targetDate ? addDays(date, 1) : date;
    };
    for (const breakTimeSlot of userPreference.dailyBreakTimeSlots) {
      const start = setTime(breakTimeSlot.start);
      const end = setTime(breakTimeSlot.end);
      // 1日の開始時刻をまたぐときは2つに分割する
      const slots =
        start < end
          ? [{ start, end }]
          : [
              { start: targetDate, end },
              { start, end: addDays(targetDate, 1) },
            ];
      breakTimeSlots.push(...slots);
    }
    const breakTime = breakTimeSlots
      .map((b) => b.end.getTime() - b.start.getTime())
      .reduce((acc, time) => acc + time, 0);
    const start = set(targetDate, startWorkTime);
    const end = addMilliseconds(start, businessTime + breakTime);
    const planTimeSlots = (await this.eventEntryService.list(userId, start, end))
      .filter(
        (event) => event.eventType === EVENT_TYPE.PLAN || event.eventType === EVENT_TYPE.SHARED
      )
      .filter(
        (event) => !event.deleted && event.start.dateTime != null && event.end.dateTime != null
      )
      .map((event): TimeSlot<Date> => {
        if (event.start.dateTime == null || event.end.dateTime == null) {
          throw new Error('start.dateTime and end.dateTime must not be null.');
        }
        return { start: event.start.dateTime, end: event.end.dateTime };
      });
    return this.calculateFreeSlot([...planTimeSlots, ...breakTimeSlots], start, end);
  }

  private calculateFreeSlot(timeSlots: TimeSlot<Date>[], start: Date, end: Date): TimeSlot<Date>[] {
    const sortedTimeSlots = [...timeSlots]
      .filter((slot) => start < slot.end && slot.start < end)
      .sort((s1, s2) => {
        return s1.start.getTime() - s2.start.getTime();
      });

    let currentStart = start;
    const mergedTimeSlots: TimeSlot<Date>[] = [];
    for (const timeSlot of sortedTimeSlots) {
      if (timeSlot.end < currentStart) {
        continue;
      }
      if (timeSlot.start <= currentStart) {
        // timeSlot.start <= currentStart <= timeSlot.end の状態
        // currentStartからtimeSlot.endの間に空き時間ではないので、currentStartを更新する。
        currentStart = timeSlot.end;
        continue;
      }
      // currenStart < timeSlot.start の状態
      // timeSlot.start を早い順に並べているので、空き時間がこれで確定する
      const slot = { start: currentStart, end: timeSlot.start };
      mergedTimeSlots.push(slot);
      currentStart = timeSlot.end;
    }
    if (currentStart < end) {
      const slot = { start: currentStart, end: end };
      mergedTimeSlots.push(slot);
    }
    return mergedTimeSlots;
  }
}
