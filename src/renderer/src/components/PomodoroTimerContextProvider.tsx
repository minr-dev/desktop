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
import { IDesktopNotificationService } from '@renderer/services/IDesktopNotificationService';
import { NotificationSettings } from '@shared/data/NotificationSettings';
import { getLogger } from '@renderer/utils/LoggerUtil';
import { UserPreference } from '@shared/data/UserPreference';

const logger = getLogger('PomodoroTimerContextProvider');

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
  const desktopNotificationService = rendererContainer.get<IDesktopNotificationService>(
    TYPES.DesktopNotificationSubscriber
  );

  const dateUtil = rendererContainer.get<DateUtil>(TYPES.DateUtil);

  const getSessionMinutes = (session: TimerSession, userPreference: UserPreference): number => {
    return session === TimerSession.WORK
      ? userPreference.workingMinutes
      : userPreference.breakMinutes;
  };
  const getNextSession = (session: TimerSession): TimerSession =>
    session === TimerSession.WORK ? TimerSession.BREAK : TimerSession.WORK;

  const setTimer = useCallback(
    async (session: TimerSession): Promise<void> => {
      if (userDetails == null) {
        return;
      }
      const userPreference = await userPreferenceProxy.getOrCreate(userDetails.userId);
      const initialMinutes = getSessionMinutes(session, userPreference);
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

  const sendNotification = useCallback(
    (settings: NotificationSettings): void => {
      if (pomodoroTimerDetails == null) {
        return;
      }
      const session = pomodoroTimerDetails.session === TimerSession.WORK ? '作業時間' : '休憩時間';
      const time = Math.ceil(pomodoroTimerDetails.currentTime / (60 * 1000));
      const text = settings.notificationTemplate
        .replaceAll('{TIME}', time.toString())
        .replaceAll('{SESSION}', session);
      if (logger.isDebugEnabled()) logger.debug(text);
      if (settings.useVoiceNotification) {
        speakEventService.speak(text);
      }
      if (settings.useDesktopNotification) {
        desktopNotificationService.sendDesktopNotification(text, 60 * 1000);
      }
    },
    [desktopNotificationService, pomodoroTimerDetails, speakEventService]
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
        const sessionTime = getSessionMinutes(pomodoroTimerDetails.session, userPreference);
        if (sessionTime > 0) {
          // 通知頻度抑制のため、0分の場合は通知しない
          sendNotification(userPreference.notifyAtPomodoroComplete);
        }
        const session = getNextSession(pomodoroTimerDetails.session);
        await setTimer(session);
        startTimer();
        return;
      }

      // 残り時間n秒前の処理
      const notificationSettingsBeforePomodoroComplete =
        userPreference.notifyBeforePomodoroComplete;
      const offsetMs =
        notificationSettingsBeforePomodoroComplete.notificationTimeOffset * 60 * 1000;
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
