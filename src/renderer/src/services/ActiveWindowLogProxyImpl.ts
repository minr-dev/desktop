import { IpcChannel } from '@shared/constants';
import { ActiveWindowLog } from '@shared/dto/ActiveWindowLog';
import { injectable } from 'inversify';
import { IActiveWindowLogProxy } from './IActiveWindowLogProxy';

@injectable()
export class ActiveWindowLogProxyImpl implements IActiveWindowLogProxy {
  async list(start: Date, end: Date): Promise<ActiveWindowLog[]> {
    const data = await window.electron.ipcRenderer.invoke(
      IpcChannel.ACTIVE_WINDOW_LOG_LIST,
      start,
      end
    );
    return data;
  }

  async get(id: string): Promise<ActiveWindowLog | undefined> {
    const data = await window.electron.ipcRenderer.invoke(IpcChannel.ACTIVE_WINDOW_LOG_GET, id);
    return data;
  }

  async save(activeWindowLog: ActiveWindowLog): Promise<ActiveWindowLog> {
    return await window.electron.ipcRenderer.invoke(
      IpcChannel.ACTIVE_WINDOW_LOG_SAVE,
      activeWindowLog
    );
  }
}
