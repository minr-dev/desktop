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
  CategoryProxy: Symbol.for('CategoryProxy'),
  LabelProxy: Symbol.for('LabelProxy'),
  ProjectProxy: Symbol.for('ProjectProxy'),

  // service
  SpeakEventSubscriber: Symbol.for('SpeakEventService'),
  OverlapEventService: Symbol.for('OverlapEventService'),

  // shared/utils
  DateUtil: Symbol.for('DateUtil'),
};
