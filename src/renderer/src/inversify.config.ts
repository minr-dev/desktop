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
import { ISynchronizerProxy } from './services/ISynchronizerProxy';
import { SpeakEventServiceImpl } from './services/SpeakEventServiceImpl';
import { ISpeakEventService } from './services/ISpeakEventService';
import { IOverlapEventService } from './services/IOverlapEventService';
import { OverlapEventServiceImpl } from './services/OverlapEventServiceImpl';
import { GitHubAuthProxyImpl } from './services/GitHubAuthProxyImpl';
import { GitHubSynchronizerProxyImpl } from './services/GitHubSynchronizerProxyImpl';
import { IGitHubEventProxy } from './services/IGitHubEventProxy';
import { GitHubEventProxyImpl } from './services/GitHubEventProxyImpl';
import { ICategoryProxy } from './services/ICategoryProxy';
import { CategoryProxyImpl } from './services/CategoryProxyImpl';
import { ILabelProxy } from './services/ILabelProxy';
import { LabelProxyImpl } from './services/LabelProxyImpl';

// コンテナの作成
const container = new Container();

// サービスとリポジトリのバインド
container
  .bind<IUserDetailsProxy>(TYPES.UserDetailsProxy)
  .to(UserDetailsProxyImpl)
  .inSingletonScope();
container.bind<IAuthProxy>(TYPES.GoogleAuthProxy).to(GoogleAuthProxyImpl).inSingletonScope();
container.bind<IAuthProxy>(TYPES.GitHubAuthProxy).to(GitHubAuthProxyImpl).inSingletonScope();
container
  .bind<ICalendarProxy>(TYPES.GoogleCalendarProxy)
  .to(GoogleCalendarProxyImpl)
  .inSingletonScope();
container
  .bind<IUserPreferenceProxy>(TYPES.UserPreferenceProxy)
  .to(UserPreferenceProxyImpl)
  .inSingletonScope();
container.bind<IEventEntryProxy>(TYPES.EventEntryProxy).to(EventEntryProxyImpl);
container
  .bind<IActivityEventProxy>(TYPES.ActivityEventProxy)
  .to(ActivityEventProxyImpl)
  .inSingletonScope();
container
  .bind<IGitHubEventProxy>(TYPES.GitHubEventProxy)
  .to(GitHubEventProxyImpl)
  .inSingletonScope();
container.bind<ICategoryProxy>(TYPES.CategoryProxy).to(CategoryProxyImpl).inSingletonScope();
container.bind<ILabelProxy>(TYPES.LabelProxy).to(LabelProxyImpl).inSingletonScope();
container
  .bind<ISynchronizerProxy>(TYPES.CalendarSynchronizerProxy)
  .to(CalendarSynchronizerProxyImpl)
  .inSingletonScope();
container
  .bind<ISynchronizerProxy>(TYPES.GitHubSynchronizerProxy)
  .to(GitHubSynchronizerProxyImpl)
  .inSingletonScope();
container
  .bind<ISpeakEventService>(TYPES.SpeakEventSubscriber)
  .to(SpeakEventServiceImpl)
  .inSingletonScope();
container
  .bind<IOverlapEventService>(TYPES.OverlapEventService)
  .to(OverlapEventServiceImpl)
  .inSingletonScope();

export default container;
