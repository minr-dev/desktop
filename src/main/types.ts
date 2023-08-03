/**
 * DIコンテナの登録名
 */
export const TYPES = {
  // usecase

  // domain/service
  GoogleAuthService: Symbol.for('GoogleAuthService'),
  GoogleCalendarService: Symbol.for('GoogleCalendarService'),
  CredentialsStoreService: Symbol.for('CredentialsStoreService'),
  UserPreferenceStoreService: Symbol.for('UserPreferenceStoreService'),
  ScheduleEventService: Symbol.for('ScheduleEventService'),
  ActiveWindowLogService: Symbol.for('ActiveWindowLogService'),
  ActivityService: Symbol.for('ActivityService'),

  // domain/repository

  // infrastracture/electron
  IpcHandlerInitializer: Symbol.for('IpcHandlerInitializer'),
  SystemIdleService: Symbol.for('SystemIdleService'),
  // infrastracture/DB
  DataSource: Symbol.for('DataSource'),
  // infrastracture/activewindow
  ActiveWindowWatcher: Symbol.for('ActiveWindowWatcher'),
};
