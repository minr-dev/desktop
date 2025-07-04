import { Container } from 'inversify';
import { TYPES } from './types';

import { GoogleAuthServiceImpl } from './services/GoogleAuthServiceImpl';
import { IAuthService } from './services/IAuthService';
import { IDeviceFlowAuthService } from './services/IDeviceFlowAuthService';
import { IExternalCalendarService } from './services/IExternalCalendarService';
import { ICredentialsStoreService } from './services/ICredentialsStoreService';
import { GoogleCalendarServiceImpl } from './services/GoogleCalendarServiceImpl';
import { GoogleAuthServiceHandlerImpl } from './ipc/GoogleAuthServiceHandlerImpl';
import { GoogleCredentialsStoreServiceImpl } from './services/GoogleCredentialsStoreServiceImpl';
import { GitHubAuthServiceHandlerImpl } from './ipc/GitHubAuthServiceHandlerImpl';
import { GitHubCredentialsStoreServiceImpl } from './services/GitHubCredentialsStoreServiceImpl';
import { IUserPreferenceStoreService } from './services/IUserPreferenceStoreService';
import { UserPreferenceStoreServiceImpl } from './services/UserPreferenceStoreServiceImpl';
import { IIpcHandlerInitializer } from './ipc/IIpcHandlerInitializer';
import { GoogleCalendarServiceHandlerImpl } from './ipc/GoogleCalendarServiceHandlerImpl';
import { UserPreferenceStoreServiceHandlerImpl } from './ipc/UserPreferenceServiceHandlerImpl';
import { DataSource } from './services/DataSource';
import { IEventEntryService } from './services/IEventEntryService';
import { EventEntryServiceImpl } from './services/EventEntryServiceImpl';
import { EventEntryServiceHandlerImpl } from './ipc/EventEntryServiceHandlerImpl';
import { WindowWatchProcessorImpl } from './services/WindowWatchProcessorImpl';
import { IWindowLogService } from './services/IWindowLogService';
import { WindowLogServiceImpl } from './services/WindowLogServiceImpl';
import { ActivityServiceHandlerImpl } from './ipc/ActivityServiceHandlerImpl';
import { ActivityServiceImpl } from './services/ActivityServiceImpl';
import { IActivityService } from './services/IActivityService';
import { ISystemIdleService } from './services/ISystemIdleService';
import { SystemIdleServiceImpl } from './services/SystemIdleServiceImpl';
import { IActivityColorService } from './services/IActivityColorService';
import { ActivityColorServiceImpl } from './services/ActivityColorServiceImpl';
import { CalendarSyncProcessorImpl } from './services/CalendarSyncProcessorImpl';
import { UserDetailsServiceHandlerImpl } from './ipc/UserDetailsServiceHandlerImpl';
import { IUserDetailsService } from './services/IUserDetailsService';
import { UserDetailsServiceImpl } from './services/UserDetailsServiceImpl';
import { CalendarSynchronizerHandlerImpl } from './ipc/CalendarSynchronizerHandlerImpl';
import { TaskScheduler } from './services/TaskScheduler';
import { ITaskProcessor } from './services/ITaskProcessor';
import { IpcService } from './services/IpcService';
import { EventNotifyProcessorImpl } from './services/EventNotifyProcessorImpl';
import { SpeakTextGenerator } from './services/SpeakTextGenerator';
import { SpeakTimeNotifyProcessorImpl } from './services/SpeakTimeNotifyProcessorImpl';
import { DateUtil } from '@shared/utils/DateUtil';
import { TimerManager } from '@shared/utils/TimerManager';
import { GitHubAuthServiceImpl } from './services/GitHubAuthServiceImpl';
import { GoogleCredentials } from '@shared/data/GoogleCredentials';
import { GitHubCredentials } from '@shared/data/GitHubCredentials';
import { GitHubSynchronizerHandlerImpl } from './ipc/GitHubSynchronizerHandlerImpl';
import { GitHubSyncProcessorImpl } from './services/GitHubSyncProcessorImpl';
import { IGitHubService } from './services/IGitHubService';
import { GitHubServiceImpl } from './services/GitHubServiceImpl';
import { IGitHubEventStoreService } from './services/IGitHubEventStoreService';
import { GitHubEventStoreServiceImpl } from './services/GitHubEventStoreServiceImpl';
import { GitHubEventStoreHandlerImpl } from './ipc/GitHubEventStoreHandlerImpl';
import { ICategoryService } from './services/ICategoryService';
import { CategoryServiceImpl } from './services/CategoryServiceImpl';
import { CategoryHandlerImpl } from './ipc/CategoryHandlerImpl';
import { LabelHandlerImpl } from './ipc/LabelHandlerImpl';
import { LabelServiceImpl } from './services/LabelServiceImpl';
import { ILabelService } from './services/ILabelService';
import { ProjectHandlerImpl } from './ipc/ProjectHandlerImpl';
import { IProjectService } from './services/IProjectService';
import { ProjectServiceImpl } from './services/ProjectServiceImpl';
import { IActivityUsageService } from './services/IActivityUsageService';
import { ActivityUsageServiceImpl } from './services/ActicityUsageServiceImpl';
import { ActivityUsageServiceHandlerImpl } from './ipc/ActivityUsageServiceHandlerImpl';
import { TaskServiceImpl } from './services/TaskServiceImpl';
import { ITaskService } from './services/ITaskService';
import { TaskHandlerImpl } from './ipc/TaskHandlerImpl';
import { PatternHandlerImpl } from './ipc/PatternHandlerImpl';
import { PatternServiceImpl } from './services/PatternServiceImpl';
import { IPatternService } from './services/IPatternService';
import { IActualAutoRegistrationService } from './services/IAutoRegisterActualService';
import { ActualAutoRegistrationServiceImpl } from './services/ActualAutoRegistrationServiceImpl';
import { ActualAutoRegistrationServiceHandlerImpl } from './ipc/AutoRegisterActualServiceHandlerImpl';
import { IActualPredictiveCreationService } from './services/IActualPredictiveCreationService';
import { ActualPredictiveCreationServiceImpl } from './services/ActualPredictiveCreationServiceImpl';
import { IActualPredictiveCreationFromPlanService } from './services/IActualPredictiveCreationFromPlanService';
import { ActualPredictiveCreationFromPlanServiceImpl } from './services/ActualPredictiveCreationFromPlanServiceImpl';
import { IOverlapEventMergeService } from './services/IOverlapEventMergeService';
import { OverlapEventMergeServiceImpl } from './services/OverlapEventMergeServiceImpl';
import { IActualAutoRegistrationFinalizer } from './services/IActualAutoRegistrationFinalizer';
import { ActualAutoRegistrationFinalizerImpl } from './services/ActualAutoRegistrationFinalizerImpl';
import { LoggerHandlerImpl } from './ipc/LoggerHandlerImpl';
import { IPlanAndActualCsvService } from './services/IPlanAndActualCsvService';
import { PlanAndActualCsvServiceImpl } from './services/PlanAndActualCsvServiceImpl';
import { IEventEntrySearchService } from './services/IEventEntrySearchService';
import { EventEntrySearchServiceImpl } from './services/EventEntrySearchServiceImpl';
import { ICsvCreateService } from './services/ICsvCreateService';
import { CsvCreateServiceImpl } from './services/CsvCreateServiceImpl';
import { PlanAndActualCsv } from './dto/PlanAndActualCsv';
import { PlanAndActualCsvServiceHandlerImpl } from './ipc/PlanAndActualCsvServiceHandlerImpl';
import { IPlanPatternService } from './services/IPlanPatternService';
import { PlanPatternHandlerImpl } from './ipc/PlanPatternHandlerImpl';
import { PlanPatternServiceImpl } from './services/PlanPatternServiceImpl';
import { IPlanAutoRegistrationService } from './services/IPlanAutoRegistrationService';
import { PlanAutoRegistrationServiceImpl } from './services/PlanAutoRegistrationServiceImpl';
import { IPlanAvailableTimeSlotService } from './services/IPlanAvailableTimeSlotService';
import { PlanAvailableTimeSlotServiceImpl } from './services/PlanAvailableTimeSlotService';
import { ITaskAllocationService } from './services/ITaskAllocationService';
import { TaskAllocationServiceImpl } from './services/TaskAllocationServiceImpl';
import { IEventAggregationService } from './services/IEventAggregationService';
import { EventAggregationServiceImpl } from './services/EventAggregationServiceImpl';
import { PlanAutoRegistrationServiceHandlerImpl } from './ipc/PlanAutoRegistrationServiceHandlerImpl';
import { ITaskProviderService } from './services/ITaskProviderService';
import { TaskProviderServiceImpl } from './services/TaskProviderServiceImpl';
import { IAutoLaunchService } from './services/IAutoLaunchService';
import { AutoLaunchServiceImpl } from './services/AutoLaunchServiceImpl';
import { AutoLaunchServiceHandlerImpl } from './ipc/AutoLaunchServiceHandlerImpl';
import { PlanTemplateHandlerImpl } from './ipc/PlanTemplateHandlerImpl';
import { PlanTemplateEventHandlerImpl } from './ipc/PlanTemplateEventHandlerImpl';
import { IPlanTemplateService } from './services/IPlanTemplateService';
import { PlanTemplateServiceImpl } from './services/PlanTemplateServiceImpl';
import { IPlanTemplateEventService } from './services/IPlanTemplateEventService';
import { PlanTemplateEventServiceImpl } from './services/PlanTemplateEventServiceImpl';
import { PlanTemplateApplyServiceHandlerImpl } from './ipc/PlanTemplateApplyServiceHandlerImpl';
import { IPlanTemplateApplyService } from './services/IPlanTemplateApplyService';
import { PlanTemplateApplyServiceImpl } from './services/PlanTemplateApplyServiceImpl';
import { IGitHubProjectV2ItemStoreService } from './services/IGitHubProjectV2ItemStoreService';
import { GitHubProjectV2ItemStoreService } from './services/GitHubProjectV2ItemStoreService';
import { GitHubProjectV2StoreHandlerImpl } from './ipc/GitHubProjectV2StoreHandlerImpl';
import { IGitHubProjectV2StoreService } from './services/IGitHubProjectV2StoreService';
import { GitHubProjectV2StoreServiceImpl } from './services/GitHubProjectV2StoreServiceImpl';
import { IGitHubProjectV2SyncService } from './services/IGitHubProjectV2SyncService';
import { GitHubProjectV2SyncServiceImpl } from './services/GitHubProjectV2SyncServiceImpl';
import { GitHubProjectV2SyncHandlerImpl } from './ipc/GitHubProjectV2SyncHandlerImpl';
import { IGitHubOrganizationStoreService } from './services/IGitHubOrganizationStoreService';
import { GitHubTaskSyncHandlerImpl } from './ipc/GitHubTaskSyncHandlerImpl';
import { IGitHubTaskSyncService } from './services/IGitHubTaskSyncService';
import { GitHubTaskSyncServiceImpl } from './services/GitHubTaskSyncServiceImpl';
import { GitHubOrganizationStoreServiceImpl } from './services/GitHubOrganizationStoreServiceImpl';
import { EventAggregationServiceHandlerImpl } from './ipc/EventAggregationServiceHandlerImpl';

// コンテナの作成
const container = new Container();

// IPCハンドラーのバインド
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(UserDetailsServiceHandlerImpl)
  .inSingletonScope();
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(GoogleAuthServiceHandlerImpl)
  .inSingletonScope();
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(GitHubAuthServiceHandlerImpl)
  .inSingletonScope();
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(GoogleCalendarServiceHandlerImpl)
  .inSingletonScope();
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(UserPreferenceStoreServiceHandlerImpl)
  .inSingletonScope();
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(EventEntryServiceHandlerImpl)
  .inSingletonScope();
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(ActivityServiceHandlerImpl)
  .inSingletonScope();
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(ActivityUsageServiceHandlerImpl)
  .inSingletonScope();
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(ActualAutoRegistrationServiceHandlerImpl)
  .inSingletonScope();
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(PlanAutoRegistrationServiceHandlerImpl)
  .inSingletonScope();
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(CalendarSynchronizerHandlerImpl)
  .inSingletonScope();
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(GitHubSynchronizerHandlerImpl)
  .inSingletonScope();
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(GitHubEventStoreHandlerImpl)
  .inSingletonScope();
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(AutoLaunchServiceHandlerImpl)
  .inSingletonScope();
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(CategoryHandlerImpl)
  .inSingletonScope();
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(LabelHandlerImpl)
  .inSingletonScope();
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(ProjectHandlerImpl)
  .inSingletonScope();
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(TaskHandlerImpl)
  .inSingletonScope();
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(PatternHandlerImpl)
  .inSingletonScope();
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(PlanPatternHandlerImpl)
  .inSingletonScope();
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(LoggerHandlerImpl)
  .inRequestScope();
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(PlanAndActualCsvServiceHandlerImpl)
  .inSingletonScope();
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(EventAggregationServiceHandlerImpl)
  .inRequestScope();
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(PlanTemplateHandlerImpl)
  .inRequestScope();
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(PlanTemplateEventHandlerImpl)
  .inRequestScope();
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(PlanTemplateApplyServiceHandlerImpl)
  .inRequestScope();
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(GitHubProjectV2StoreHandlerImpl)
  .inRequestScope();
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(GitHubProjectV2SyncHandlerImpl)
  .inRequestScope();
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(GitHubTaskSyncHandlerImpl)
  .inRequestScope();

// サービスとリポジトリのバインド
container.bind<IUserDetailsService>(TYPES.UserDetailsService).to(UserDetailsServiceImpl);
container.bind<IAuthService>(TYPES.GoogleAuthService).to(GoogleAuthServiceImpl);
container
  .bind<ICredentialsStoreService<GoogleCredentials>>(TYPES.GoogleCredentialsStoreService)
  .to(GoogleCredentialsStoreServiceImpl)
  .inSingletonScope();
container.bind<IDeviceFlowAuthService>(TYPES.GitHubAuthService).to(GitHubAuthServiceImpl);
container
  .bind<ICredentialsStoreService<GitHubCredentials>>(TYPES.GitHubCredentialsStoreService)
  .to(GitHubCredentialsStoreServiceImpl)
  .inSingletonScope();
container.bind<IGitHubService>(TYPES.GitHubService).to(GitHubServiceImpl).inSingletonScope();
container
  .bind<IGitHubEventStoreService>(TYPES.GitHubEventStoreService)
  .to(GitHubEventStoreServiceImpl)
  .inSingletonScope();
container.bind<ICategoryService>(TYPES.CategoryService).to(CategoryServiceImpl).inSingletonScope();
container.bind<ILabelService>(TYPES.LabelService).to(LabelServiceImpl).inSingletonScope();
container.bind<IProjectService>(TYPES.ProjectService).to(ProjectServiceImpl).inSingletonScope();
container.bind<ITaskService>(TYPES.TaskService).to(TaskServiceImpl).inSingletonScope();
container.bind<IPatternService>(TYPES.PatternService).to(PatternServiceImpl).inSingletonScope();
container
  .bind<IPlanPatternService>(TYPES.PlanPatternService)
  .to(PlanPatternServiceImpl)
  .inSingletonScope();
container
  .bind<IUserPreferenceStoreService>(TYPES.UserPreferenceStoreService)
  .to(UserPreferenceStoreServiceImpl)
  .inSingletonScope();
container
  .bind<IEventEntryService>(TYPES.EventEntryService)
  .to(EventEntryServiceImpl)
  .inSingletonScope();
container
  .bind<IExternalCalendarService>(TYPES.GoogleCalendarService)
  .to(GoogleCalendarServiceImpl)
  .inSingletonScope();

container
  .bind<IWindowLogService>(TYPES.WindowLogService)
  .to(WindowLogServiceImpl)
  .inSingletonScope();
container
  .bind<ISystemIdleService>(TYPES.SystemIdleService)
  .to(SystemIdleServiceImpl)
  .inSingletonScope();
container.bind<IActivityService>(TYPES.ActivityService).to(ActivityServiceImpl).inSingletonScope();
container
  .bind<IActivityColorService>(TYPES.ActivityColorService)
  .to(ActivityColorServiceImpl)
  .inSingletonScope();
container
  .bind<IActivityUsageService>(TYPES.ActivityUsageService)
  .to(ActivityUsageServiceImpl)
  .inSingletonScope();
container.bind<IpcService>(TYPES.IpcService).to(IpcService).inSingletonScope();
container
  .bind<SpeakTextGenerator>(TYPES.SpeakTextGenerator)
  .to(SpeakTextGenerator)
  .inSingletonScope();
container
  .bind<IActualAutoRegistrationService>(TYPES.ActualAutoRegistrationService)
  .to(ActualAutoRegistrationServiceImpl)
  .inSingletonScope();
container
  .bind<IActualPredictiveCreationService>(TYPES.ActualPredictiveCreationService)
  .to(ActualPredictiveCreationServiceImpl)
  .inSingletonScope();
container
  .bind<IActualPredictiveCreationFromPlanService>(TYPES.ActualPredictiveCreationFromPlanService)
  .to(ActualPredictiveCreationFromPlanServiceImpl)
  .inSingletonScope();
container
  .bind<IOverlapEventMergeService>(TYPES.OverlapEventMergeService)
  .to(OverlapEventMergeServiceImpl)
  .inSingletonScope();
container
  .bind<IActualAutoRegistrationFinalizer>(TYPES.ActualAutoRegistrationFinalizer)
  .to(ActualAutoRegistrationFinalizerImpl)
  .inSingletonScope();
container
  .bind<IPlanAndActualCsvService>(TYPES.PlanAndActualCsvService)
  .to(PlanAndActualCsvServiceImpl)
  .inSingletonScope();
container
  .bind<IEventEntrySearchService>(TYPES.EventEntrySearchService)
  .to(EventEntrySearchServiceImpl)
  .inSingletonScope();
container
  .bind<ICsvCreateService<PlanAndActualCsv>>(TYPES.PlanAndActualCsvCreateService)
  .to(CsvCreateServiceImpl<PlanAndActualCsv>);
container
  .bind<IPlanAutoRegistrationService>(TYPES.PlanAutoRegistrationService)
  .to(PlanAutoRegistrationServiceImpl)
  .inSingletonScope();
container
  .bind<IPlanAvailableTimeSlotService>(TYPES.PlanAvailableTimeSlotService)
  .to(PlanAvailableTimeSlotServiceImpl)
  .inSingletonScope();
container
  .bind<ITaskProviderService>(TYPES.TaskProviderService)
  .to(TaskProviderServiceImpl)
  .inSingletonScope();
container
  .bind<ITaskAllocationService>(TYPES.TaskAllocationService)
  .to(TaskAllocationServiceImpl)
  .inSingletonScope();
container
  .bind<IEventAggregationService>(TYPES.EventAggregationService)
  .to(EventAggregationServiceImpl)
  .inSingletonScope();
container
  .bind<IAutoLaunchService>(TYPES.AutoLaunchService)
  .to(AutoLaunchServiceImpl)
  .inSingletonScope();
container
  .bind<IPlanTemplateService>(TYPES.PlanTemplateService)
  .to(PlanTemplateServiceImpl)
  .inSingletonScope();
container
  .bind<IPlanTemplateEventService>(TYPES.PlanTemplateEventService)
  .to(PlanTemplateEventServiceImpl)
  .inSingletonScope();
container
  .bind<IPlanTemplateApplyService>(TYPES.PlanTemplateApplyService)
  .to(PlanTemplateApplyServiceImpl)
  .inSingletonScope();
container
  .bind<IGitHubProjectV2StoreService>(TYPES.GitHubProjectV2StoreService)
  .to(GitHubProjectV2StoreServiceImpl)
  .inSingletonScope();
container
  .bind<IGitHubProjectV2SyncService>(TYPES.GitHubProjectV2SyncService)
  .to(GitHubProjectV2SyncServiceImpl)
  .inSingletonScope();
container
  .bind<IGitHubOrganizationStoreService>(TYPES.GitHubOrganizationStoreService)
  .to(GitHubOrganizationStoreServiceImpl)
  .inSingletonScope();
container
  .bind<IGitHubProjectV2ItemStoreService>(TYPES.GitHubProjectV2ItemStoreService)
  .to(GitHubProjectV2ItemStoreService)
  .inSingletonScope();
container.bind<IGitHubTaskSyncService>(TYPES.GitHubTaskSyncService).to(GitHubTaskSyncServiceImpl);

// TaskScheduler と ITaskProcessor のバインド
// アプリ起動と同時に実行されて内部ではタイマーで動くのでインスタンスを生成するのは1回のみなので
// シングルトンにしなくても実質シングルトンと同じく動作する
{
  container.bind<TaskScheduler>(TYPES.TaskScheduler).to(TaskScheduler);
  // 外部カレンダー同期タスク
  container.bind<ITaskProcessor>(TYPES.CalendarSyncProcessor).to(CalendarSyncProcessorImpl);
  // GitHubアクティビティ取り込みタスク
  container.bind<ITaskProcessor>(TYPES.GitHubSyncProcessor).to(GitHubSyncProcessorImpl);
  // 予定の読み上げを通知するタスク
  container.bind<ITaskProcessor>(TYPES.EventNotifyProcessor).to(EventNotifyProcessorImpl);
  // 時間の読み上げを通知するタスク
  container.bind<ITaskProcessor>(TYPES.SpeakTimeNotifyProcessor).to(SpeakTimeNotifyProcessorImpl);
}

// アクティブWindowのウォッチャーのバインド
container
  .bind<WindowWatchProcessorImpl>(TYPES.WindowWatchProcessor)
  .to(WindowWatchProcessorImpl)
  .inSingletonScope();
// DBのバインド
container.bind(TYPES.DataSource).to(DataSource).inSingletonScope();

// ユーティリティ
container.bind(TYPES.DateUtil).to(DateUtil).inSingletonScope();
container.bind(TYPES.TimerManager).to(TimerManager).inSingletonScope();

export default container;
