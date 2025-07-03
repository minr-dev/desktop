import { PomodoroTimerDetails, TimerState, TimerSession } from '../PomodoroTimerDetails';

export class PomodoroTimerDetailsFixture {
  static default(override: Partial<PomodoroTimerDetails> = {}): PomodoroTimerDetails {
    return {
      session: TimerSession.WORK,
      state: TimerState.STOPPED,
      currentTime: 0,
      ...override,
    };
  }
}
