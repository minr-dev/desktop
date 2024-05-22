export enum TimerState {
  RUNNING = 'running',
  PAUSED = 'paused',
  STOPPED = 'stopped',
}

export enum TimerType {
  WORK = 'work',
  BREAK = 'break',
}

export interface PomodoroTimerDetails {
  type: TimerType;
  state: TimerState;
  currentTime: number;
}
