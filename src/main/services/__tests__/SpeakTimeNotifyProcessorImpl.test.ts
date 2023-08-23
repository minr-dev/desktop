import mainContainer from '@main/inversify.config';
import { addMinutes } from 'date-fns';
import { IUserPreferenceStoreService } from '../IUserPreferenceStoreService';
import { IUserDetailsService } from '../IUserDetailsService';
import { SpeakTimeNotifyProcessorImpl } from '../SpeakTimeNotifyProcessorImpl';
import { IpcService } from '../IpcService';
import { SpeakTextGenerator } from '../SpeakTextGenerator';
import { DateUtil } from '@shared/utils/DateUtil';
import { TYPES } from '@main/types';
import { MockTimer, MockTimerManager } from '@shared/utils/__tests__/__mocks__/MockTimerManager';
import { UserPreferenceFixture } from '@shared/dto/__tests__/UserPreferenceFixture';
import { IpcChannel } from '@shared/constants';
import { UserDetailsFixture } from '@shared/dto/__tests__/UserDetailsFixture';
import { TestDataSource } from './TestDataSource';

describe('SpeakTimeNotifyProcessorImpl', () => {
  let processor: SpeakTimeNotifyProcessorImpl;
  let userDetailsService: IUserDetailsService;
  let userPreferenceStoreService: IUserPreferenceStoreService;
  let ipcService: IpcService;
  let speakTextGenerator: SpeakTextGenerator;
  let dateUtil: DateUtil;
  let mockTimerManager: MockTimerManager;
  let mockTimer: MockTimer;

  beforeEach(() => {
    jest.resetAllMocks();

    mainContainer.rebind(TYPES.DataSource).to(TestDataSource).inSingletonScope();

    mainContainer.rebind(TYPES.TimerManager).to(MockTimerManager).inSingletonScope();
    mockTimerManager = mainContainer.get<MockTimerManager>(TYPES.TimerManager);
    mockTimer = mockTimerManager.get(SpeakTimeNotifyProcessorImpl.TIMER_NAME) as MockTimer;

    dateUtil = mainContainer.get<DateUtil>(TYPES.DateUtil);

    userDetailsService = mainContainer.get<IUserDetailsService>(TYPES.UserDetailsService);
    jest.spyOn(userDetailsService, 'get').mockResolvedValue(UserDetailsFixture.default());

    userPreferenceStoreService = mainContainer.get<IUserPreferenceStoreService>(
      TYPES.UserPreferenceStoreService
    );
    ipcService = mainContainer.get<IpcService>(TYPES.IpcService);
    speakTextGenerator = mainContainer.get<SpeakTextGenerator>(TYPES.SpeakTextGenerator);

    processor = mainContainer.get<SpeakTimeNotifyProcessorImpl>(TYPES.SpeakTimeNotifyProcessor);
  });

  afterEach(() => {
    processor.terminate();
  });

  describe('execute', () => {
    const NOW_TIME = new Date('2023-01-01T01:01:01+0900');
    const NOW_TIME_FLATMINUTES = new Date('2023-01-01T01:00:00+0900');
    const testCases = [
      {
        description: '15分間隔の通知設定になっていることの確認',
        paramUserPreference: UserPreferenceFixture.default({
          speakTimeSignal: true,
          timeSignalTextTemplate: 'template',
          timeSignalInterval: 20,
        }),
        paramCurrentTime: NOW_TIME,
        expectedTimeoutValues: [
          // 現在時刻が 00:00 を過ぎているので、0 分のタイマーはセットされなくて
          // 次の 20 分からの 60 分以内の 3 回分のタイマーがセットされる
          addMinutes(NOW_TIME_FLATMINUTES, 20).getTime() - NOW_TIME.getTime(),
          addMinutes(NOW_TIME_FLATMINUTES, 40).getTime() - NOW_TIME.getTime(),
          addMinutes(NOW_TIME_FLATMINUTES, 60).getTime() - NOW_TIME.getTime(),
        ],
        expectedSpeakTimes: [
          new Date('2023-01-01T01:20:00+0900'),
          new Date('2023-01-01T01:40:00+0900'),
          new Date('2023-01-01T02:00:00+0900'),
        ],
      },
    ];
    it.each(testCases)('%s', async (t) => {
      jest.spyOn(dateUtil, 'getCurrentDate').mockReturnValue(NOW_TIME);
      jest
        .spyOn(userPreferenceStoreService, 'getOrCreate')
        .mockResolvedValue(t.paramUserPreference);
      const timeSignalTextSpy = jest.spyOn(speakTextGenerator, 'timeSignalText');

      await processor.execute();

      expect(mockTimer.getTimeoutCallParams().map((p) => p.ms)).toEqual(t.expectedTimeoutValues);
      expect(timeSignalTextSpy).toHaveBeenCalledTimes(t.expectedTimeoutValues.length);
      t.expectedSpeakTimes.forEach((time, i) => {
        expect(timeSignalTextSpy).toHaveBeenNthCalledWith(i + 1, 'template', time);
      });
    });
  });

  describe('sendSpeakText', () => {
    const testCases = [
      {
        description: 'Ipcで送信することの確認',
        paramText: 'text',
        expectedChannel: IpcChannel.SPEAK_TEXT_NOTIFY,
        expectedSpeakText: 'text',
      },
    ];
    it.each(testCases)('%s', async (t) => {
      const sendSpy = jest.spyOn(ipcService, 'send').mockImplementation(() => {});

      await processor.sendSpeakText(t.paramText);

      expect(sendSpy).toHaveBeenCalledWith(t.expectedChannel, t.expectedSpeakText);
      expect(sendSpy).toHaveBeenCalled();
    });
  });
});
