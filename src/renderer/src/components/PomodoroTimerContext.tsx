import { PomodoroTimerDetails, TimerSession } from '@shared/data/PomodoroTimerDetails';
import React from 'react';

type PomodoroTimerContextType = {
  pomodoroTimerDetails: PomodoroTimerDetails | null;

  setTimer: (timerSession: TimerSession) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
};

const pomodoroTimerContext = React.createContext<PomodoroTimerContextType>({
  pomodoroTimerDetails: null,

  setTimer: () => {},
  startTimer: () => {},
  pauseTimer: () => {},
  stopTimer: () => {},
});

export default pomodoroTimerContext;
