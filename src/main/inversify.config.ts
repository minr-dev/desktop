import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';

import { GoogleAuthServiceImpl } from './services/GoogleAuthServiceImpl';
import { IAuthService } from './services/IAuthService';
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
import { SpeakEventNotifyProcessorImpl } from './services/SpeakEventNotifyProcessorImpl';
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

// サービスとリポジトリのバインド
container.bind<IUserDetailsService>(TYPES.UserDetailsService).to(UserDetailsServiceImpl);
container.bind<IAuthService>(TYPES.GoogleAuthService).to(GoogleAuthServiceImpl);
container
  .bind<ICredentialsStoreService<GoogleCredentials>>(TYPES.GoogleCredentialsStoreService)
  .to(GoogleCredentialsStoreServiceImpl)
  .inSingletonScope();
container.bind<IAuthService>(TYPES.GitHubAuthService).to(GitHubAuthServiceImpl);
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
container.bind<IpcService>(TYPES.IpcService).to(IpcService).inSingletonScope();
container
  .bind<SpeakTextGenerator>(TYPES.SpeakTextGenerator)
  .to(SpeakTextGenerator)
  .inSingletonScope();

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
  container.bind<ITaskProcessor>(TYPES.SpeakEventNotifyProcessor).to(SpeakEventNotifyProcessorImpl);
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
