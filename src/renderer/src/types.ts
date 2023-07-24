/**
 * DIコンテナの登録名
 */
export const TYPES = {
  // service
  GoogleAuthProxy: Symbol.for('GoogleAuthProxy'),
  GoogleCalendarProxy: Symbol.for('GoogleCalendarProxy'),
  UserPreferenceProxy: Symbol.for('UserPreferenceProxy'),
  ScheduleEventProxy: Symbol.for('ScheduleEventProxy'),
};
