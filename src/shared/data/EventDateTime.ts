/**
 * EventDateTime は、開始時間と終了時間のペアか、一日全体の予定がある。
 * date と dateTime のどちらか一方は必須。
 */
export interface EventDateTime {
  date?: Date | null;
  dateTime?: Date | null;
}

export const eventDateTimeToDate = (dt: EventDateTime): Date => {
  if (dt.dateTime) {
    return dt.dateTime;
  }
  if (dt.date) {
    return dt.date;
  }
  throw new Error('date or dateTime is required');
};
