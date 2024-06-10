import mainContainer from '@main/inversify.config';
import { IUserPreferenceStoreService } from '../IUserPreferenceStoreService';
import { IUserDetailsService } from '../IUserDetailsService';
import { IpcService } from '../IpcService';
import { DateUtil } from '@shared/utils/DateUtil';
import { TYPES } from '@main/types';
import { MockTimerManager } from '@shared/utils/__tests__/__mocks__/MockTimerManager';
import { UserPreferenceFixture } from '@shared/data/__tests__/UserPreferenceFixture';
import { IpcChannel } from '@shared/constants';
import { PomodoroTimer } from '../PomodoroTimer';
import { Timer, TimerManager } from '@shared/utils/TimerManager';
import { UserPreferenceStoreServiceMockBuilder } from './__mocks__/UserPreferenceStoreServiceMockBuilder';
import { UserDetailsServiceMockBuilder } from './__mocks__/UserDetailsServiceMockBuilder';
import { TimerState, TimerSession } from '@shared/data/PomodoroTimerDetails';
import { PomodoroTimerDetailsFixture } from '@shared/data/__tests__/PomodoroTimerDetailsFixture';
import { PomodoroNotificationSettingFixture } from '@shared/data/__tests__/PomodoroNotificationSettingFixture';
import assert from 'assert';

describe('SpeakTimeNotifyProcessorImpl', () => {
  let userDetailsService: IUserDetailsService;
  let userPreferenceStoreService: IUserPreferenceStoreService;
  let ipcService: IpcService;
  let dateUtil: DateUtil;
  let timerManager: TimerManager;
  let timer: Timer;
  let pomodoroTimer: PomodoroTimer;

  beforeEach(() => {
    jest.resetAllMocks();

    jest.useFakeTimers();
    // timerを再帰的に呼び出す処理をテストするのでMockTimerManagerは使わない
    timerManager = new TimerManager();
    timer = timerManager.get(PomodoroTimer.TIMER_NAME);

    mainContainer.rebind(TYPES.TimerManager).to(MockTimerManager).inSingletonScope();

    dateUtil = new DateUtil();

    userPreferenceStoreService = new UserPreferenceStoreServiceMockBuilder().build();
    userDetailsService = new UserDetailsServiceMockBuilder().build();
    ipcService = new IpcService();

    pomodoroTimer = new PomodoroTimer(
      ipcService,
      dateUtil,
      timerManager,
      userDetailsService,
      userPreferenceStoreService
    );
  });

  afterEach(() => {
    timer.clear();
  });

  describe('start', () => {
    describe('1秒ごとにタイマーの状態の通知が行われることの確認', () => {
      const testData = [
        {
          description: '作業時間',
          userPreference: UserPreferenceFixture.default({
            workingMinutes: 25,
            breakMinutes: 5,
            notifyAtPomodoroComplete: PomodoroNotificationSettingFixture.default({
              announce: false,
              sendNotification: false,
            }),
            notifyBeforePomodoroComplete: PomodoroNotificationSettingFixture.default({
              announce: false,
              sendNotification: false,
            }),
          }),
          session: TimerSession.WORK,
          initialTimeMs: 25 * 60 * 1000,
          waitTimeMs: 9999,
          expected: {
            send: PomodoroTimerDetailsFixture.default({
              session: TimerSession.WORK,
              state: TimerState.RUNNING,
              currentTime: expect.any(Number),
            }),
          },
        },
        {
          description: '休憩時間',
          userPreference: UserPreferenceFixture.default({
            workingMinutes: 25,
            breakMinutes: 5,
            notifyAtPomodoroComplete: PomodoroNotificationSettingFixture.default({
              announce: false,
              sendNotification: false,
            }),
            notifyBeforePomodoroComplete: PomodoroNotificationSettingFixture.default({
              announce: false,
              sendNotification: false,
            }),
          }),
          session: TimerSession.BREAK,
          initialTimeMs: 5 * 60 * 1000,
          waitTimeMs: 9999,
          expected: {
            send: PomodoroTimerDetailsFixture.default({
              session: TimerSession.BREAK,
              state: TimerState.RUNNING,
              currentTime: 5 * 60 * 1000,
            }),
          },
        },
      ];
      it.each(testData)('%s', async (testData) => {
        // タイマーの初期時間より長くは動かさない
        assert(testData.initialTimeMs > testData.waitTimeMs);

        const sendSpy = jest.spyOn(ipcService, 'send').mockImplementation(() => {});
        jest
          .spyOn(userPreferenceStoreService, 'getOrCreate')
          .mockResolvedValue(testData.userPreference);

        await pomodoroTimer.set(testData.session);
        await pomodoroTimer.start();

        const endTimeMs = testData.initialTimeMs - testData.waitTimeMs;
        let remainingTime = testData.initialTimeMs;
        // 1秒ごとに呼ばれていることの確認
        while (remainingTime >= endTimeMs + 1000) {
          sendSpy.mockClear();

          const msToRun = remainingTime % 1000 || 1000;
          await jest.advanceTimersByTimeAsync(msToRun);
          remainingTime -= msToRun;

          expect(sendSpy).toHaveBeenCalledWith(IpcChannel.POMODORO_TIMER_CURRENT_DETAILS_NOTIFY, {
            ...testData.expected.send,
            currentTime: remainingTime,
          });
        }

        sendSpy.mockClear();
        await jest.advanceTimersByTimeAsync(remainingTime - endTimeMs);
        // 1秒未満では呼ばれないこと
        expect(sendSpy).not.toHaveBeenLastCalledWith(
          IpcChannel.POMODORO_TIMER_CURRENT_DETAILS_NOTIFY,
          expect.anything()
        );
      });
    });

    describe('タイマーの切り替わりのテスト', () => {
      const testData = [
        {
          // description: '',
          userPreference: UserPreferenceFixture.default({
            workingMinutes: 1,
            breakMinutes: 5,
            notifyAtPomodoroComplete: PomodoroNotificationSettingFixture.default({
              announce: true,
              sendNotification: true,
              template: 'template',
            }),
            notifyBeforePomodoroComplete: PomodoroNotificationSettingFixture.default({
              announce: false,
              sendNotification: false,
            }),
          }),
          waitTimeMs: 1 * 60 * 1000,
          expected: expect.anything(),
        },
      ];
      it.each(testData)('%s', async (testData) => {
        const sendSpy = jest.spyOn(ipcService, 'send').mockImplementation(() => {});
        jest
          .spyOn(userPreferenceStoreService, 'getOrCreate')
          .mockResolvedValue(testData.userPreference);
        await pomodoroTimer.start();
        const startSpy = jest.spyOn(pomodoroTimer, 'start').mockImplementation(async () => {});
        await jest.advanceTimersByTimeAsync(testData.waitTimeMs);

        expect(sendSpy).toHaveBeenCalledWith(IpcChannel.SPEAK_TEXT_NOTIFY, testData.expected);
        expect(sendSpy).toHaveBeenCalledWith(IpcChannel.NOTIFICATION_NOTIFY, testData.expected);

        /**
         * 外部からタイマーを起動するためのstart関数を呼び出すことを必須としてしまっている点が
         * 必要以上に内部仕様を固定してしまっているような気がして少し気になっている
         **/
        expect(startSpy).toHaveBeenCalled();
      });
    });

    describe('n分前の通知のテスト', () => {
      const testData = [
        {
          description: '5分前',
          userPreference: UserPreferenceFixture.default({
            workingMinutes: 25,
            breakMinutes: 5,
            notifyBeforePomodoroCompleteTimeOffset: 5,
            notifyAtPomodoroComplete: PomodoroNotificationSettingFixture.default({
              announce: false,
              sendNotification: false,
            }),
            notifyBeforePomodoroComplete: PomodoroNotificationSettingFixture.default({
              announce: true,
              sendNotification: true,
              template: 'template',
            }),
          }),
          waitTimeMs: 20 * 60 * 1000,
          expected: 'template',
        },
      ];
      it.each(testData)('%s', async (testData) => {
        const sendSpy = jest.spyOn(ipcService, 'send').mockImplementation(() => {});
        jest
          .spyOn(userPreferenceStoreService, 'getOrCreate')
          .mockResolvedValue(testData.userPreference);
        await pomodoroTimer.start();
        await jest.advanceTimersByTimeAsync(testData.waitTimeMs);

        expect(sendSpy).toHaveBeenCalledWith(IpcChannel.SPEAK_TEXT_NOTIFY, testData.expected);
        expect(sendSpy).toHaveBeenCalledWith(IpcChannel.NOTIFICATION_NOTIFY, testData.expected);
      });
    });
  });

  describe('pause', () => {
    const testData = [
      {
        description: '一時停止',
        waitTimeMsBeforePause: 2500,
        waitTimeMsAfterPause: 500,
        userPreference: UserPreferenceFixture.default({
          workingMinutes: 25,
          breakMinutes: 5,
        }),
        expected: {
          detailsAtPause: PomodoroTimerDetailsFixture.default({
            session: TimerSession.WORK,
            state: TimerState.PAUSED,
            currentTime: 25 * 60 * 1000 - 2500,
          }),
          detailsAfterPause: PomodoroTimerDetailsFixture.default({
            session: TimerSession.WORK,
            state: TimerState.RUNNING,
            currentTime: 25 * 60 * 1000 - 2500 - 500,
          }),
        },
      },
    ];

    it.each(testData)('%s', async (testData) => {
      const sendSpy = jest.spyOn(ipcService, 'send').mockImplementation(() => {});
      jest
        .spyOn(userPreferenceStoreService, 'getOrCreate')
        .mockResolvedValue(testData.userPreference);
      await pomodoroTimer.start();

      sendSpy.mockClear();
      await jest.advanceTimersByTimeAsync(testData.waitTimeMsBeforePause);
      await pomodoroTimer.pause();
      expect(sendSpy).toHaveBeenCalledWith(
        IpcChannel.POMODORO_TIMER_CURRENT_DETAILS_NOTIFY,
        testData.expected.detailsAtPause
      );

      // タイマーが進んでいないことの確認
      sendSpy.mockClear();
      await jest.advanceTimersByTimeAsync(1000);
      expect(sendSpy).not.toHaveBeenCalledWith(
        IpcChannel.POMODORO_TIMER_CURRENT_DETAILS_NOTIFY,
        expect.anything()
      );

      sendSpy.mockClear();
      await pomodoroTimer.start();
      await jest.advanceTimersByTimeAsync(testData.waitTimeMsAfterPause);
      expect(sendSpy).toHaveBeenLastCalledWith(
        IpcChannel.POMODORO_TIMER_CURRENT_DETAILS_NOTIFY,
        testData.expected.detailsAfterPause
      );
    });
  });

  describe('stop', () => {
    const testData = [
      {
        description: '停止',
        waitTimeMs: 2500,
        stopTimeMs: 5000,
        userPreference: UserPreferenceFixture.default({
          workingMinutes: 25,
          breakMinutes: 5,
        }),
        expected: PomodoroTimerDetailsFixture.default({
          session: TimerSession.WORK,
          state: TimerState.STOPPED,
          currentTime: 25 * 60 * 1000,
        }),
      },
    ];

    it.each(testData)('%s', async (testData) => {
      const sendSpy = jest.spyOn(ipcService, 'send').mockImplementation(() => {});
      jest
        .spyOn(userPreferenceStoreService, 'getOrCreate')
        .mockResolvedValue(testData.userPreference);
      await pomodoroTimer.start();

      await jest.advanceTimersByTimeAsync(testData.waitTimeMs);

      sendSpy.mockClear();
      await pomodoroTimer.stop();
      expect(sendSpy).toHaveBeenCalledWith(
        IpcChannel.POMODORO_TIMER_CURRENT_DETAILS_NOTIFY,
        testData.expected
      );
      // 読み上げや通知が呼ばれないことの確認
      expect(sendSpy).not.toHaveBeenCalledWith(IpcChannel.SPEAK_TEXT_NOTIFY, expect.anything());
      expect(sendSpy).not.toHaveBeenCalledWith(IpcChannel.NOTIFICATION_NOTIFY, expect.anything());

      // タイマーが進んでいないことの確認
      sendSpy.mockClear();
      await jest.advanceTimersByTimeAsync(testData.stopTimeMs);
      expect(sendSpy).not.toHaveBeenCalledWith(
        IpcChannel.POMODORO_TIMER_CURRENT_DETAILS_NOTIFY,
        expect.anything()
      );
    });
  });

  describe('getCurrentTime', () => {
    describe('タイマー進行中', () => {
      const testData = [
        {
          description: '作業時間',
          userPreference: UserPreferenceFixture.default({
            workingMinutes: 25,
            breakMinutes: 5,
          }),
          session: TimerSession.WORK,
          waitTimeMs: 9999,
          expected: PomodoroTimerDetailsFixture.default({
            session: TimerSession.WORK,
            state: TimerState.RUNNING,
            currentTime: 25 * 60 * 1000 - 9000,
          }),
        },
        {
          description: '休憩時間',
          userPreference: UserPreferenceFixture.default({
            workingMinutes: 25,
            breakMinutes: 5,
          }),
          session: TimerSession.BREAK,
          waitTimeMs: 9999,
          expected: PomodoroTimerDetailsFixture.default({
            session: TimerSession.BREAK,
            state: TimerState.RUNNING,
            currentTime: 5 * 60 * 1000 - 9000,
          }),
        },
      ];
      it.each(testData)('%s', async (testData) => {
        jest
          .spyOn(userPreferenceStoreService, 'getOrCreate')
          .mockResolvedValue(testData.userPreference);
        jest.spyOn(ipcService, 'send').mockImplementation(() => {});
        await pomodoroTimer.set(testData.session);
        await pomodoroTimer.start();
        await jest.advanceTimersByTimeAsync(testData.waitTimeMs);
        const details = await pomodoroTimer.getCurrentDetails();
        expect(details).toEqual(expect.objectContaining(testData.expected));
      });
    });
    describe('一時停止中', () => {
      const testData = [
        {
          description: '作業時間',
          userPreference: UserPreferenceFixture.default({
            workingMinutes: 25,
            breakMinutes: 5,
          }),
          session: TimerSession.WORK,
          waitTimeMs: 9999,
          expected: PomodoroTimerDetailsFixture.default({
            session: TimerSession.WORK,
            state: TimerState.PAUSED,
            currentTime: 25 * 60 * 1000 - 9999,
          }),
        },
        {
          description: '休憩時間',
          userPreference: UserPreferenceFixture.default({
            workingMinutes: 25,
            breakMinutes: 5,
          }),
          session: TimerSession.BREAK,
          waitTimeMs: 9999,
          expected: PomodoroTimerDetailsFixture.default({
            session: TimerSession.BREAK,
            state: TimerState.PAUSED,
            currentTime: 5 * 60 * 1000 - 9999,
          }),
        },
      ];
      it.each(testData)('%s', async (testData) => {
        jest
          .spyOn(userPreferenceStoreService, 'getOrCreate')
          .mockResolvedValue(testData.userPreference);
        jest.spyOn(ipcService, 'send').mockImplementation(() => {});
        await pomodoroTimer.set(testData.session);
        await pomodoroTimer.start();
        await jest.advanceTimersByTimeAsync(testData.waitTimeMs);
        await pomodoroTimer.pause();
        const details = await pomodoroTimer.getCurrentDetails();
        expect(details).toEqual(expect.objectContaining(testData.expected));
      });
    });
    describe('停止中', () => {
      const testData = [
        {
          description: '作業時間',
          userPreference: UserPreferenceFixture.default({
            workingMinutes: 25,
            breakMinutes: 5,
          }),
          session: TimerSession.WORK,
          waitTimeMs: 9999,
          expected: PomodoroTimerDetailsFixture.default({
            session: TimerSession.WORK,
            state: TimerState.STOPPED,
            currentTime: 25 * 60 * 1000,
          }),
        },
        {
          description: '休憩時間',
          userPreference: UserPreferenceFixture.default({
            workingMinutes: 25,
            breakMinutes: 5,
          }),
          session: TimerSession.BREAK,
          waitTimeMs: 9999,
          expected: PomodoroTimerDetailsFixture.default({
            session: TimerSession.BREAK,
            state: TimerState.STOPPED,
            currentTime: 5 * 60 * 1000,
          }),
        },
      ];
      it.each(testData)('%s', async (testData) => {
        jest
          .spyOn(userPreferenceStoreService, 'getOrCreate')
          .mockResolvedValue(testData.userPreference);
        jest.spyOn(ipcService, 'send').mockImplementation(() => {});
        await pomodoroTimer.set(testData.session);
        await pomodoroTimer.start();
        await jest.advanceTimersByTimeAsync(testData.waitTimeMs);
        await pomodoroTimer.stop();
        const details = await pomodoroTimer.getCurrentDetails();
        expect(details).toEqual(expect.objectContaining(testData.expected));
      });
    });
  });
});
