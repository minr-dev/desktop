import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import type { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import { TYPES } from '@main/types';
import type { IAutoLaunchService } from '@main/services/IAutoLaunchService';

/**
 * 自動起動の切り替えを行う IPC ハンドラー
 */
@injectable()
export class AutoLaunchServiceHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.AutoLaunchService)
    private readonly autoLaunchService: IAutoLaunchService
  ) {}

  init(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle(IpcChannel.SET_AUTO_LAUNCH_ENABLED, async (_event, isEnabled) => {
      return await this.autoLaunchService.setAutoLaunchEnabled(isEnabled);
    });
  }
}
