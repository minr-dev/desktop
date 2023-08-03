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
import { IScheduleEventService } from './services/IScheduleEventService';
import { ScheduleEventServiceImpl } from './services/ScheduleEventServiceImpl';
import { ScheduleEventServiceHandlerImpl } from './ipc/ScheduleEventServiceHandlerImpl';
import { ActiveWindowWatcher } from './services/ActiveWindowWatcher';
import { IActiveWindowLogService } from './services/IActiveWindowLogService';
import { ActiveWindowLogServiceImpl } from './services/ActiveWindowLogServiceImpl';
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
  .to(ScheduleEventServiceHandlerImpl);
container.bind<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer).to(ActivityServiceHandlerImpl);

// サービスとリポジトリのバインド
container.bind<IAuthService>(TYPES.GoogleAuthService).to(GoogleAuthServiceImpl);
container
  .bind<ICredentialsStoreService>(TYPES.CredentialsStoreService)
  .to(CredentialsStoreServiceImpl);
container
  .bind<IUserPreferenceStoreService>(TYPES.UserPreferenceStoreService)
  .to(UserPreferenceStoreServiceImpl);
container.bind<IScheduleEventService>(TYPES.ScheduleEventService).to(ScheduleEventServiceImpl);

container.bind<IGoogleCalendarService>(TYPES.GoogleCalendarService).to(GoogleCalendarServiceImpl);
container
  .bind<IActiveWindowLogService>(TYPES.ActiveWindowLogService)
  .to(ActiveWindowLogServiceImpl);
container.bind<ISystemIdleService>(TYPES.SystemIdleService).to(SystemIdleServiceImpl);
container.bind<IActivityService>(TYPES.ActivityService).to(ActivityServiceImpl);

// DBのバインド
container.bind(TYPES.DataSource).to(DataSource).inSingletonScope();
// アクティブWindowのウォッチャーのバインド
container
  .bind<ActiveWindowWatcher>(TYPES.ActiveWindowWatcher)
  .to(ActiveWindowWatcher)
  .inSingletonScope();

export default container;
