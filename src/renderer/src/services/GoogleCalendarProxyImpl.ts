import { injectable } from 'inversify';
import { IpcChannel } from '@shared/constants';
import { Calendar } from '@shared/data/Calendar';
import { ICalendarProxy } from './ICalendarProxy';
import { getLogger } from '@renderer/utils/LoggerUtil';

@injectable()
export class GoogleCalendarProxyImpl implements ICalendarProxy {
  private logger = getLogger('GoogleCalendarProxyImpl');

  async get(id: string): Promise<Calendar | undefined> {
    if (this.logger.isDebugEnabled()) this.logger.debug('get');
    return await window.electron.ipcRenderer.invoke(IpcChannel.CALENDAR_GET, id);
  }
}
