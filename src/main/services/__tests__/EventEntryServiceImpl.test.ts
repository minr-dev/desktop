import { TestDataSource } from './TestDataSource';
import { EventEntryServiceImpl } from '../EventEntryServiceImpl';
import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { DataSource } from '../DataSource';
import { EventDateTimeFixture, EventEntryFixture } from '@shared/data/__tests__/EventEntryFixture';
import { assert } from 'console';

describe('EventServiceEntryImpl', () => {
  let service: EventEntryServiceImpl;
  let dataSource: DataSource<EventEntry>;

  beforeEach(async () => {
    jest.resetAllMocks();
    dataSource = new TestDataSource<EventEntry>();
    service = new EventEntryServiceImpl(dataSource);
    dataSource.delete(service.tableName, {});
    const count = await dataSource.count(service.tableName, {});
    assert(count === 0);
  });

  describe('list', () => {
    const start = new Date('2023-07-01T6:00:00+0900');
    const end = new Date('2023-07-02T6:00:00+0900');
    const userId = 'user1';
    const testData = [
      {
        description: '取得期間より前にあるイベント',
        preconditions: [
          EventEntryFixture.default({
            id: '1',
            userId: userId,
            eventType: EVENT_TYPE.PLAN,
            start: EventDateTimeFixture.default({
              dateTime: new Date('2023-07-01T3:00:00+0900'),
            }),
            end: EventDateTimeFixture.default({
              dateTime: new Date('2023-07-01T5:00:00+0900'),
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
            start: EventDateTimeFixture.default({
              dateTime: new Date('2023-07-01T5:00:00+0900'),
            }),
            end: EventDateTimeFixture.default({
              dateTime: new Date('2023-07-01T7:00:00+0900'),
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
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T5:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T7:00:00+0900'),
              }),
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
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T12:00:00+0900'),
              }),
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
            start: EventDateTimeFixture.default({
              dateTime: new Date('2023-07-02T5:00:00+0900'),
            }),
            end: EventDateTimeFixture.default({
              dateTime: new Date('2023-07-02T7:00:00+0900'),
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
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-02T5:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-02T7:00:00+0900'),
              }),
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
    ];
    it.each(testData)('%s', async (testData) => {
      for (const precondiction of testData.preconditions) {
        await service.save(precondiction);
      }
      const count = await dataSource.count(service.tableName, {});
      console.log('db.count', count);
      const events = await service.list(userId, start, end);
      const expected = testData.expected;
      expect(events).toHaveLength(expected.count);
      for (let i = 0; i < events.length; i++) {
        expect(events[i]).toContain(expected.events[i]);
      }
    });
  });
});
