import { Container } from 'inversify';
import { TYPES } from './types';
import { ILogger } from './services/ILogger';
import { ILoggerFactory } from './services/ILoggerFactory';
import { LoggerFactoryImpl } from './services/LoggerFactoryImpl';
import { WinstonLoggerImpl } from './services/WinstonLoggerImpl';

// コンテナの作成
const container = new Container();

// LoggerFactoryImpl の getLogger は呼び出し時に WinstonLoggerImpl の setName , setProcessType を実行しているため、
// inSingletonScope と inRequestScope ではインスタンスを共有していることから getLogger が同時に複数モジュールで呼び出されると setName , setProcessType を
// 同時に呼び出してしまい、 WinstonLoggerImpl でログ出力する際に name , processType が正しく出力されない不具合が発生する。
// そのため、 inTransientScope で呼び出しごとにインスタンスを新しく作成することで setName , setProcessType が同時に呼び出されないようにする。
container.bind<ILoggerFactory>(TYPES.LoggerFactory).to(LoggerFactoryImpl).inTransientScope();
container.bind<ILogger>(TYPES.WinstonLogger).to(WinstonLoggerImpl).inTransientScope();

export default container;
