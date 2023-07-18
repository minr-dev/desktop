import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';

import { GoogleAuthServiceImpl } from './services/GoogleAuthServiceImpl';
import { IAuthService } from './services/IAuthService';
import { IGoogleCalendarService } from './services/IGoogleCalendarService';
import { GoogleCalendarServiceImpl } from './services/GoogleCalendarServiceImpl';
import { ICredentialsStoreService } from './services/ICredentialsStoreService';
import { GoogleCredentialsStoreServiceImpl } from './services/GoogleCredentialsStoreServiceImpl';
import { IUserPreferenceStoreService } from './services/IUserPreferenceStoreService';
import { UserPreferenceStoreServiceImpl } from './services/UserPreferenceStoreServiceImpl';
import { IIpcHandlerInitializer } from './infrastructure/electron/IIpcHandlerInitializer';
import { GoogleAuthServiceHandlerImpl } from './infrastructure/electron/GoogleAuthServiceHandlerImpl';
import { GoogleCalendarServiceHandlerImpl } from './infrastructure/electron/GoogleCalendarServiceHandlerImpl';
import { CredentialsStoreServiceHandlerImpl } from './infrastructure/electron/CredentialsStoreServiceHandlerImpl';
import { UserPreferenceStoreServiceHandlerImpl } from './infrastructure/electron/UserPreferenceServiceHandlerImpl';

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

// サービスとリポジトリのバインド
container.bind<IAuthService>(TYPES.GoogleAuthService).to(GoogleAuthServiceImpl);
container
  .bind<ICredentialsStoreService>(TYPES.CredentialsStoreService)
  .to(GoogleCredentialsStoreServiceImpl);
container
  .bind<IUserPreferenceStoreService>(TYPES.UserPreferenceStoreService)
  .to(UserPreferenceStoreServiceImpl);

container.bind<IGoogleCalendarService>(TYPES.GoogleCalendarService).to(GoogleCalendarServiceImpl);

export default container;
