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

// DBのバインド
container.bind<DataSource>(TYPES.DataSource).to(DataSource).inSingletonScope();

export default container;