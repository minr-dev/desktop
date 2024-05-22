import { IpcChannel } from '@shared/constants';
import React from 'react';
import rendererContainer from '@renderer/inversify.config';
import { TYPES } from '@renderer/types';
import { PomodoroTimerProxy } from '@renderer/services/PomodoroTimerProxyImpl';
import { PomodoroTimerDetails } from '@shared/data/PomodoroTimerDetails';

interface UsePomodoroTimerResult {
  timerDetails: PomodoroTimerDetails | null;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
}

export const usePomodoroTimer = (): UsePomodoroTimerResult => {
  const [timerDetails, settimerDetails] = React.useState<PomodoroTimerDetails | null>(null);
  const pomodoroTimer = rendererContainer.get<PomodoroTimerProxy>(TYPES.PomodoroTimerProxy);

  React.useEffect(() => {
    const unSubscribe = window.electron.ipcRenderer.on(
      IpcChannel.POMODORO_TIMER_CURRENT_DETAILS_NOTIFY,
      (_event, currentDetails): void => {
        settimerDetails(currentDetails);
      }
    );
    return () => {
      unSubscribe();
    };
  }, []);

  React.useEffect(() => {
    const setInitialDetails = async (): Promise<void> => {
      const defaultDetails = await pomodoroTimer.getCurrentDetails();
      settimerDetails((details) => details ?? defaultDetails);
    };
    setInitialDetails();
  }, [pomodoroTimer]);

  const startTimer = (): void => {
    if (!timerDetails) {
      return;
    }
    pomodoroTimer.start();
  };

  const pauseTimer = (): void => {
    if (!timerDetails) {
      return;
    }
    pomodoroTimer.pause();
  };

  const stopTimer = (): void => {
    if (!timerDetails) {
      return;
    }
    pomodoroTimer.stop();
  };

  return {
    timerDetails,
    startTimer,
    pauseTimer,
    stopTimer,
  };
};
