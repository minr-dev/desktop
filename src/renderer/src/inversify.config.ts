import 'reflect-metadata';
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
import { IAutoRegisterActualService } from './services/IAutoRegisterActualService';
import { AutoRegisterActualService } from './services/AutoRegisterActuralService';
import { IApplicationProxy } from './services/IApplicationProxy';
import { ApplicationProxyImpl } from './services/ApplicationProxyImpl';
import { WinstonLoggerProxyImpl } from './services/WinstonLoggerProxyImpl';
import { LoggerFactoryImpl } from './services/LoggerFactory';

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
container.bind<ICategoryProxy>(TYPES.CategoryProxy).to(CategoryProxyImpl).inSingletonScope();
container.bind<ILabelProxy>(TYPES.LabelProxy).to(LabelProxyImpl).inSingletonScope();
container.bind<IProjectProxy>(TYPES.ProjectProxy).to(ProjectProxyImpl).inSingletonScope();
container.bind<ITaskProxy>(TYPES.TaskProxy).to(TaskProxyImpl).inSingletonScope();
container
  .bind<IApplicationProxy>(TYPES.ApplicationProxy)
  .to(ApplicationProxyImpl)
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
  .bind<IAutoRegisterActualService>(TYPES.AutoRegisterActualService)
  .to(AutoRegisterActualService)
  .inSingletonScope();

// ユーティリティ
container.bind(TYPES.TimerManager).to(TimerManager).inSingletonScope();
container.bind(TYPES.DateUtil).to(DateUtil).inSingletonScope();

container.bind(TYPES.LoggerFactory).to(LoggerFactoryImpl).inSingletonScope();
container.bind(TYPES.WinstonLogger).to(WinstonLoggerProxyImpl).inSingletonScope();

export default container;
