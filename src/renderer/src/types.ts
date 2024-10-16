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
  ActualAutoRegistrationProxy: Symbol.for('ActualAutoRegistrationProxy'),
  CalendarSynchronizerProxy: Symbol.for('CalendarSynchronizerProxy'),
  GitHubSynchronizerProxy: Symbol.for('GitHubSynchronizerProxy'),
  CategoryProxy: Symbol.for('CategoryProxy'),
  LabelProxy: Symbol.for('LabelProxy'),
  ProjectProxy: Symbol.for('ProjectProxy'),
  TaskProxy: Symbol.for('TaskProxy'),
  PatternProxy: Symbol.for('PatternProxy'),

  // service
  SpeakEventSubscriber: Symbol.for('SpeakEventService'),
  DesktopNotificationSubscriber: Symbol.for('DesktopNotificationService'),
  OverlapEventService: Symbol.for('OverlapEventService'),
  AutoRegisterActualService: Symbol.for('AutoRegisterActualService'),

  // shared/utils
  TimerManager: Symbol.for('TimerManager'),
  DateUtil: Symbol.for('DateUtil'),
};
