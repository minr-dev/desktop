import mainContainer from '@main/inversify.config';
import { ILogger } from '@main/services/ILogger';
import type { ILoggerFactory } from '@main/services/ILoggerFactory';
import { injectable } from 'inversify';

@injectable()
export class LoggerUtil {
  private logger: Record<string, ILogger> = {};
  private loggerFactory = mainContainer.get<ILoggerFactory>('LoggerFactory');

  getLogger(name: string): ILogger {
    if (this.logger[name]) {
      return this.logger[name];
    }
    const logger = this.loggerFactory.getLogger(name);
    this.logger[name] = logger;
    return logger;
  }
}
