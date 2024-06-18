/**
 * DIコンテナの登録名
 */
export const TYPES = {
  // usecase

  // domain/service
  UserDetailsService: Symbol.for('UserDetailsService'),
  GoogleAuthService: Symbol.for('GoogleAuthService'),
  GoogleCalendarService: Symbol.for('GoogleCalendarService'),
  GoogleCredentialsStoreService: Symbol.for('GoogleCredentialsStoreService'),
  GitHubAuthService: Symbol.for('GitHubAuthService'),
  GitHubService: Symbol.for('GitHubService'),
  GitHubEventStoreService: Symbol.for('GitHubEventStoreService'),
  CategoryService: Symbol.for('CategoryService'),
  LabelService: Symbol.for('LabelService'),
  ProjectService: Symbol.for('ProjectService'),
  GitHubCredentialsStoreService: Symbol.for('GitHubCredentialsStoreService'),
  UserPreferenceStoreService: Symbol.for('UserPreferenceStoreService'),
  EventEntryService: Symbol.for('EventEntryService'),
  WindowLogService: Symbol.for('WindowLogService'),
  ActivityService: Symbol.for('ActivityService'),
  ActivityColorService: Symbol.for('ActivityColorService'),
  ActivityUsageService: Symbol.for('ActivityUsageService'),
  IpcService: Symbol.for('IpcService'),
  SpeakTextGenerator: Symbol.for('SpeakTextGenerator'),

  TaskScheduler: Symbol.for('TaskScheduler'),
  CalendarSyncProcessor: Symbol.for('CalendarSyncProcessor'),
  GitHubSyncProcessor: Symbol.for('GitHubSyncProcessor'),
  SpeakEventNotifyProcessor: Symbol.for('SpeakEventNotifyProcessor'),
  SpeakTimeNotifyProcessor: Symbol.for('SpeakTimeNotifyProcessor'),

  // domain/repository

  // infrastracture/electron
  IpcHandlerInitializer: Symbol.for('IpcHandlerInitializer'),
  SystemIdleService: Symbol.for('SystemIdleService'),
  // infrastracture/windowlog
  WindowWatchProcessor: Symbol.for('WindowWatcher'),
  // infrastracture/DB
  DataSource: Symbol.for('DataSource'),

  // shared/utils
  DateUtil: Symbol.for('DateUtil'),
  TimerManager: Symbol.for('TimerManager'),
};
