import { injectable } from 'inversify';
import { IpcChannel } from '@shared/constants';
import { Calendar } from '@shared/data/Calendar';
import { ICalendarProxy } from './ICalendarProxy';
import rendererContainer from '../inversify.config';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';
import { TYPES } from '@renderer/types';

@injectable()
export class GoogleCalendarProxyImpl implements ICalendarProxy {
  async get(id: string): Promise<Calendar | undefined> {
    const loggerFactory = rendererContainer.get<ILoggerFactory>(TYPES.LoggerFactory);
    const logger = loggerFactory.getLogger({
      processType: 'renderer',
      loggerName: 'GoogleCalendarProxyImpl',
    });

    if (logger.isDebugEnabled()) logger.debug('get');
    return await window.electron.ipcRenderer.invoke(IpcChannel.CALENDAR_GET, id);
  }
}
