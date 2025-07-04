import { Container } from 'inversify';
import { TYPES } from './types';

import { ICalendarProxy } from './services/ICalendarProxy';
import { GoogleCalendarProxyImpl } from './services/GoogleCalendarProxyImpl';
import { GoogleAuthProxyImpl } from './services/GoogleAuthProxyImpl';
import { IAuthProxy } from './services/IAuthProxy';
import { IUserPreferenceProxy } from './services/IUserPreferenceProxy';
import { UserPreferenceProxyImpl } from './services/UserPreferenceProxyImpl';
import { IEventEntryProxy } from './services/IEventEntryProxy';
import { EventEntryProxyImpl } from './services/EventEntryProxyImpl';
import { IActivityEventProxy } from './services/IActivityEventProxy';
import { ActivityEventProxyImpl } from './services/ActivityEventProxyImpl';
import { IUserDetailsProxy } from './services/IUserDetailsProxy';
import { UserDetailsProxyImpl } from './services/UserDetailsProxyImpl';
import { CalendarSynchronizerProxyImpl } from './services/CalendarSynchronizerProxyImpl';
import { ISynchronizerProxy } from './services/ISynchronizerProxy';
import { SpeakEventServiceImpl } from './services/SpeakEventServiceImpl';
import { ISpeakEventService } from './services/ISpeakEventService';
import { IOverlapEventService } from './services/IOverlapEventService';
import { OverlapEventServiceImpl } from './services/OverlapEventServiceImpl';
import { GitHubAuthProxyImpl } from './services/GitHubAuthProxyImpl';
import { GitHubSynchronizerProxyImpl } from './services/GitHubSynchronizerProxyImpl';
import { IGitHubEventProxy } from './services/IGitHubEventProxy';
import { GitHubEventProxyImpl } from './services/GitHubEventProxyImpl';
import { ICategoryProxy } from './services/ICategoryProxy';
import { CategoryProxyImpl } from './services/CategoryProxyImpl';
import { ILabelProxy } from './services/ILabelProxy';
import { LabelProxyImpl } from './services/LabelProxyImpl';
import { IProjectProxy } from './services/IProjectProxy';
import { ProjectProxyImpl } from './services/ProjectProxyImpl';
import { DateUtil } from '@shared/utils/DateUtil';
import { IActivityUsageProxy } from './services/IActivityUsageProxy';
import { ActivityUsageProxyImpl } from './services/ActivityUsageProxyImpl';
import { IDesktopNotificationService } from './services/IDesktopNotificationService';
import { DesktopNotificationServiceImpl } from './services/DesktopNotificationServiceImpl';
import { TimerManager } from '@shared/utils/TimerManager';
import { ITaskProxy } from './services/ITaskProxy';
import { TaskProxyImpl } from './services/TaskProxyImpl';
import { IPatternProxy } from './services/IPatternProxy';
import { PatternProxyImpl } from './services/PatternProxyImpl';
import { IPlanPatternProxy } from './services/IPlanPatternProxy';
import { PlanPatternProxyImpl } from './services/PlanPatternProxyImpl';
import { IActualAutoRegistrationProxy } from './services/IActualAutoRegistrationProxy';
import { ActualAutoRegistrationProxy } from './services/ActualAutoRegistrationProxy';
import { IPlanAndActualCsvProxy } from './services/IPlanAndActualCsvProxy';
import { PlanAndActualCsvProxyImpl } from './services/PlanAndActualCsvProxyImpl';
import { IPlanAutoRegistrationProxy } from './services/IPlanAutoRegistrationProxy';
import { PlanAutoRegistrationProxy } from './services/PlanAutoRegistrationProxy';
import { IAutoLaunchProxy } from './services/IAutoLaunchProxy';
import { AutoLaunchProxyImpl } from './services/AutoLaunchProxyImpl';
import { IPlanTemplateProxy } from './services/IPlanTemplateProxy';
import { PlanTemplateProxyImpl } from './services/PlanTemplateProxyImpl';
import { IPlanTemplateEventProxy } from './services/IPlanTemplateEventProxy';
import { PlanTemplateEventProxyImpl } from './services/PlanTemplateEventProxyImpl';
import { IPlanTemplateApplyProxy } from './services/IPlanTemplateApplyProxy';
import { PlanTemplateApplyProxyImpl } from './services/PlanTemplateApplyProxyImpl';
import { IGitHubProjectV2Proxy } from './services/IGitHubProjectV2Proxy';
import { GitHubProjectV2ProxyImpl } from './services/GitHubProjectV2ProxyImpl';
import { IGitHubProjectV2SyncProxy } from './services/IGitHubProjectV2SyncProxy';
import { GitHubProjectV2SyncProxyImpl } from './services/GitHubProjectV2SyncProxyImpl';
import { IGitHubTaskSyncProxy } from './services/IGitHubTaskSyncProxyImpl';
import { GitHubTaskSyncProxyImpl } from './services/GitHubTaskSyncProxyImpl';
import { IEventAggregationProxy } from './services/IEventAggregationProxy';
import { EventAggregationProxyImpl } from './services/EventAggregationProxyImpl';
import { ICreateAnalysisTableDataService } from './services/ICreateAnalysisTableDataService';
import { CreateAnalysisTableDataServiceImpl } from './services/CreateAnalysisTableDataServiceImpl';

// コンテナの作成
const container = new Container();

// サービスとリポジトリのバインド
container
  .bind<IUserDetailsProxy>(TYPES.UserDetailsProxy)
  .to(UserDetailsProxyImpl)
  .inSingletonScope();
container.bind<IAuthProxy>(TYPES.GoogleAuthProxy).to(GoogleAuthProxyImpl).inSingletonScope();
container.bind<IAuthProxy>(TYPES.GitHubAuthProxy).to(GitHubAuthProxyImpl).inSingletonScope();
container
  .bind<ICalendarProxy>(TYPES.GoogleCalendarProxy)
  .to(GoogleCalendarProxyImpl)
  .inSingletonScope();
container
  .bind<IUserPreferenceProxy>(TYPES.UserPreferenceProxy)
  .to(UserPreferenceProxyImpl)
  .inSingletonScope();
container.bind<IEventEntryProxy>(TYPES.EventEntryProxy).to(EventEntryProxyImpl);
container
  .bind<IActivityEventProxy>(TYPES.ActivityEventProxy)
  .to(ActivityEventProxyImpl)
  .inSingletonScope();
container
  .bind<IGitHubEventProxy>(TYPES.GitHubEventProxy)
  .to(GitHubEventProxyImpl)
  .inSingletonScope();
container
  .bind<IActivityUsageProxy>(TYPES.ActicityUsageProxy)
  .to(ActivityUsageProxyImpl)
  .inSingletonScope();
container
  .bind<IEventAggregationProxy>(TYPES.EventAggregationProxy)
  .to(EventAggregationProxyImpl)
  .inSingletonScope();
container
  .bind<IActualAutoRegistrationProxy>(TYPES.ActualAutoRegistrationProxy)
  .to(ActualAutoRegistrationProxy)
  .inSingletonScope();
container
  .bind<IPlanAutoRegistrationProxy>(TYPES.PlanAutoRegistrationProxy)
  .to(PlanAutoRegistrationProxy)
  .inSingletonScope();
container.bind<IAutoLaunchProxy>(TYPES.AutoLaunchProxy).to(AutoLaunchProxyImpl).inSingletonScope();
container.bind<ICategoryProxy>(TYPES.CategoryProxy).to(CategoryProxyImpl).inSingletonScope();
container.bind<ILabelProxy>(TYPES.LabelProxy).to(LabelProxyImpl).inSingletonScope();
container.bind<IProjectProxy>(TYPES.ProjectProxy).to(ProjectProxyImpl).inSingletonScope();
container.bind<ITaskProxy>(TYPES.TaskProxy).to(TaskProxyImpl).inSingletonScope();
container.bind<IPatternProxy>(TYPES.PatternProxy).to(PatternProxyImpl).inSingletonScope();
container
  .bind<IPlanPatternProxy>(TYPES.PlanPatternProxy)
  .to(PlanPatternProxyImpl)
  .inSingletonScope();
container
  .bind<ISynchronizerProxy>(TYPES.CalendarSynchronizerProxy)
  .to(CalendarSynchronizerProxyImpl)
  .inSingletonScope();
container
  .bind<ISynchronizerProxy>(TYPES.GitHubSynchronizerProxy)
  .to(GitHubSynchronizerProxyImpl)
  .inSingletonScope();
container
  .bind<ISpeakEventService>(TYPES.SpeakEventSubscriber)
  .to(SpeakEventServiceImpl)
  .inSingletonScope();
container
  .bind<IDesktopNotificationService>(TYPES.DesktopNotificationSubscriber)
  .to(DesktopNotificationServiceImpl)
  .inSingletonScope();
container
  .bind<IOverlapEventService>(TYPES.OverlapEventService)
  .to(OverlapEventServiceImpl)
  .inSingletonScope();
container
  .bind<IPlanAndActualCsvProxy>(TYPES.PlanAndActualCsvProxy)
  .to(PlanAndActualCsvProxyImpl)
  .inSingletonScope();
container
  .bind<IPlanTemplateProxy>(TYPES.PlanTemplateProxy)
  .to(PlanTemplateProxyImpl)
  .inSingletonScope();
container
  .bind<IPlanTemplateApplyProxy>(TYPES.PlanTemplateApplyProxy)
  .to(PlanTemplateApplyProxyImpl)
  .inSingletonScope();
container
  .bind<IPlanTemplateEventProxy>(TYPES.PlanTemplateEventProxy)
  .to(PlanTemplateEventProxyImpl)
  .inSingletonScope();
container
  .bind<IGitHubProjectV2Proxy>(TYPES.GitHubProjectV2Proxy)
  .to(GitHubProjectV2ProxyImpl)
  .inSingletonScope();
container
  .bind<IGitHubProjectV2SyncProxy>(TYPES.GitHubProjectV2SyncProxy)
  .to(GitHubProjectV2SyncProxyImpl)
  .inSingletonScope();
container
  .bind<IGitHubTaskSyncProxy>(TYPES.GitHubTaskSyncProxy)
  .to(GitHubTaskSyncProxyImpl)
  .inSingletonScope();
container
  .bind<ICreateAnalysisTableDataService>(TYPES.CreateAnalysisTableDataService)
  .to(CreateAnalysisTableDataServiceImpl)
  .inSingletonScope();

// ユーティリティ
container.bind(TYPES.TimerManager).to(TimerManager).inSingletonScope();
container.bind(TYPES.DateUtil).to(DateUtil).inSingletonScope();

export default container;
