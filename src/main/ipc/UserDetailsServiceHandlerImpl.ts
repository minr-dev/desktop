import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import type { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import { TYPES } from '@main/types';
import type { IUserDetailsService } from '@main/services/IUserDetailsService';

@injectable()
export class UserDetailsServiceHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService
  ) {}

  init(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle(IpcChannel.USER_DETAILS_GET, async (_event) => {
      return await this.userDetailsService.get();
    });
  }
}
