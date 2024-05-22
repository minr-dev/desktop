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
  ActicityUsageProxy: Symbol.for('ActivityUsageProxy'),
  CalendarSynchronizerProxy: Symbol.for('CalendarSynchronizerProxy'),
  GitHubSynchronizerProxy: Symbol.for('GitHubSynchronizerProxy'),
  CategoryProxy: Symbol.for('CategoryProxy'),
  LabelProxy: Symbol.for('LabelProxy'),
  ProjectProxy: Symbol.for('ProjectProxy'),
  PomodoroTimerProxy: Symbol.for('PomodoroTimer'),

  // service
  SpeakEventSubscriber: Symbol.for('SpeakEventService'),
  NotificationSubscriber: Symbol.for('NotificationService'),
  OverlapEventService: Symbol.for('OverlapEventService'),

  // shared/utils
  DateUtil: Symbol.for('DateUtil'),
};
