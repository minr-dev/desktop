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
import { IActiveWindowLogProxy } from './services/IActiveWindowLogProxy';
import { ActiveWindowLogProxyImpl } from './services/ActiveWindowLogProxyImpl';
import { IEventService } from './services/IEventService';
import { EventServiceImpl } from './services/EventServiceImpl';
import { IActivityService } from './services/IActivityService';
import { ActivityServiceImpl } from './services/ActivityServiceImpl';

// コンテナの作成
const container = new Container();

// サービスとリポジトリのバインド
container.bind<IAuthProxy>(TYPES.GoogleAuthProxy).to(GoogleAuthProxyImpl);
container.bind<ICalendarProxy>(TYPES.GoogleCalendarProxy).to(GoogleCalendarProxyImpl);
container.bind<IUserPreferenceProxy>(TYPES.UserPreferenceProxy).to(UserPreferenceProxyImpl);
container.bind<IScheduleEventProxy>(TYPES.ScheduleEventProxy).to(ScheduleEventProxyImpl);
container.bind<IActiveWindowLogProxy>(TYPES.ActiveWindowLogProxy).to(ActiveWindowLogProxyImpl);
container.bind<IEventService>(TYPES.EventService).to(EventServiceImpl);
container.bind<IActivityService>(TYPES.ActivityService).to(ActivityServiceImpl);

export default container;
