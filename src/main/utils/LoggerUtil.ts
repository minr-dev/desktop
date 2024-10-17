import mainContainer from '@main/inversify.config';
import { ILogger } from '@main/services/ILogger';
import type { ILoggerFactory } from '@main/services/ILoggerFactory';

const loggerRecord: Record<string, ILogger> = {};

export const getLogger = (name: string): ILogger => {
  const loggerFactory = mainContainer.get<ILoggerFactory>('LoggerFactory');
  if (loggerRecord[name]) {
    return loggerRecord[name];
  }
  const logger = loggerFactory.getLogger(name);
  loggerRecord[name] = logger;
  return logger;
};
