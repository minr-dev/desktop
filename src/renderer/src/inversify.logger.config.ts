import { Container } from 'inversify';
import { TYPES } from './types';
import { ILoggerFactory } from './services/ILoggerFactory';
import { ILoggerProxy } from './services/ILoggerProxy';
import { LoggerFactoryImpl } from './services/LoggerFactoryImpl';
import { LoggerProxyImpl } from './services/LoggerProxyImpl';

// コンテナの作成
const container = new Container();

// ロガーのバインド
container.bind<ILoggerFactory>(TYPES.LoggerFactory).to(LoggerFactoryImpl).inTransientScope();
container.bind<ILoggerProxy>(TYPES.LoggerProxy).to(LoggerProxyImpl).inTransientScope();

export default container;
