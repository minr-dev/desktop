/**
 * DIコンテナの登録名
 */
export const TYPES = {
  // proxy main process
  UserDetailsProxy: Symbol.for('UserDetailsProxy'),
  GoogleAuthProxy: Symbol.for('GoogleAuthProxy'),
  GithubAuthProxy: Symbol.for('GithubAuthProxy'),
  GoogleCalendarProxy: Symbol.for('GoogleCalendarProxy'),
  UserPreferenceProxy: Symbol.for('UserPreferenceProxy'),
  EventEntryProxy: Symbol.for('EventEntryProxy'),
  ActivityEventProxy: Symbol.for('ActivityEventProxy'),
  CalendarSynchronizerProxy: Symbol.for('CalendarSynchronizerProxy'),

  // service
  SpeakEventService: Symbol.for('SpeakEventService'),
  OverlapEventService: Symbol.for('OverlapEventService'),
};
