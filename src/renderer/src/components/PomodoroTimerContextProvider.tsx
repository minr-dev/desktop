import rendererContainer from '../inversify.config';
import { ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import AppContext from './AppContext';
import { TYPES } from '@renderer/types';
import { PomodoroTimerDetails, TimerSession, TimerState } from '@shared/data/PomodoroTimerDetails';
import PomodoroTimerContext from './PomodoroTimerContext';
import { TimerManager } from '@shared/utils/TimerManager';
import { IUserPreferenceProxy } from '@renderer/services/IUserPreferenceProxy';
import { DateUtil } from '@shared/utils/DateUtil';
import { ISpeakEventService } from '@renderer/services/ISpeakEventService';
import { INotificationService } from '@renderer/services/INotificationService';
import { PomodoroNotificationSetting } from '@shared/data/PomodoroNotificationSetting';

export const PomodoroTimerContextProvider = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const [pomodoroTimerDetails, setPomodoroTimerDetails] = useState<PomodoroTimerDetails | null>(
    null
  );
  const [lastUpdated, setLastUpdate] = useState<Date | null>(null);

  const { userDetails } = useContext(AppContext);

  const TIMER_NAME = 'pomodoroTimer';
  const timer = rendererContainer.get<TimerManager>(TYPES.TimerManager).get(TIMER_NAME);

  const userPreferenceProxy = rendererContainer.get<IUserPreferenceProxy>(
    TYPES.UserPreferenceProxy
  );

  const speakEventService = rendererContainer.get<ISpeakEventService>(TYPES.SpeakEventSubscriber);
  const notificationService = rendererContainer.get<INotificationService>(
    TYPES.NotificationSubscriber
  );

  const dateUtil = rendererContainer.get<DateUtil>(TYPES.DateUtil);

  const setTimer = useCallback(
    async (session: TimerSession): Promise<void> => {
      if (userDetails == null) {
        return;
      }
      const userPreference = await userPreferenceProxy.getOrCreate(userDetails.userId);
      const initialMinutes =
        session === TimerSession.WORK ? userPreference.workingMinutes : userPreference.breakMinutes;
      setPomodoroTimerDetails({
        session: session,
        state: TimerState.STOPPED,
        currentTime: initialMinutes * 60 * 1000,
      });
    },
    [userDetails, userPreferenceProxy]
  );

  useEffect(() => {
    setTimer(TimerSession.WORK);
  }, [setTimer]);

  const getNextSession = (session: TimerSession): TimerSession =>
    session === TimerSession.WORK ? TimerSession.BREAK : TimerSession.WORK;

  const sendNotification = useCallback(
    (setting: PomodoroNotificationSetting): void => {
      if (pomodoroTimerDetails == null) {
        return;
      }
      const session = pomodoroTimerDetails.session === TimerSession.WORK ? '作業時間' : '休憩時間';
      const time = Math.ceil(pomodoroTimerDetails.currentTime / (60 * 1000));
      const text = setting.template
        .replace('{TIME}', time.toString())
        .replace('{SESSION}', session);
      console.log(text);
      if (setting.announce) {
        speakEventService.speak(text);
      }
      if (setting.sendNotification) {
        notificationService.sendNotification(text, 60 * 1000);
      }
    },
    [notificationService, pomodoroTimerDetails, speakEventService]
  );

  const startTimer = useCallback((): void => {
    setPomodoroTimerDetails((details) =>
      details != null
        ? {
            ...details,
            state: TimerState.RUNNING,
          }
        : null
    );
  }, []);

  const pauseTimer = useCallback((): void => {
    if (pomodoroTimerDetails == null) {
      return;
    }
    if (pomodoroTimerDetails.state != TimerState.RUNNING) {
      return;
    }
    timer.clear();

    setPomodoroTimerDetails((details) => {
      if (details == null || details.state !== TimerState.RUNNING) {
        return details;
      }
      const diffTime = lastUpdated
        ? dateUtil.getCurrentDate().getTime() - lastUpdated.getTime()
        : 0;
      return {
        ...details,
        state: TimerState.PAUSED,
        currentTime: details.currentTime - diffTime,
      };
    });
    setLastUpdate(null);
  }, [dateUtil, lastUpdated, pomodoroTimerDetails, timer]);

  const stopTimer = (): void => {
    if (pomodoroTimerDetails == null) {
      return;
    }
    timer.clear();

    setTimer(pomodoroTimerDetails.session);
    setLastUpdate(null);
  };

  // 次の時間の更新のセット
  useEffect(() => {
    if (pomodoroTimerDetails == null) {
      return;
    }

    if (pomodoroTimerDetails.state !== TimerState.RUNNING) {
      return;
    }

    timer.clear();

    if (pomodoroTimerDetails.currentTime > 0) {
      setLastUpdate(dateUtil.getCurrentDate());

      // 整数秒になるように時間を更新する
      const intervalMs = pomodoroTimerDetails.currentTime % 1000 || 1000;
      // 次の時間の更新をセットする
      timer.addTimeout(() => {
        setPomodoroTimerDetails((details) =>
          details != null
            ? {
                ...details,
                currentTime: details.currentTime - intervalMs,
              }
            : null
        );
      }, intervalMs);
    }
  }, [dateUtil, pomodoroTimerDetails, timer]);

  // 通知とセッションの切り替え
  useEffect(() => {
    if (userDetails == null || pomodoroTimerDetails == null) {
      return;
    }

    if (pomodoroTimerDetails.state !== TimerState.RUNNING) {
      return;
    }

    const timerEvent = async (): Promise<void> => {
      const userPreference = await userPreferenceProxy.getOrCreate(userDetails.userId);

      // 残り時間が0秒になったときの処理
      if (pomodoroTimerDetails.currentTime <= 0) {
        sendNotification(userPreference.notifyAtPomodoroComplete);
        const session = getNextSession(pomodoroTimerDetails.session);
        await setTimer(session);
        startTimer();
        return;
      }

      // 残り時間n秒前の処理
      const offsetMs = userPreference.notifyBeforePomodoroCompleteTimeOffset * 60 * 1000;
      if (pomodoroTimerDetails.currentTime == offsetMs) {
        sendNotification(userPreference.notifyBeforePomodoroComplete);
      }
    };
    timerEvent();
  }, [
    pomodoroTimerDetails,
    sendNotification,
    setTimer,
    startTimer,
    userDetails,
    userPreferenceProxy,
  ]);

  return (
    <PomodoroTimerContext.Provider
      value={{
        pomodoroTimerDetails,
        setTimer,
        startTimer,
        pauseTimer,
        stopTimer,
      }}
    >
      {children}
    </PomodoroTimerContext.Provider>
  );
};
