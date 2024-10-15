import mainContainer from '@main/inversify.config';
import { add as addDate } from 'date-fns';
import { IEventEntryService } from '../IEventEntryService';
import { EventEntry } from '@shared/data/EventEntry';
import { CalendarSyncProcessorImpl } from '../CalendarSyncProcessorImpl';
import { IExternalCalendarService } from '../IExternalCalendarService';
import { IUserPreferenceStoreService } from '../IUserPreferenceStoreService';
import { EventEntryFixture } from '@shared/data/__tests__/EventEntryFixture';
import { ExternalCalendarServiceMockBuilder } from './__mocks__/ExternalCalendarServiceMockBuilder';
import { UserPreferenceStoreServiceMockBuilder } from './__mocks__/UserPreferenceStoreServiceMockBuilder';
import { EventEntryServiceMockBuilder } from './__mocks__/EventEntryServiceMockBuilder';
import { ExternalEventEntry } from '@shared/data/ExternalEventEntry';
import {
  ExternalEventEntryFixture,
  ExternalEventEntryIdFixture,
} from '@shared/data/__tests__/ExternalEventEntryFixture';
import { UserDetailsServiceMockBuilder } from './__mocks__/UserDetailsServiceMockBuilder';
import { IUserDetailsService } from '../IUserDetailsService';
import { CalendarSetting } from '@shared/data/CalendarSetting';
import { CalendarSettingFixture } from '@shared/data/__tests__/CalendarSettingFixture';
import { IpcService } from '../IpcService';
import { TYPES } from '@main/types';
import { ILoggerFactory } from '../ILoggerFactory';
import { TestLoggerFactory } from './TestLoggerFactory';

describe('CalendarSynchronizerImpl', () => {
  let synchronizer: CalendarSyncProcessorImpl;
  let externalCalendarService: IExternalCalendarService;
  let userPreferenceStoreService: IUserPreferenceStoreService;
  let eventEntryService: IEventEntryService;
  let userDetailsService: IUserDetailsService;
  let ipcService: IpcService;
  let loggerFactory: ILoggerFactory;

  beforeEach(() => {
    loggerFactory = new TestLoggerFactory().getFactory();
    mainContainer.rebind<ILoggerFactory>('LoggerFactory').toConstantValue(loggerFactory);
    userPreferenceStoreService = new UserPreferenceStoreServiceMockBuilder().build();
    externalCalendarService = new ExternalCalendarServiceMockBuilder().build();
    eventEntryService = new EventEntryServiceMockBuilder().build();
    userDetailsService = new UserDetailsServiceMockBuilder().build();
    ipcService = mainContainer.get<IpcService>(TYPES.IpcService);

    synchronizer = new CalendarSyncProcessorImpl(
      userDetailsService,
      userPreferenceStoreService,
      externalCalendarService,
      eventEntryService,
      ipcService,
      loggerFactory
    );
  });

  describe('processEventSynchronization', () => {
    interface TestData {
      description: string;

      paramCalendarSetting: CalendarSetting;
      paramMinrEvents: EventEntry[];
      paramExternalEvents: ExternalEventEntry[];

      expectedInsertMinrEvent: EventEntry | null;
      expectedUpdateMinrEvent: EventEntry | null;
      expectedDeleteMinrEvent: EventEntry | null;

      expectedInsertExternalEvent: ExternalEventEntry | null;
      expectedUpdateExternalEvent: ExternalEventEntry | null;
      expectedDeleteExternalEvent: ExternalEventEntry | null;

      expectedNoChange: boolean;
      expectedIpcSend: number;
    }
    function makeTest(override: Partial<TestData>): TestData {
      return {
        description: '-',
        paramCalendarSetting: CalendarSettingFixture.default(),
        paramMinrEvents: [],
        paramExternalEvents: [],

        expectedInsertMinrEvent: null,
        expectedUpdateMinrEvent: null,
        expectedDeleteMinrEvent: null,

        expectedInsertExternalEvent: null,
        expectedUpdateExternalEvent: null,
        expectedDeleteExternalEvent: null,

        expectedNoChange: false,
        expectedIpcSend: 0,
        ...override,
      };
    }

    // テストケースのパラメータを配列で定義
    // 外部追加、外部更新、外部削除、minr追加、minr更新、minr削除、変更がない
    const BASEDATE = new Date('2023-06-01T10:00:00+0900');
    const testCases = [
      makeTest({
        description: '外部から追加',
        paramMinrEvents: [],
        paramExternalEvents: [
          ExternalEventEntryFixture.default({
            id: ExternalEventEntryIdFixture.default(),
            updated: BASEDATE,
          }),
        ],
        expectedInsertMinrEvent: EventEntryFixture.default({
          externalEventEntryId: ExternalEventEntryIdFixture.default(),
          lastSynced: BASEDATE,
        }),
        expectedIpcSend: 1,
      }),
      makeTest({
        description: '外部の更新: カレントの同期日時よりも、external の更新日時が新しい',
        paramMinrEvents: [
          EventEntryFixture.default({
            externalEventEntryId: ExternalEventEntryIdFixture.default(),
            lastSynced: BASEDATE,
          }),
        ],
        paramExternalEvents: [
          ExternalEventEntryFixture.default({
            id: ExternalEventEntryIdFixture.default(),
            updated: addDate(BASEDATE, { days: 1 }),
          }),
        ],
        expectedUpdateMinrEvent: EventEntryFixture.default({
          lastSynced: addDate(BASEDATE, { days: 1 }),
        }),
        expectedIpcSend: 1,
      }),
      makeTest({
        description:
          '外部で削除: minr に同期済の状態から、外部カレンダーのイベントリストから無くなった場合は、minr が論理削除される',
        paramMinrEvents: [
          EventEntryFixture.default({
            externalEventEntryId: ExternalEventEntryIdFixture.default(),
            lastSynced: addDate(BASEDATE, { days: 1 }),
          }),
        ],
        paramExternalEvents: [],
        expectedDeleteMinrEvent: EventEntryFixture.default({
          externalEventEntryId: ExternalEventEntryIdFixture.default(),
          deleted: addDate(BASEDATE, { days: 1, seconds: 1 }),
        }),
        expectedIpcSend: 1,
      }),
      makeTest({
        description:
          'minrで追加: 外部カレンダーに追加される。外部カレンダーの更新日でminrの同期日時が更新され、採番されたIDも反映される',
        paramMinrEvents: [
          EventEntryFixture.default({
            summary: 'summary of minr event',
            lastSynced: BASEDATE,
          }),
        ],
        paramExternalEvents: [],
        expectedInsertExternalEvent: ExternalEventEntryFixture.default({
          id: ExternalEventEntryIdFixture.default(),
          summary: 'summary of minr event',
          updated: addDate(BASEDATE, { seconds: 1 }),
        }),
        expectedInsertMinrEvent: EventEntryFixture.default({
          externalEventEntryId: ExternalEventEntryIdFixture.default(),
          lastSynced: addDate(BASEDATE, { seconds: 1 }),
        }),
      }),
      makeTest({
        description:
          'minrで更新: 外部カレンダーが更新される。外部カレンダーの更新日でminrの同期日時に更新される',
        paramMinrEvents: [
          EventEntryFixture.default({
            externalEventEntryId: ExternalEventEntryIdFixture.default(),
            summary: 'summary of minr event',
            lastSynced: addDate(BASEDATE, { days: 1 }),
          }),
        ],
        paramExternalEvents: [
          ExternalEventEntryFixture.default({
            id: ExternalEventEntryIdFixture.default(),
            summary: 'summary of external event',
            updated: BASEDATE,
          }),
        ],
        expectedUpdateExternalEvent: ExternalEventEntryFixture.default({
          id: ExternalEventEntryIdFixture.default(),
          summary: 'summary of minr event',
          updated: addDate(BASEDATE, { days: 1, seconds: 1 }),
        }),
        expectedUpdateMinrEvent: EventEntryFixture.default({
          externalEventEntryId: ExternalEventEntryIdFixture.default(),
          lastSynced: addDate(BASEDATE, { days: 1, seconds: 1 }),
        }),
      }),
      makeTest({
        description: 'minrで削除: 外部カレンダーが削除される。',
        paramMinrEvents: [
          EventEntryFixture.default({
            externalEventEntryId: ExternalEventEntryIdFixture.default(),
            lastSynced: addDate(BASEDATE, { days: 1 }),
            deleted: addDate(BASEDATE, { days: 1 }),
          }),
        ],
        paramExternalEvents: [
          ExternalEventEntryFixture.default({
            id: ExternalEventEntryIdFixture.default(),
            updated: BASEDATE,
          }),
        ],
        expectedDeleteExternalEvent: ExternalEventEntryFixture.default({
          id: ExternalEventEntryIdFixture.default(),
        }),
      }),
      makeTest({
        description: '変更がない: 同期日時が更新日と同じときには、追加更新削除されない',
        paramMinrEvents: [
          EventEntryFixture.default({
            externalEventEntryId: ExternalEventEntryIdFixture.default(),
            lastSynced: BASEDATE,
          }),
        ],
        paramExternalEvents: [
          ExternalEventEntryFixture.default({
            id: ExternalEventEntryIdFixture.default(),
            updated: BASEDATE,
          }),
        ],
        expectedNoChange: true,
      }),
    ];
    it.each(testCases)('%s', async (t) => {
      if (t.expectedInsertMinrEvent) {
        eventEntryService = new EventEntryServiceMockBuilder()
          .withSave(t.expectedInsertMinrEvent)
          .build();
      }
      if (t.expectedUpdateMinrEvent) {
        eventEntryService = new EventEntryServiceMockBuilder()
          .withSave(t.expectedUpdateMinrEvent)
          .build();
      }
      if (t.expectedDeleteMinrEvent) {
        eventEntryService = new EventEntryServiceMockBuilder()
          .withSave(t.expectedDeleteMinrEvent)
          .build();
      }
      if (t.expectedInsertExternalEvent) {
        externalCalendarService = new ExternalCalendarServiceMockBuilder()
          .withSaveEvent(t.expectedInsertExternalEvent)
          .build();
      }
      if (t.expectedUpdateExternalEvent) {
        externalCalendarService = new ExternalCalendarServiceMockBuilder()
          .withSaveEvent(t.expectedUpdateExternalEvent)
          .build();
      }

      synchronizer = new CalendarSyncProcessorImpl(
        userDetailsService,
        userPreferenceStoreService,
        externalCalendarService,
        eventEntryService,
        ipcService,
        loggerFactory
      );
      const updateCount = await synchronizer.processEventSynchronization(
        t.paramCalendarSetting,
        t.paramMinrEvents,
        t.paramExternalEvents
      );

      // メソッドの呼び出しが期待通りかを確認
      if (t.expectedInsertMinrEvent) {
        console.log('expectedInsertMinrEvent', t.expectedInsertMinrEvent);
        expect(eventEntryService.save).toHaveBeenCalledWith(
          expect.objectContaining({
            externalEventEntryId: t.expectedInsertMinrEvent.externalEventEntryId,
            lastSynced: t.expectedInsertMinrEvent.lastSynced,
          })
        );
      }
      if (t.expectedUpdateMinrEvent) {
        expect(eventEntryService.save).toHaveBeenCalledWith(
          expect.objectContaining({
            lastSynced: t.expectedUpdateMinrEvent.lastSynced,
          })
        );
      }
      if (t.expectedDeleteMinrEvent) {
        expect(t.expectedDeleteMinrEvent.deleted).not.toBeNull();
        expect(eventEntryService.save).toHaveBeenCalledWith(
          expect.objectContaining({
            deleted: expect.anything(),
          })
        );
      }

      if (t.expectedInsertExternalEvent) {
        expect(externalCalendarService.saveEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            summary: t.expectedInsertExternalEvent.summary,
          })
        );
      }
      if (t.expectedUpdateExternalEvent) {
        expect(externalCalendarService.saveEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            summary: t.expectedUpdateExternalEvent.summary,
          })
        );
      }
      if (t.expectedDeleteExternalEvent) {
        expect(externalCalendarService.deleteEvent).toHaveBeenCalledWith(
          t.expectedDeleteExternalEvent.id?.calendarId,
          t.expectedDeleteExternalEvent.id?.id
        );
      }

      if (t.expectedNoChange) {
        expect(eventEntryService.save).toHaveBeenCalledTimes(0);
        expect(externalCalendarService.saveEvent).toHaveBeenCalledTimes(0);
        expect(externalCalendarService.deleteEvent).toHaveBeenCalledTimes(0);
      }

      expect(updateCount).toEqual(t.expectedIpcSend);
    });
  });
});
