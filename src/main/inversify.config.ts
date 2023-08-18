import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';

import { GoogleAuthServiceImpl } from './services/GoogleAuthServiceImpl';
import { IAuthService } from './services/IAuthService';
import { IExternalCalendarService } from './services/IExternalCalendarService';
import { GoogleCalendarServiceImpl } from './services/GoogleCalendarServiceImpl';
import { ICredentialsStoreService } from './services/ICredentialsStoreService';
import { CredentialsStoreServiceImpl } from './services/CredentialsStoreServiceImpl';
import { IUserPreferenceStoreService } from './services/IUserPreferenceStoreService';
import { UserPreferenceStoreServiceImpl } from './services/UserPreferenceStoreServiceImpl';
import { IIpcHandlerInitializer } from './ipc/IIpcHandlerInitializer';
import { GoogleAuthServiceHandlerImpl } from './ipc/GoogleAuthServiceHandlerImpl';
import { GoogleCalendarServiceHandlerImpl } from './ipc/GoogleCalendarServiceHandlerImpl';
import { UserPreferenceStoreServiceHandlerImpl } from './ipc/UserPreferenceServiceHandlerImpl';
import { DataSource } from './services/DataSource';
import { IEventEntryService } from './services/IEventEntryService';
import { EventEntryServiceImpl } from './services/EventEntryServiceImpl';
import { EventEntryServiceHandlerImpl } from './ipc/EventEntryServiceHandlerImpl';
import { WindowWatcher } from './services/WindowWatcher';
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

// サービスとリポジトリのバインド
container.bind<IUserDetailsService>(TYPES.UserDetailsService).to(UserDetailsServiceImpl);
container.bind<IAuthService>(TYPES.GoogleAuthService).to(GoogleAuthServiceImpl);
container
  .bind<ICredentialsStoreService>(TYPES.CredentialsStoreService)
  .to(CredentialsStoreServiceImpl)
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
container.bind<IpcService>(TYPES.IpcService).to(IpcService).inSingletonScope();

// TaskScheduler と ITaskProcessor のバインド
// アプリ起動と同時に実行されて内部ではタイマーで動くのでインスタンスを生成するのは1回のみなので
// シングルトンにしなくても実質シングルトンと同じく動作する
{
  container.bind<TaskScheduler>(TYPES.TaskScheduler).to(TaskScheduler);
  // 外部カレンダー同期タスク
  container.bind<ITaskProcessor>(TYPES.CalendarSyncProcessor).to(CalendarSyncProcessorImpl);
  // 読み上げイベントを通知するタスク
  container.bind<ITaskProcessor>(TYPES.SpeakEventNotifyProcessor).to(SpeakEventNotifyProcessorImpl);
}

// アクティブWindowのウォッチャーのバインド
container.bind<WindowWatcher>(TYPES.WindowWatcher).to(WindowWatcher).inSingletonScope();
// DBのバインド
container.bind(TYPES.DataSource).to(DataSource).inSingletonScope();

export default container;
