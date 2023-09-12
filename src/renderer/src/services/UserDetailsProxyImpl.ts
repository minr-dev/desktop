import { IpcChannel } from '@shared/constants';
import { UserDetails } from '@shared/data/UserDetails';
import { injectable } from 'inversify';
import { IUserDetailsProxy } from './IUserDetailsProxy';

@injectable()
export class UserDetailsProxyImpl implements IUserDetailsProxy {
  async get(): Promise<UserDetails> {
    return await window.electron.ipcRenderer.invoke(IpcChannel.USER_DETAILS_GET);
  }
}
