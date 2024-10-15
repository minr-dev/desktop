import { injectable } from 'inversify';
import { IpcChannel } from '@shared/constants';
import { Calendar } from '@shared/data/Calendar';
import { ICalendarProxy } from './ICalendarProxy';
import rendererContainer from '../inversify.config';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';

@injectable()
export class GoogleCalendarProxyImpl implements ICalendarProxy {
  private loggerFactory = rendererContainer.get<ILoggerFactory>('LoggerFactory');
  private logger = this.loggerFactory.getLogger('GoogleCalendarProxyImpl');

  async get(id: string): Promise<Calendar | undefined> {
    if (this.logger.isDebugEnabled()) this.logger.debug('get');
    return await window.electron.ipcRenderer.invoke(IpcChannel.CALENDAR_GET, id);
  }
}
