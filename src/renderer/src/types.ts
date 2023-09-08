/**
 * DIコンテナの登録名
 */
export const TYPES = {
  // proxy main process
  UserDetailsProxy: Symbol.for('UserDetailsProxy'),
  GoogleAuthProxy: Symbol.for('GoogleAuthProxy'),
  GitHubAuthProxy: Symbol.for('GitHubAuthProxy'),
  GoogleCalendarProxy: Symbol.for('GoogleCalendarProxy'),
  UserPreferenceProxy: Symbol.for('UserPreferenceProxy'),
  EventEntryProxy: Symbol.for('EventEntryProxy'),
  ActivityEventProxy: Symbol.for('ActivityEventProxy'),
  GitHubEventProxy: Symbol.for('GitHubEventProxy'),
  CalendarSynchronizerProxy: Symbol.for('CalendarSynchronizerProxy'),
  GitHubSynchronizerProxy: Symbol.for('GitHubSynchronizerProxy'),

  // service
  SpeakEventService: Symbol.for('SpeakEventService'),
  OverlapEventService: Symbol.for('OverlapEventService'),
};
