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
  PlanAutoRegistrationProxy: Symbol.for('PlanAutoRegistrationProxy'),
  CalendarSynchronizerProxy: Symbol.for('CalendarSynchronizerProxy'),
  GitHubSynchronizerProxy: Symbol.for('GitHubSynchronizerProxy'),
  AutoLaunchProxy: Symbol.for('AutoLaunchProxy'),
  CategoryProxy: Symbol.for('CategoryProxy'),
  LabelProxy: Symbol.for('LabelProxy'),
  ProjectProxy: Symbol.for('ProjectProxy'),
  TaskProxy: Symbol.for('TaskProxy'),
  PatternProxy: Symbol.for('PatternProxy'),
  PlanAndActualCsvProxy: Symbol.for('PlanAndActualCsvProxy'),
  PlanPatternProxy: Symbol.for('PlanPatternProxy'),
  PlanTemplateProxy: Symbol.for('PlanTemplateProxy'),
  PlanTemplateEventProxy: Symbol.for('PlanTemplateEventProxy'),
  PlanTemplateApplyProxy: Symbol.for('PlanTemplateApplyProxy'),
  GitHubProjectV2Proxy: Symbol.for('GitHubProjectV2Proxy'),
  GitHubProjectV2SyncProxy: Symbol.for('GitHubProjectV2SyncProxy'),
  GitHubTaskSyncProxy: Symbol.for('GitHubTaskSyncProxy'),
  EventAggregationProxy: Symbol.for('EventAggregationProxy'),

  // service
  SpeakEventSubscriber: Symbol.for('SpeakEventService'),
  DesktopNotificationSubscriber: Symbol.for('DesktopNotificationService'),
  OverlapEventService: Symbol.for('OverlapEventService'),
  AutoRegisterActualService: Symbol.for('AutoRegisterActualService'),
  CreateAnalysisTableDataService: Symbol.for('CreateAnalysisTableDataService'),

  LoggerFactory: Symbol.for('LoggerFactory'),
  LoggerProxy: Symbol.for('LoggerProxy'),

  // shared/utils
  TimerManager: Symbol.for('TimerManager'),
  DateUtil: Symbol.for('DateUtil'),
};
