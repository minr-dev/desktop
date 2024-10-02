import { jest } from '@jest/globals';
import { ILoggerFactory } from '@main/services/ILoggerFactory';
import { IWinstonLogger } from '@main/services/IWinstonLogger';

export class LoggerFactoryMockBuilder {
  private Logger = new LoggerMockBuilder().build();
  private getLogger: jest.MockedFunction<(params: { loggerName: string; processType: string; }) => IWinstonLogger> = jest.fn();

  withGetLogger(): LoggerFactoryMockBuilder {
    this.getLogger.mockImplementation((params: { loggerName: string; processType: string; }) => {
      return this.Logger;
    });
    return this;
  }

  build(): ILoggerFactory {
    const mock: ILoggerFactory = {
      getLogger: this.getLogger,
    }
    return mock;
  }
}

export class LoggerMockBuilder {
  private setName: jest.MockedFunction<(message: string) => void> = jest.fn();
  private setProcessType: jest.MockedFunction<(message: string) => void> = jest.fn();
  private info: jest.MockedFunction<(message: string) => void> = jest.fn();
  private warn: jest.MockedFunction<(message: string) => void> = jest.fn();
  private error: jest.MockedFunction<(message: string) => void> = jest.fn();
  private debug: jest.MockedFunction<(message: string) => void> = jest.fn();
  private isDebugEnabled: jest.MockedFunction<() => boolean> = jest.fn();

  build(): IWinstonLogger {
    const mock: IWinstonLogger = {
      setName: this.setName,
      setProcessType: this.setProcessType,
      info: this.info,
      warn: this.warn,
      error: this.error,
      debug: this.debug,
      isDebugEnabled: this.isDebugEnabled,
    };
    return mock;
  }
}
