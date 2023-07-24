import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';
import { ICalendarProxy } from './services/ICalendarProxy';
import { GoogleCalendarProxyImpl } from './services/GoogleCalendarProxyImpl';
import { GoogleAuthProxyImpl } from './services/GoogleAuthProxyImpl';
import { IAuthProxy } from './services/IAuthProxy';
import { IUserPreferenceProxy } from './services/IUserPreferenceProxy';
import { UserPreferenceProxyImpl } from './services/UserPreferenceProxyImpl';
import { IScheduleEventProxy } from './services/IScheduleEventProxy';
import { ScheduleEventProxyImpl } from './services/ScheduleEventProxyImpl';

// コンテナの作成
const container = new Container();

// サービスとリポジトリのバインド
container.bind<IAuthProxy>(TYPES.GoogleAuthProxy).to(GoogleAuthProxyImpl);
container.bind<ICalendarProxy>(TYPES.GoogleCalendarProxy).to(GoogleCalendarProxyImpl);
container.bind<IUserPreferenceProxy>(TYPES.UserPreferenceProxy).to(UserPreferenceProxyImpl);
container.bind<IScheduleEventProxy>(TYPES.ScheduleEventProxy).to(ScheduleEventProxyImpl);

export default container;
