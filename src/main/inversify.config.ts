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
import { CredentialsStoreServiceHandlerImpl } from './ipc/CredentialsStoreServiceHandlerImpl';
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

// コンテナの作成
const container = new Container();

// IPCハンドラーのバインド
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
  .to(CredentialsStoreServiceHandlerImpl)
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

// サービスとリポジトリのバインド
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
// CalendarSynchronizer は起動と同時に実行されて内部ではタイマーで動くのでインスタンスを生成するのは1回のみ
container
  .bind<CalendarSynchronizer>(TYPES.CalendarSynchronizer)
  .to(CalendarSynchronizer)
  .inSingletonScope();

// DBのバインド
container.bind(TYPES.DataSource).to(DataSource).inSingletonScope();
// アクティブWindowのウォッチャーのバインド
container.bind<WindowWatcher>(TYPES.WindowWatcher).to(WindowWatcher).inSingletonScope();

// シングルトンにしないサービス
// GoogleCalendarServiceImpl はインスタンス変数で client を保持して、短時間の使いまわしをする
container.bind<IExternalCalendarService>(TYPES.GoogleCalendarService).to(GoogleCalendarServiceImpl);

export default container;
