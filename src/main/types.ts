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
  EventEntryService: Symbol.for('EventEntryService'),
  WindowLogService: Symbol.for('WindowLogService'),
  ActivityService: Symbol.for('ActivityService'),
  ActivityColorService: Symbol.for('ActivityColorService'),
  SyncScheduler: Symbol.for('SyncScheduler'),
  SyncProcessor: Symbol.for('SyncProcessor'),

  CalendarSynchronizer: Symbol.for('CalendarSynchronizer'),

  // domain/repository

  // infrastracture/electron
  IpcHandlerInitializer: Symbol.for('IpcHandlerInitializer'),
  SystemIdleService: Symbol.for('SystemIdleService'),
  // infrastracture/DB
  DataSource: Symbol.for('DataSource'),
  // infrastracture/windowlog
  WindowWatcher: Symbol.for('WindowWatcher'),
};
