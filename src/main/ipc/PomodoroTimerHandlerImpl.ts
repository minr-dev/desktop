import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import type { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import { PomodoroTimer } from '@main/services/PomodoroTimer';

@injectable()
export class PomodoroTimerHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.BasicTimer)
    private readonly pomodoroTimer: PomodoroTimer
  ) {}

  init(): void {
    ipcMain.handle(IpcChannel.POMODORO_TIMER_GET_CURRENT_DETAILS, async () => {
      return await this.pomodoroTimer.getCurrentDetails();
    });
    ipcMain.handle(IpcChannel.POMODORO_TIMER_START, async () => {
      return await this.pomodoroTimer.start();
    });
    ipcMain.handle(IpcChannel.POMODORO_TIMER_PAUSE, async () => {
      return await this.pomodoroTimer.pause();
    });
    ipcMain.handle(IpcChannel.POMODORO_TIMER_STOP, async () => {
      return await this.pomodoroTimer.stop();
    });
  }
}
