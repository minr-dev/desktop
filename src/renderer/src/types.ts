/**
 * DIコンテナの登録名
 */
export const TYPES = {
  // proxy main process
  GoogleAuthProxy: Symbol.for('GoogleAuthProxy'),
  GoogleCalendarProxy: Symbol.for('GoogleCalendarProxy'),
  UserPreferenceProxy: Symbol.for('UserPreferenceProxy'),
  ScheduleEventProxy: Symbol.for('ScheduleEventProxy'),
  ActiveWindowLogProxy: Symbol.for('ActiveWindowLogProxy'),

  // service
  EventService: Symbol.for('EventService'),
};
