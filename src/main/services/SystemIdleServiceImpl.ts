import { powerMonitor } from 'electron';
import { injectable } from 'inversify';
import { ISystemIdleService } from './ISystemIdleService';

const IDLE_THRESHOLD = 5 * 60;

@injectable()
export class SystemIdleServiceImpl implements ISystemIdleService {
  get(): string {
    const idleTime = powerMonitor.getSystemIdleTime();
    const state = powerMonitor.getSystemIdleState(IDLE_THRESHOLD);
    console.log('idleTime', idleTime, 'state', state);
    return state;
  }
}
