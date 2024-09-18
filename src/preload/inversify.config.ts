import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';

import { ILogger } from '../shared/utils/ILogger';
import { WinstonLoggerImpl } from '../shared/utils/WinstonLoggerImpl';

// コンテナの作成
const container = new Container();

// ロガーのバインド
container.bind<ILogger>(TYPES.WinstonLogger).to(WinstonLoggerImpl).inSingletonScope();

export default container;
