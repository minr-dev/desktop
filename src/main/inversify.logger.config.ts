import { Container } from 'inversify';
import { TYPES } from './types';
import { ILogger } from './services/ILogger';
import { ILoggerFactory } from './services/ILoggerFactory';
import { LoggerFactoryImpl } from './services/LoggerFactoryImpl';
import { WinstonLoggerImpl } from './services/WinstonLoggerImpl';

// コンテナの作成
const container = new Container();

// Logger は使用する際に各モジュールでログ出力設定を行う。
// ログ出力設定は各モジュール固有の設定であるため、ロガー同士で干渉してはならない。
// そのため、呼び出されるたびに新しいインスタンスを作成する inTransientScope を使用する。
container.bind<ILoggerFactory>(TYPES.LoggerFactory).to(LoggerFactoryImpl).inTransientScope();
container.bind<ILogger>(TYPES.WinstonLogger).to(WinstonLoggerImpl).inTransientScope();

export default container;
