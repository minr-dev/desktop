import { injectable } from 'inversify';
import { IpcChannel } from '@shared/constants';
import { PomodoroTimerDetails } from '@shared/data/PomodoroTimerDetails';

@injectable()
export class PomodoroTimerProxy {
  async getCurrentDetails(): Promise<PomodoroTimerDetails> {
    console.log('getCurrentDetails');
    return await window.electron.ipcRenderer.invoke(IpcChannel.POMODORO_TIMER_GET_CURRENT_DETAILS);
  }
  async start(): Promise<void> {
    console.log('start');
    return await window.electron.ipcRenderer.invoke(IpcChannel.POMODORO_TIMER_START);
  }
  async pause(): Promise<void> {
    console.log('pause');
    return await window.electron.ipcRenderer.invoke(IpcChannel.POMODORO_TIMER_PAUSE);
  }
  async stop(): Promise<void> {
    console.log('stop');
    return await window.electron.ipcRenderer.invoke(IpcChannel.POMODORO_TIMER_STOP);
  }
}
