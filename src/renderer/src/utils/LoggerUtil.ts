import loggerContainer from '@renderer/inversify.logger.config';
import { TYPES } from '@renderer/types';
import type { ILoggerFactory } from '@renderer/services/ILoggerFactory';
import { ILoggerProxy } from '@renderer/services/ILoggerProxy';

const loggerRecord: Record<string, ILoggerProxy> = {};

export const getLogger = (name: string): ILoggerProxy => {
  const loggerFactory = loggerContainer.get<ILoggerFactory>(TYPES.LoggerFactory);
  if (loggerRecord[name]) {
    return loggerRecord[name];
  }
  const logger = loggerFactory.getLogger(name);
  loggerRecord[name] = logger;
  return logger;
};
