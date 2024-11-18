import { Container } from 'inversify';
import winston from 'winston';
import { TYPES } from './types';
import { ILogger } from './services/ILogger';
import { ILoggerFactory } from './services/ILoggerFactory';
import { LoggerFactoryImpl } from './services/LoggerFactoryImpl';
import { WinstonLoggerImpl } from './services/WinstonLoggerImpl';
import { ILoggerInitializer } from './services/ILoggerInitializer';
import { WinstonInitializerImpl } from './services/WinstonInitializerImpl';

// コンテナの作成
const container = new Container();

// LoggerFactoryImpl の getLogger が同時に複数モジュールで呼び出されると WinstonLoggerImpl の setName を同時に呼び出してしまい、
// インスタンスを共有していると後から呼び出された setName でその前の setName を上書きしてしまう不具合が発生する。
// そのため、 inTransientScope で呼び出しごとにインスタンスを新しく作成することで setName が同時に呼び出されないようにする。
container.bind<ILoggerFactory>(TYPES.LoggerFactory).to(LoggerFactoryImpl).inTransientScope();
container.bind<ILogger>(TYPES.WinstonLogger).to(WinstonLoggerImpl).inTransientScope();

// winstonのインスタンスはイベントリスナーを使用しているため、
// 複数インスタンスを作成すると、デフォルトのリスナー上限値を超えしまうので、メモリリークの警告が出力される。
// そのため、winstonのインスタンスを共有化し、1つのインスタンスを使いまわしてログ出力を行う。
container
  .bind<ILoggerInitializer<winston.Logger>>(TYPES.WinstonInitializer)
  .to(WinstonInitializerImpl)
  .inSingletonScope();

export default container;
