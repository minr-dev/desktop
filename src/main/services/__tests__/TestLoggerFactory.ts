import { ILoggerFactory } from '../ILoggerFactory';
import { LoggerFactoryImpl } from '../LoggerFactoryImpl';
import { TestLoggerImpl } from './TestLoggerImpl';

export class TestLoggerFactory {
  getFactory(): ILoggerFactory {
    const testLogger = new TestLoggerImpl();
    const loggerFactory = new LoggerFactoryImpl(testLogger);
    return loggerFactory;
  }
}
