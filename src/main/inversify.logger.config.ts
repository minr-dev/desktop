import { Container } from 'inversify';
import { TYPES } from './types';
import { ILogger } from './services/ILogger';
import { ILoggerFactory } from './services/ILoggerFactory';
import { LoggerFactoryImpl } from './services/LoggerFactoryImpl';
import { WinstonLoggerImpl } from './services/WinstonLoggerImpl';

// コンテナの作成
const container = new Container();

// inSingletonScope, inRequestScope を使用するとライフサイクルの問題でログ出力の上書きが発生する。
// inTransientScope を使用することで呼び出されるたびに新しいインスタンスを作成し上書きが発生しないようにする。
container.bind<ILoggerFactory>(TYPES.LoggerFactory).to(LoggerFactoryImpl).inTransientScope();
container.bind<ILogger>(TYPES.WinstonLogger).to(WinstonLoggerImpl).inTransientScope();

export default container;
