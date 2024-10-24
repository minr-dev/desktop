import { injectable } from 'inversify';
import { IpcChannel } from '@shared/constants';
import { Calendar } from '@shared/data/Calendar';
import { ICalendarProxy } from './ICalendarProxy';
import { getLogger } from '@renderer/utils/LoggerUtil';

const logger = getLogger('GoogleCalendarProxyImpl');

@injectable()
export class GoogleCalendarProxyImpl implements ICalendarProxy {
  async get(id: string): Promise<Calendar | undefined> {
    if (logger.isDebugEnabled()) logger.debug('get');
    return await window.electron.ipcRenderer.invoke(IpcChannel.CALENDAR_GET, id);
  }
}
