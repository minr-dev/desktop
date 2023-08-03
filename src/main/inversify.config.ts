import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';

import { GoogleAuthServiceImpl } from './services/GoogleAuthServiceImpl';
import { IAuthService } from './services/IAuthService';
import { IGoogleCalendarService } from './services/IGoogleCalendarService';
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

// コンテナの作成
const container = new Container();

// IPCハンドラーのバインド
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(GoogleAuthServiceHandlerImpl);
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(GoogleCalendarServiceHandlerImpl);
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(CredentialsStoreServiceHandlerImpl);
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(UserPreferenceStoreServiceHandlerImpl);
container
  .bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer)
  .to(EventEntryServiceHandlerImpl);
container.bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer).to(ActivityServiceHandlerImpl);

// サービスとリポジトリのバインド
container.bind<IAuthService>(TYPES.GoogleAuthService).to(GoogleAuthServiceImpl);
container
  .bind<ICredentialsStoreService>(TYPES.CredentialsStoreService)
  .to(CredentialsStoreServiceImpl);
container
  .bind<IUserPreferenceStoreService>(TYPES.UserPreferenceStoreService)
  .to(UserPreferenceStoreServiceImpl);
container.bind<IEventEntryService>(TYPES.EventEntryService).to(EventEntryServiceImpl);

container.bind<IGoogleCalendarService>(TYPES.GoogleCalendarService).to(GoogleCalendarServiceImpl);
container.bind<IWindowLogService>(TYPES.WindowLogService).to(WindowLogServiceImpl);
container.bind<ISystemIdleService>(TYPES.SystemIdleService).to(SystemIdleServiceImpl);
container.bind<IActivityService>(TYPES.ActivityService).to(ActivityServiceImpl);

// DBのバインド
container.bind(TYPES.DataSource).to(DataSource).inSingletonScope();
// アクティブWindowのウォッチャーのバインド
container.bind<WindowWatcher>(TYPES.WindowWatcher).to(WindowWatcher).inSingletonScope();

export default container;
