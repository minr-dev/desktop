import rendererContainer from '@renderer/inversify.config';
import { ILoggerProxy } from '@renderer/services/ILoggerProxy';
import type { ILoggerFactory } from '@renderer/services/ILoggerFactory';

const loggerRecord: Record<string, ILoggerProxy> = {};

export const getLogger = (name: string): ILoggerProxy => {
  const loggerFactory = rendererContainer.get<ILoggerFactory>('LoggerFactory');
  if (loggerRecord[name]) {
    return loggerRecord[name];
  }
  const logger = loggerFactory.getLogger(name);
  loggerRecord[name] = logger;
  return logger;
};
