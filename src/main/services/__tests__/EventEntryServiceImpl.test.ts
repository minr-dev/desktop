import { TestDataSource } from './TestDataSource';
import { EventEntryServiceImpl } from '../EventEntryServiceImpl';
import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { DataSource } from '../DataSource';
import { EventDateTimeFixture, EventEntryFixture } from '@shared/data/__tests__/EventEntryFixture';
import { assert } from 'console';
import { DateUtil } from '@shared/utils/DateUtil';
import { ILoggerFactory } from '../ILoggerFactory';
import { LoggerFactoryMockBuilder } from './__mocks__/LoggerFactoryMockBuilder';

describe('EventServiceEntryImpl', () => {
  let service: EventEntryServiceImpl;
  let dataSource: DataSource<EventEntry>;
  let dateUtil: DateUtil;
  let loggerFactory: ILoggerFactory;

  beforeEach(async () => {
    jest.resetAllMocks();
    loggerFactory = new LoggerFactoryMockBuilder().withGetLogger().build();
    dateUtil = new DateUtil();
    dataSource = new TestDataSource<EventEntry>(loggerFactory);
    service = new EventEntryServiceImpl(dataSource, dateUtil);
    dataSource.delete(service.tableName, {});
    const count = await dataSource.count(service.tableName, {});
    assert(count === 0);
  });

  describe('list', () => {
    const NOW_TIME = new Date('2023-07-03T10:00:00+0900');
    const start = new Date('2023-07-01T06:00:00+0900');
    const end = new Date('2023-07-02T06:00:00+0900');
    const userId = 'user1';
    const testData = [
      {
        description: '取得期間より前にあるイベント',
        preconditions: [
          EventEntryFixture.default({
            id: '1',
            userId: userId,
            eventType: EVENT_TYPE.PLAN,
            summary: 'test event',
            start: EventDateTimeFixture.default({
              dateTime: new Date('2023-07-01T03:00:00+0900'),
            }),
            end: EventDateTimeFixture.default({
              dateTime: new Date('2023-07-01T05:00:00+0900'),
            }),
          }),
        ],
        expected: {
          count: 0,
          events: [],
        },
      },
      {
        description: '取得期間の開始日時と重なるイベント',
        preconditions: [
          EventEntryFixture.default({
            id: '1',
            userId: userId,
            eventType: EVENT_TYPE.PLAN,
            summary: 'test event',
            start: EventDateTimeFixture.default({
              dateTime: new Date('2023-07-01T05:00:00+0900'),
            }),
            end: EventDateTimeFixture.default({
              dateTime: new Date('2023-07-01T07:00:00+0900'),
            }),
          }),
        ],
        expected: {
          count: 1,
          events: [
            EventEntryFixture.default({
              id: '1',
              userId: userId,
              eventType: EVENT_TYPE.PLAN,
              summary: 'test event',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T05:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T07:00:00+0900'),
              }),
              updated: NOW_TIME,
            }),
          ],
        },
      },
      {
        description: '取得期間内に収まっているイベント',
        preconditions: [
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
        expected: {
          count: 1,
          events: [
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
              updated: NOW_TIME,
            }),
          ],
        },
      },
      {
        description: '取得期間の終了日時と重なるイベント',
        preconditions: [
          EventEntryFixture.default({
            id: '1',
            userId: userId,
            eventType: EVENT_TYPE.PLAN,
            summary: 'test event',
            start: EventDateTimeFixture.default({
              dateTime: new Date('2023-07-02T05:00:00+0900'),
            }),
            end: EventDateTimeFixture.default({
              dateTime: new Date('2023-07-02T07:00:00+0900'),
            }),
          }),
        ],
        expected: {
          count: 1,
          events: [
            EventEntryFixture.default({
              id: '1',
              userId: userId,
              eventType: EVENT_TYPE.PLAN,
              summary: 'test event',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-02T05:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-02T07:00:00+0900'),
              }),
              updated: NOW_TIME,
            }),
          ],
        },
      },
      {
        description: '取得期間より後のイベント',
        preconditions: [
          EventEntryFixture.default({
            id: '1',
            userId: userId,
            eventType: EVENT_TYPE.PLAN,
            summary: 'test event',
            start: EventDateTimeFixture.default({
              dateTime: new Date('2023-07-02T10:00:00+0900'),
            }),
            end: EventDateTimeFixture.default({
              dateTime: new Date('2023-07-02T12:00:00+0900'),
            }),
          }),
        ],
        expected: {
          count: 0,
          events: [],
        },
      },
      {
        description: 'イベントが複数ある場合',
        preconditions: [
          EventEntryFixture.default({
            id: '1',
            userId: userId,
            eventType: EVENT_TYPE.PLAN,
            summary: 'test event 1',
            start: EventDateTimeFixture.default({
              dateTime: new Date('2023-07-02T10:00:00+0900'),
            }),
            end: EventDateTimeFixture.default({
              dateTime: new Date('2023-07-02T12:00:00+0900'),
            }),
          }),
          EventEntryFixture.default({
            id: '2',
            userId: userId,
            eventType: EVENT_TYPE.PLAN,
            summary: 'test event 2',
            start: EventDateTimeFixture.default({
              dateTime: new Date('2023-07-02T05:00:00+0900'),
            }),
            end: EventDateTimeFixture.default({
              dateTime: new Date('2023-07-02T07:00:00+0900'),
            }),
          }),
          EventEntryFixture.default({
            id: '3',
            userId: userId,
            eventType: EVENT_TYPE.PLAN,
            summary: 'test event 3',
            start: EventDateTimeFixture.default({
              dateTime: new Date('2023-07-01T10:00:00+0900'),
            }),
            end: EventDateTimeFixture.default({
              dateTime: new Date('2023-07-01T12:00:00+0900'),
            }),
          }),
          EventEntryFixture.default({
            id: '4',
            userId: userId,
            eventType: EVENT_TYPE.PLAN,
            summary: 'test event 4',
            start: EventDateTimeFixture.default({
              dateTime: new Date('2023-07-01T05:00:00+0900'),
            }),
            end: EventDateTimeFixture.default({
              dateTime: new Date('2023-07-01T07:00:00+0900'),
            }),
          }),
          EventEntryFixture.default({
            id: '5',
            userId: userId,
            eventType: EVENT_TYPE.PLAN,
            summary: 'test event 5',
            start: EventDateTimeFixture.default({
              dateTime: new Date('2023-07-01T03:00:00+0900'),
            }),
            end: EventDateTimeFixture.default({
              dateTime: new Date('2023-07-01T05:00:00+0900'),
            }),
          }),
        ],
        expected: {
          count: 3,
          events: [
            EventEntryFixture.default({
              id: '4',
              userId: userId,
              eventType: EVENT_TYPE.PLAN,
              summary: 'test event 4',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T05:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T07:00:00+0900'),
              }),
              updated: NOW_TIME,
            }),
            EventEntryFixture.default({
              id: '3',
              userId: userId,
              eventType: EVENT_TYPE.PLAN,
              summary: 'test event 3',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T12:00:00+0900'),
              }),
              updated: NOW_TIME,
            }),
            EventEntryFixture.default({
              id: '2',
              userId: userId,
              eventType: EVENT_TYPE.PLAN,
              summary: 'test event 2',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-02T05:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-02T07:00:00+0900'),
              }),
              updated: NOW_TIME,
            }),
          ],
        },
      },
    ];
    it.each(testData)('%s', async (testData) => {
      jest.spyOn(dateUtil, 'getCurrentDate').mockReturnValue(NOW_TIME);
      for (const precondition of testData.preconditions) {
        await service.save(precondition);
      }
      const events = await service.list(userId, start, end);
      const expected = testData.expected;
      expect(events).toHaveLength(expected.count);
      for (let i = 0; i < events.length; i++) {
        expect(events[i].id).toEqual(expected.events[i].id);
        expect(events[i].userId).toEqual(expected.events[i].userId);
        expect(events[i].eventType).toEqual(expected.events[i].eventType);
        expect(events[i].summary).toEqual(expected.events[i].summary);
        expect(events[i].start.date).toEqual(expected.events[i].start.date);
        expect(events[i].start.dateTime).toEqual(expected.events[i].start.dateTime);
        expect(events[i].end.date).toEqual(expected.events[i].end.date);
        expect(events[i].end.dateTime).toEqual(expected.events[i].end.dateTime);
        expect(events[i].location).toEqual(expected.events[i].location);
        expect(events[i].description).toEqual(expected.events[i].description);
        expect(events[i].lastSynced).toEqual(expected.events[i].lastSynced);
        expect(events[i].updated).toEqual(expected.events[i].updated);
        expect(events[i].deleted).toEqual(expected.events[i].deleted);
      }
    });
  });
});
