import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import type { IUserDetailsService } from './IUserDetailsService';
import type { IEventEntryService } from './IEventEntryService';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { addDays, addMilliseconds, set } from 'date-fns';
import type { IUserPreferenceStoreService } from './IUserPreferenceStoreService';
import { IPlanAvailableTimeSlotService } from './IPlanAvailableTimeSlotService';
import { TimeSlot } from '@shared/data/TimeSlot';
import { Time } from '@shared/data/Time';

/**
 * 予定を入れられる時間帯を計算するサービスクラス。
 * ユーザー設定から1日の作業開始時刻、1日の作業時間、休憩時間帯を取得し、作業時間帯を計算する。
 * 作業時間帯から既に予定として登録されている時間帯と休憩の時間帯を抽出し、残った時間を空き時間帯として返す。
 * @see PlanAutoRegistrationServiceImpl
 */
@injectable()
export class PlanAvailableTimeSlotServiceImpl implements IPlanAvailableTimeSlotService {
  constructor(
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService,
    @inject(TYPES.UserPreferenceStoreService)
    private readonly userPreferenceStoreService: IUserPreferenceStoreService,
    @inject(TYPES.EventEntryService)
    private readonly eventEntryService: IEventEntryService
  ) {}
  async calculateAvailableTimeSlot(targetDate: Date): Promise<TimeSlot<Date>[]> {
    const userId = await this.userDetailsService.getUserId();
    const userPreference = await this.userPreferenceStoreService.get(userId);
    if (userPreference == null) {
      throw new Error('userPreference was not found.');
    }
    const startWorkTime = userPreference.dailyWorkStartTime;
    const businessTime = userPreference.dailyWorkHours * 60 * 60 * 1000;
    const breakTimeSlots = this.convertTimeSlotsToDateTimeSlots(
      targetDate,
      userPreference.dailyBreakTimeSlots
    );
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

  private convertTimeSlotsToDateTimeSlots(
    targetDate: Date,
    timeSlots: TimeSlot<Time>[]
  ): TimeSlot<Date>[] {
    // 時と分だけの時刻データに日付を付与する
    const setTime = (time: Time): Date => {
      const date = set(targetDate, time);
      // targetDateは1日の開始時刻になる想定なので、それよりも後の時刻になるようにする
      return date < targetDate ? addDays(date, 1) : date;
    };

    const dateTimeSlots: TimeSlot<Date>[] = [];
    for (const timeSlot of timeSlots) {
      const start = setTime(timeSlot.start);
      const end = setTime(timeSlot.end);
      // 1日の開始時刻をまたぐときは2つに分割する
      const slots =
        start < end
          ? [{ start, end }]
          : [
              { start: targetDate, end },
              { start, end: addDays(targetDate, 1) },
            ];
      dateTimeSlots.push(...slots);
    }
    return dateTimeSlots;
  }

  /**
   * @returns start から end までの間で、timeSlots に重ならない時間帯
   *
   * ex) start = 10:00, end = 19:00, timeSlots = [12:00~13:00, 15:00~16:00] の場合
   *     [10:00~12:00, 13:00~15:00, 16:00~19:00] が返される
   */
  private calculateFreeSlot(timeSlots: TimeSlot<Date>[], start: Date, end: Date): TimeSlot<Date>[] {
    // あらかじめtimeSlotsを早い順にソートしておくことで、後の計算がシンプルになる
    const sortedTimeSlots = [...timeSlots]
      .filter((slot) => start < slot.end && slot.start < end)
      .sort((s1, s2) => {
        return s1.start.getTime() - s2.start.getTime();
      });

    // 空き時間帯の開始時刻の候補
    // sortedTimeSlotsの時間帯を確認して、重なっていたら更新する
    let currentStart = start;
    const mergedTimeSlots: TimeSlot<Date>[] = [];
    for (const timeSlot of sortedTimeSlots) {
      if (timeSlot.end < currentStart) {
        // このtimeSlotは計算中の空き時間帯に影響しないのでスキップする
        continue;
      }
      if (timeSlot.start <= currentStart) {
        // timeSlot.start <= currentStart <= timeSlot.end の状態
        // currentStartの位置が空き時間帯ではないため、currentStartを更新する。
        currentStart = timeSlot.end;
        continue;
      }
      // currentStart < timeSlot.start の状態
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
