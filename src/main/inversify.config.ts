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
import { CalendarSynchronizer } from './services/CalendarSynchronizer';
import { SyncScheduler } from './services/SyncScheduler';
import { UserDetailsServiceHandlerImpl } from './ipc/UserDetailsServiceHandlerImpl';
import { IUserDetailsService } from './services/IUserDetailsService';
import { UserDetailsServiceImpl } from './services/UserDetailsServiceImpl';
import { CalendarSynchronizerHandlerImpl } from './ipc/CalendarSynchronizerHandlerImpl';

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
// SyncScheduler は起動と同時に実行されて内部ではタイマーで動くのでインスタンスを生成するのは1回のみ
container.bind<SyncScheduler>(TYPES.SyncScheduler).to(SyncScheduler).inSingletonScope();
// CalendarSynchronizer は起動と同時に実行されて内部ではタイマーで動くのでインスタンスを生成するのは1回のみ
container
  .bind<CalendarSynchronizer>(TYPES.CalendarSynchronizer)
  .to(CalendarSynchronizer)
  .inSingletonScope();

// アクティブWindowのウォッチャーのバインド
container.bind<WindowWatcher>(TYPES.WindowWatcher).to(WindowWatcher).inSingletonScope();
// DBのバインド
container.bind(TYPES.DataSource).to(DataSource).inSingletonScope();

export default container;
