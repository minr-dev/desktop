import { injectable } from 'inversify';
import { IpcChannel } from '@shared/constants';
import { EventEntryCsvSetting } from '@shared/data/EventEntryCsvSetting';
import { IEventEntryCsvProxy } from './IEventEntryCsvProxy';

@injectable()
export class EventEntryCsvProxyImpl implements IEventEntryCsvProxy {
  async createCsv(eventEntryCsvSetting: EventEntryCsvSetting): Promise<string> {
    return await window.electron.ipcRenderer.invoke(
      IpcChannel.EVENT_ENTRY_CSV_CREATE,
      eventEntryCsvSetting
    );
  }
}
