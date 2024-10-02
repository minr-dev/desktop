import { addSeconds } from 'date-fns';
import { IUserPreferenceStoreService } from '../IUserPreferenceStoreService';
import { IUserDetailsService } from '../IUserDetailsService';
import { IpcService } from '../IpcService';
import { SpeakTextGenerator } from '../SpeakTextGenerator';
import { DateUtil } from '@shared/utils/DateUtil';
import { MockTimer, MockTimerManager } from '@shared/utils/__tests__/__mocks__/MockTimerManager';
import { UserPreferenceFixture } from '@shared/data/__tests__/UserPreferenceFixture';
import { IpcChannel } from '@shared/constants';
import { UserDetailsFixture } from '@shared/data/__tests__/UserDetailsFixture';
import { EventNotifyProcessorImpl } from '../EventNotifyProcessorImpl';
import { EventEntryServiceMockBuilder } from './__mocks__/EventEntryServiceMockBuilder';
import { IEventEntryService } from '../IEventEntryService';
import { UserPreferenceStoreServiceMockBuilder } from './__mocks__/UserPreferenceStoreServiceMockBuilder';
import { UserDetailsServiceMockBuilder } from './__mocks__/UserDetailsServiceMockBuilder';
import { EventDateTimeFixture, EventEntryFixture } from '@shared/data/__tests__/EventEntryFixture';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { NotificationSettingsFixture } from '@shared/data/__tests__/NotificationSettingsFixture';
import { ILoggerFactory } from '../ILoggerFactory';
import { LoggerFactoryMockBuilder } from './__mocks__/LoggerFactoryMockBuilder';

describe('EventNotifyProcessorImpl', () => {
  let processor: EventNotifyProcessorImpl;
  let userDetailsService: IUserDetailsService;
  let userPreferenceStoreService: IUserPreferenceStoreService;
  let eventEntryService: IEventEntryService;
  let ipcService: IpcService;
  let speakTextGenerator: SpeakTextGenerator;
  let dateUtil: DateUtil;
  let mockTimerManager: MockTimerManager;
  let mockTimer: MockTimer;
  let loggerFactory: ILoggerFactory;

  beforeEach(() => {
    jest.resetAllMocks();
    loggerFactory = new LoggerFactoryMockBuilder().build();
    eventEntryService = new EventEntryServiceMockBuilder().build();

    mockTimerManager = new MockTimerManager();
    mockTimer = mockTimerManager.get(EventNotifyProcessorImpl.TIMER_NAME) as MockTimer;

    dateUtil = new DateUtil();

    userDetailsService = new UserDetailsServiceMockBuilder().build();
    jest.spyOn(userDetailsService, 'get').mockResolvedValue(UserDetailsFixture.default());

    userPreferenceStoreService = new UserPreferenceStoreServiceMockBuilder().build();
    ipcService = new IpcService(loggerFactory);
    speakTextGenerator = new SpeakTextGenerator();

    processor = new EventNotifyProcessorImpl(
      userDetailsService,
      userPreferenceStoreService,
      eventEntryService,
      ipcService,
      speakTextGenerator,
      dateUtil,
      mockTimerManager,
      loggerFactory
    );
  });

  afterEach(() => {
    processor.terminate();
  });

  describe('execute', () => {
    const NOW_TIME = new Date('2023-07-01T09:01:00+0900');
    const userId = 'user1';
    describe('音声通知タイミングのテスト', () => {
      const testCases = [
        {
          description: 'アプリ設定による通知',
          paramUserPreference: UserPreferenceFixture.default({
            userId: userId,
            speakEvent: true,
            speakEventTextTemplate: 'template',
            speakEventTimeOffset: 10,
          }),
          paramCurrentTime: NOW_TIME,
          paramEventEntries: [
            EventEntryFixture.default({
              id: '1',
              userId: userId,
              eventType: EVENT_TYPE.PLAN,
              summary: 'test event',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T12:00:00+0900'),
              }),
            }),
          ],
          expectedTimeoutValues: [
            addSeconds(new Date('2023-07-01T10:00:00+0900'), -10).getTime() - NOW_TIME.getTime(),
          ],
        },
        {
          description: '個別の予定による通知',
          paramUserPreference: UserPreferenceFixture.default({
            userId: userId,
            speakEvent: false,
            speakEventTextTemplate: 'template',
            speakEventTimeOffset: 10,
          }),
          paramCurrentTime: NOW_TIME,
          paramEventEntries: [
            EventEntryFixture.default({
              id: '1',
              userId: userId,
              eventType: EVENT_TYPE.PLAN,
              summary: 'test event',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T12:00:00+0900'),
              }),
              notificationSetting: NotificationSettingsFixture.default({
                useVoiceNotification: true,
                useDesktopNotification: false,
                notificationTimeOffset: 5,
                notificationTemplate: 'template',
              }),
            }),
          ],
          expectedTimeoutValues: [
            addSeconds(new Date('2023-07-01T10:00:00+0900'), -5).getTime() - NOW_TIME.getTime(),
          ],
        },
        {
          description:
            'アプリ設定と個別の予定による通知が両方設定されている場合、個別の予定が優先される',
          paramUserPreference: UserPreferenceFixture.default({
            userId: userId,
            speakEvent: true,
            speakEventTextTemplate: 'template',
            speakEventTimeOffset: 10,
          }),
          paramCurrentTime: NOW_TIME,
          paramEventEntries: [
            EventEntryFixture.default({
              id: '1',
              userId: userId,
              eventType: EVENT_TYPE.PLAN,
              summary: 'test event',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T12:00:00+0900'),
              }),
              notificationSetting: NotificationSettingsFixture.default({
                useVoiceNotification: true,
                useDesktopNotification: false,
                notificationTimeOffset: 5,
                notificationTemplate: 'template',
              }),
            }),
          ],
          expectedTimeoutValues: [
            addSeconds(new Date('2023-07-01T10:00:00+0900'), -5).getTime() - NOW_TIME.getTime(),
          ],
        },
        {
          description: '実績に対しては通知を行わない',
          paramUserPreference: UserPreferenceFixture.default({
            userId: userId,
            speakEvent: true,
            speakEventTextTemplate: 'template',
            speakEventTimeOffset: 10,
          }),
          paramCurrentTime: NOW_TIME,
          paramEventEntries: [
            EventEntryFixture.default({
              id: '1',
              userId: userId,
              eventType: EVENT_TYPE.ACTUAL,
              summary: 'test event',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T12:00:00+0900'),
              }),
            }),
          ],
          expectedTimeoutValues: [],
        },
        {
          description: 'デスクトップ通知',
          paramUserPreference: UserPreferenceFixture.default({
            userId: userId,
            speakEvent: true,
            speakEventTextTemplate: 'template',
            speakEventTimeOffset: 10,
          }),
          paramCurrentTime: NOW_TIME,
          paramEventEntries: [
            EventEntryFixture.default({
              id: '1',
              userId: userId,
              eventType: EVENT_TYPE.PLAN,
              summary: 'test event',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T12:00:00+0900'),
              }),
              notificationSetting: {
                useVoiceNotification: false,
                useDesktopNotification: true,
                notificationTimeOffset: 5,
                notificationTemplate: 'template',
              },
            }),
          ],
          expectedTimeoutValues: [
            addSeconds(new Date('2023-07-01T10:00:00+0900'), -10).getTime() - NOW_TIME.getTime(),
            addSeconds(new Date('2023-07-01T10:00:00+0900'), -5).getTime() - NOW_TIME.getTime(),
          ],
        },
      ];
      it.each(testCases)('%s', async (t) => {
        jest.spyOn(dateUtil, 'getCurrentDate').mockReturnValue(NOW_TIME);
        jest
          .spyOn(userPreferenceStoreService, 'getOrCreate')
          .mockResolvedValue(t.paramUserPreference);
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(t.paramEventEntries);

        await processor.execute();

        expect(mockTimer.getTimeoutCallParams().map((p) => p.ms)).toEqual(
          expect.arrayContaining(t.expectedTimeoutValues)
        );
      });
    });
  });

  describe('sendNotifyText', () => {
    const userId = 'user1';
    // このイベントをもとにテストデータのイベントを作成する
    const defaultTestEvent = EventEntryFixture.default({
      id: '1',
      userId: userId,
      eventType: EVENT_TYPE.PLAN,
      summary: 'test event',
      start: EventDateTimeFixture.default({
        dateTime: new Date('2023-07-01T10:00:00+0900'),
      }),
      end: EventDateTimeFixture.default({
        dateTime: new Date('2023-07-01T12:00:00+0900'),
      }),
    });

    describe('IPCで適切なテンプレートを送信することの確認', () => {
      const testCases = [
        {
          description: 'アプリ設定',
          paramEventEntry: EventEntryFixture.default({
            ...defaultTestEvent,
            notificationSetting: NotificationSettingsFixture.default({
              useVoiceNotification: false,
              notificationTemplate: 'notification from event entry',
            }),
          }),
          paramUserPreference: UserPreferenceFixture.default({
            userId: userId,
            speakEvent: true,
            speakEventTextTemplate: 'notification from application settings',
          }),
          paramChannel: IpcChannel.SPEAK_TEXT_NOTIFY,
          expectedChannel: IpcChannel.SPEAK_TEXT_NOTIFY,
          expectedNotifyText: 'notification from application settings',
        },
        {
          description: '個別の予定',
          paramEventEntry: EventEntryFixture.default({
            ...defaultTestEvent,
            notificationSetting: NotificationSettingsFixture.default({
              useVoiceNotification: true,
              notificationTemplate: 'notification from event entry',
            }),
          }),
          paramUserPreference: UserPreferenceFixture.default({
            userId: userId,
            speakEvent: false,
            speakEventTextTemplate: 'notification from application settings',
          }),
          paramChannel: IpcChannel.SPEAK_TEXT_NOTIFY,
          expectedChannel: IpcChannel.SPEAK_TEXT_NOTIFY,
          expectedNotifyText: 'notification from event entry',
        },
        {
          description:
            'アプリ設定と個別の予定のどちらでも設定されている場合、個別の予定が優先される',
          paramEventEntry: EventEntryFixture.default({
            ...defaultTestEvent,
            notificationSetting: NotificationSettingsFixture.default({
              useVoiceNotification: true,
              notificationTemplate: 'notification from event entry',
            }),
          }),
          paramUserPreference: UserPreferenceFixture.default({
            userId: userId,
            speakEvent: true,
            speakEventTextTemplate: 'notification from application settings',
          }),
          paramChannel: IpcChannel.SPEAK_TEXT_NOTIFY,
          expectedChannel: IpcChannel.SPEAK_TEXT_NOTIFY,
          expectedNotifyText: 'notification from event entry',
        },
        {
          description: 'デスクトップ通知',
          paramEventEntry: EventEntryFixture.default({
            ...defaultTestEvent,
            summary: 'test event',
            start: EventDateTimeFixture.default({
              dateTime: new Date('2023-07-01T10:00:00+0900'),
            }),
            notificationSetting: {
              useVoiceNotification: false,
              useDesktopNotification: true,
              notificationTimeOffset: 10,
              notificationTemplate: 'notification from event entry',
            },
          }),
          paramUserPreference: UserPreferenceFixture.default({
            userId: userId,
            speakEvent: true,
            speakEventTextTemplate: 'notification from application settings',
            speakEventTimeOffset: 5,
          }),
          paramChannel: IpcChannel.SEND_DESKTOP_NOTIFY,
          expectedChannel: IpcChannel.SEND_DESKTOP_NOTIFY,
          expectedNotifyText: 'notification from event entry',
        },
      ];
      it.each(testCases)('%s', async (t) => {
        const sendSpy = jest.spyOn(ipcService, 'send').mockImplementation(() => {});
        processor.sendNotifyText(t.paramEventEntry, t.paramUserPreference, t.paramChannel);

        expect(sendSpy).toHaveBeenCalledWith(t.expectedChannel, t.expectedNotifyText);
        expect(sendSpy).toHaveBeenCalled();
      });
    });
    describe('テンプレートの置き換えテスト', () => {
      // SpeakTextGeneratorのtimeToTextで返す文字列を上書きする
      const formattedText = 'timeToText';
      const testCases = [
        {
          description: 'テンプレートの置き換えテスト',
          paramEventEntry: EventEntryFixture.default({
            ...defaultTestEvent,
            summary: 'test event',
            start: EventDateTimeFixture.default({
              dateTime: new Date('2023-07-01T10:00:00+0900'),
            }),
          }),
          paramUserPreference: UserPreferenceFixture.default({
            userId: userId,
            speakEvent: true,
            speakEventTextTemplate: '{TITLE}, {READ_TIME_OFFSET}, {TIME}',
            speakEventTimeOffset: 5,
          }),
          paramChannel: IpcChannel.SPEAK_TEXT_NOTIFY,
          expectedChannel: IpcChannel.SPEAK_TEXT_NOTIFY,
          expectedNotifyText: `test event, 5, ${formattedText}`,
        },
      ];
      it.each(testCases)('%s', async (t) => {
        const sendSpy = jest.spyOn(ipcService, 'send').mockImplementation(() => {});
        const timeSignalTextSpy = jest
          .spyOn(speakTextGenerator, 'timeToText')
          .mockReturnValue(formattedText);

        processor.sendNotifyText(t.paramEventEntry, t.paramUserPreference, t.paramChannel);

        expect(timeSignalTextSpy).toHaveBeenCalledWith(t.paramEventEntry.start.dateTime);
        expect(timeSignalTextSpy).toHaveBeenCalled();
        expect(sendSpy).toHaveBeenCalledWith(t.expectedChannel, t.expectedNotifyText);
        expect(sendSpy).toHaveBeenCalled();
      });
    });
  });
});
