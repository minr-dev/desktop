import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';
import { ICalendarProxy } from './services/ICalendarProxy';
import { GoogleCalendarProxyImpl } from './services/GoogleCalendarProxyImpl';
import { GoogleAuthProxyImpl } from './services/GoogleAuthProxyImpl';
import { IAuthProxy } from './services/IAuthProxy';
import { IUserPreferenceProxy } from './services/IUserPreferenceProxy';
import { UserPreferenceProxyImpl } from './services/UserPreferenceProxyImpl';
import { IEventEntryProxy } from './services/IEventEntryProxy';
import { EventEntryProxyImpl } from './services/EventEntryProxyImpl';
import { IActivityEventProxy } from './services/IActivityEventProxy';
import { ActivityEventProxyImpl } from './services/ActivityEventProxyImpl';
import { IUserDetailsProxy } from './services/IUserDetailsProxy';
import { UserDetailsProxyImpl } from './services/UserDetailsProxyImpl';
import { CalendarSynchronizerProxyImpl } from './services/CalendarSynchronizerProxyImpl';
import { ICalendarSynchronizerProxy } from './services/ICalendarSynchronizerProxy';
import { SpeakEventService as SpeakEventServiceImpl } from './services/SpeakEventServiceImpl';
import { ISpeakEventService } from './services/ISpeakEventService';

// コンテナの作成
const container = new Container();

// サービスとリポジトリのバインド
container.bind<IUserDetailsProxy>(TYPES.UserDetailsProxy).to(UserDetailsProxyImpl);
container.bind<IAuthProxy>(TYPES.GoogleAuthProxy).to(GoogleAuthProxyImpl);
container.bind<ICalendarProxy>(TYPES.GoogleCalendarProxy).to(GoogleCalendarProxyImpl);
container.bind<IUserPreferenceProxy>(TYPES.UserPreferenceProxy).to(UserPreferenceProxyImpl);
container.bind<IEventEntryProxy>(TYPES.EventEntryProxy).to(EventEntryProxyImpl);
container.bind<IActivityEventProxy>(TYPES.ActivityEventProxy).to(ActivityEventProxyImpl);
container
  .bind<ICalendarSynchronizerProxy>(TYPES.CalendarSynchronizerProxy)
  .to(CalendarSynchronizerProxyImpl);
container.bind<ISpeakEventService>(TYPES.SpeakEventService).to(SpeakEventServiceImpl);

export default container;
