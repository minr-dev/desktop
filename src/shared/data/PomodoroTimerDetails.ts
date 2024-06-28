export enum TimerState {
  RUNNING = 'running',
  PAUSED = 'paused',
  STOPPED = 'stopped',
}

export enum TimerSession {
  WORK = 'work',
  BREAK = 'break',
}

export interface PomodoroTimerDetails {
  session: TimerSession;
  state: TimerState;
  currentTime: number;
}
