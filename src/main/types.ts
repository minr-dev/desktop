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
  TaskService: Symbol.for('TaskService'),
  PatternService: Symbol.for('PatternService'),
  GitHubCredentialsStoreService: Symbol.for('GitHubCredentialsStoreService'),
  UserPreferenceStoreService: Symbol.for('UserPreferenceStoreService'),
  EventEntryService: Symbol.for('EventEntryService'),
  WindowLogService: Symbol.for('WindowLogService'),
  ActivityService: Symbol.for('ActivityService'),
  ActivityColorService: Symbol.for('ActivityColorService'),
  ActivityUsageService: Symbol.for('ActivityUsageService'),
  IpcService: Symbol.for('IpcService'),
  SpeakTextGenerator: Symbol.for('SpeakTextGenerator'),
  ActualAutoRegistrationService: Symbol.for('ActualAutoRegistrationService'),
  ActualPredictiveCreationService: Symbol.for('ActualPredictiveCreationService'),
  OverlapEventMergeService: Symbol.for('OverlapEventMergeService'),
  ActualAutoRegistrationFinalizer: Symbol.for('ActualAutoRegistrationFinalizer'),
  PlanAndActualCsvService: Symbol.for('PlanAndActualCsvService'),
  EventEntrySearchService: Symbol.for('EventEntrySearchService'),
  PlanAndActualCsvCreateService: Symbol.for('PlanAndActualCsvCreateService'),
  PlanAutoRegistrationService: Symbol.for('PlanAutoRegistrationService'),
  PlanAvailableTimeSlotService: Symbol.for('PlanAvailableTimeSlotService'),
  TaskProviderService: Symbol.for('TaskProviderService'),
  TaskAllocationService: Symbol.for('TaskAllocationService'),
  EventAggregationService: Symbol.for('EventAggrgationService'),
  EventAnalysisAggregationService: Symbol.for('EventAnalysisAggregationService'),

  TaskScheduler: Symbol.for('TaskScheduler'),
  CalendarSyncProcessor: Symbol.for('CalendarSyncProcessor'),
  GitHubSyncProcessor: Symbol.for('GitHubSyncProcessor'),
  EventNotifyProcessor: Symbol.for('EventNotifyProcessor'),
  SpeakTimeNotifyProcessor: Symbol.for('SpeakTimeNotifyProcessor'),

  // domain/repository

  // infrastracture/electron
  IpcHandlerInitializer: Symbol.for('IpcHandlerInitializer'),
  SystemIdleService: Symbol.for('SystemIdleService'),
  // infrastracture/windowlog
  WindowWatchProcessor: Symbol.for('WindowWatcher'),
  // infrastracture/DB
  DataSource: Symbol.for('DataSource'),

  LoggerFactory: Symbol.for('LoggerFactory'),
  WinstonLogger: Symbol.for('WinstonLogger'),

  // shared/utils
  DateUtil: Symbol.for('DateUtil'),
  TimerManager: Symbol.for('TimerManager'),
};
