import { Container } from 'inversify';
import { TYPES } from './types';
import { ILogger } from './services/ILogger';
import { ILoggerFactory } from './services/ILoggerFactory';
import { LoggerFactoryImpl } from './services/LoggerFactoryImpl';
import { WinstonLoggerImpl } from './services/WinstonLoggerImpl';

// コンテナの作成
const container = new Container();

// ロガーのバインド
container.bind<ILoggerFactory>(TYPES.LoggerFactory).to(LoggerFactoryImpl).inRequestScope();
container.bind<ILogger>(TYPES.WinstonLogger).to(WinstonLoggerImpl).inRequestScope();

export default container;
