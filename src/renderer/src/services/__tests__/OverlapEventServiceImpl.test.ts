import { EventEntry } from '@shared/dto/EventEntry';
import { OverlapEventServiceImpl } from '../OverlapEventServiceImpl';
import { EventEntryFixture } from '@shared/dto/__tests__/EventEntryFixture';
import { EventEntryTimeCell, EventTimeCell } from '../EventTimeCell';

describe('OverlapEventServiceImpl', () => {
  let service: OverlapEventServiceImpl;

  beforeEach(() => {
    service = new OverlapEventServiceImpl();
  });

  const eventTimeCellFixture = (ee: EventEntry): EventTimeCell => {
    return EventEntryTimeCell.fromEventEntry(ee);
  };

  test.each([
    [
      'empty なイベント',
      [],
      (result): void => {
        expect(result).toEqual([]);
      },
    ],
    [
      '1つのイベント',
      [eventTimeCellFixture(EventEntryFixture.default())],
      (result): void => {
        expect(result[0].overlappingIndex).toBe(0);
        expect(result[0].overlappingCount).toBe(1);
      },
    ],
    [
      '部分的に重なるイベント(1)',
      // 10:00  +------+
      //        |event1|
      // 10:30  |      | +------+
      //        |      | |event2|
      // 11:00  +------+ |      |
      //                 |      |
      // 11:30           +------+
      [
        eventTimeCellFixture(
          EventEntryFixture.default({
            id: 'event1',
            start: { dateTime: new Date('2023-07-01T10:00:00+0900') },
            end: { dateTime: new Date('2023-07-01T11:00:00+0900') },
          })
        ),
        eventTimeCellFixture(
          EventEntryFixture.default({
            id: 'event2',
            start: { dateTime: new Date('2023-07-01T10:30:00+0900') },
            end: { dateTime: new Date('2023-07-01T11:30:00+0900') },
          })
        ),
      ],
      (result): void => {
        expect(result.length).toBe(2);
        {
          const actual = result[0];
          expect(actual.overlappingIndex).toBe(0);
          expect(actual.overlappingCount).toBe(2);
        }
        {
          const actual = result[1];
          expect(actual.overlappingIndex).toBe(1);
          expect(actual.overlappingCount).toBe(2);
        }
      },
    ],
    [
      '部分的に重なるイベント(2)',
      // 10:00           +------+
      //                 |event2|
      // 10:30  +------+ |      |
      //        |event1| |      |
      // 11:00  |      | +------+
      //        |      |
      // 11:30  +------+
      [
        eventTimeCellFixture(
          EventEntryFixture.default({
            id: 'event1',
            start: { dateTime: new Date('2023-07-01T10:30:00+0900') },
            end: { dateTime: new Date('2023-07-01T11:30:00+0900') },
          })
        ),
        eventTimeCellFixture(
          EventEntryFixture.default({
            id: 'event2',
            start: { dateTime: new Date('2023-07-01T10:00:00+0900') },
            end: { dateTime: new Date('2023-07-01T11:00:00+0900') },
          })
        ),
      ],
      (result): void => {
        expect(result.length).toBe(2);
        {
          const actual = result[0];
          expect(actual.overlappingIndex).toBe(0);
          expect(actual.overlappingCount).toBe(2);
        }
        {
          const actual = result[1];
          expect(actual.overlappingIndex).toBe(1);
          expect(actual.overlappingCount).toBe(2);
        }
      },
    ],
    [
      '部分的に重なるイベント(3)',
      // 10:00  +------+
      //        |event1|
      // 10:30  |      | +------+
      //        |      | |event2|
      // 11:00  |      | |      |
      //        |      | +------+
      // 11:30  +------+
      [
        eventTimeCellFixture(
          EventEntryFixture.default({
            id: 'event1',
            start: { dateTime: new Date('2023-07-01T10:00:00+0900') },
            end: { dateTime: new Date('2023-07-01T11:30:00+0900') },
          })
        ),
        eventTimeCellFixture(
          EventEntryFixture.default({
            id: 'event2',
            start: { dateTime: new Date('2023-07-01T10:30:00+0900') },
            end: { dateTime: new Date('2023-07-01T11:15:00+0900') },
          })
        ),
      ],
      (result): void => {
        expect(result.length).toBe(2);
        {
          const actual = result[0];
          expect(actual.overlappingIndex).toBe(0);
          expect(actual.overlappingCount).toBe(2);
        }
        {
          const actual = result[1];
          expect(actual.overlappingIndex).toBe(1);
          expect(actual.overlappingCount).toBe(2);
        }
      },
    ],
    [
      '部分的に重なるイベント(4)',
      // 10:00           +------+
      //                 |event2|
      // 10:30  +------+ |      |
      //        |event1| |      |
      // 11:00  |      | |      |
      //        +------+ |      |
      // 11:30           +------+
      [
        eventTimeCellFixture(
          EventEntryFixture.default({
            id: 'event1',
            start: { dateTime: new Date('2023-07-01T10:30:00+0900') },
            end: { dateTime: new Date('2023-07-01T11:15:00+0900') },
          })
        ),
        eventTimeCellFixture(
          EventEntryFixture.default({
            id: 'event2',
            start: { dateTime: new Date('2023-07-01T10:00:00+0900') },
            end: { dateTime: new Date('2023-07-01T11:30:00+0900') },
          })
        ),
      ],
      (result): void => {
        expect(result.length).toBe(2);
        {
          const actual = result[0];
          expect(actual.overlappingIndex).toBe(0);
          expect(actual.overlappingCount).toBe(2);
        }
        {
          const actual = result[1];
          expect(actual.overlappingIndex).toBe(1);
          expect(actual.overlappingCount).toBe(2);
        }
      },
    ],
    [
      '完全に重なるイベント',
      // 10:00
      //
      // 10:30  +------+ +------+
      //        |event1| |event2|
      // 11:00  |      | |      |
      //        +------+ +------+
      // 11:30
      [
        eventTimeCellFixture(
          EventEntryFixture.default({
            id: 'event1',
            start: { dateTime: new Date('2023-07-01T10:30:00+0900') },
            end: { dateTime: new Date('2023-07-01T11:15:00+0900') },
          })
        ),
        eventTimeCellFixture(
          EventEntryFixture.default({
            id: 'event2',
            start: { dateTime: new Date('2023-07-01T10:30:00+0900') },
            end: { dateTime: new Date('2023-07-01T11:15:00+0900') },
          })
        ),
      ],
      (result): void => {
        expect(result.length).toBe(2);
        {
          const actual = result[0];
          expect(actual.overlappingIndex).toBe(0);
          expect(actual.overlappingCount).toBe(2);
        }
        {
          const actual = result[1];
          expect(actual.overlappingIndex).toBe(1);
          expect(actual.overlappingCount).toBe(2);
        }
      },
    ],
    [
      '重ならないイベント(1)',
      // 10:00  +------+
      //        |event1|
      // 10:30  +------+ +------+
      //                 |event2|
      // 11:00           +------+
      //
      // 11:30
      [
        eventTimeCellFixture(
          EventEntryFixture.default({
            id: 'event1',
            start: { dateTime: new Date('2023-07-01T10:00:00+0900') },
            end: { dateTime: new Date('2023-07-01T10:30:00+0900') },
          })
        ),
        eventTimeCellFixture(
          EventEntryFixture.default({
            id: 'event2',
            start: { dateTime: new Date('2023-07-01T10:30:00+0900') },
            end: { dateTime: new Date('2023-07-01T11:00:00+0900') },
          })
        ),
      ],
      (result): void => {
        expect(result.length).toBe(2);
        {
          const actual = result[0];
          expect(actual.overlappingIndex).toBe(0);
          expect(actual.overlappingCount).toBe(1);
        }
        {
          const actual = result[1];
          expect(actual.overlappingIndex).toBe(0);
          expect(actual.overlappingCount).toBe(1);
        }
      },
    ],
    [
      '重ならないイベント(2)',
      // 10:00           +------+
      //                 |event2|
      // 10:30  +------+ +------+
      //        |event1|
      // 11:00  +------+
      //
      // 11:30
      [
        eventTimeCellFixture(
          EventEntryFixture.default({
            id: 'event1',
            start: { dateTime: new Date('2023-07-01T10:30:00+0900') },
            end: { dateTime: new Date('2023-07-01T11:00:00+0900') },
          })
        ),
        eventTimeCellFixture(
          EventEntryFixture.default({
            id: 'event2',
            start: { dateTime: new Date('2023-07-01T10:00:00+0900') },
            end: { dateTime: new Date('2023-07-01T10:30:00+0900') },
          })
        ),
      ],
      (result): void => {
        expect(result.length).toBe(2);
        {
          const actual = result[0];
          expect(actual.overlappingIndex).toBe(0);
          expect(actual.overlappingCount).toBe(1);
        }
        {
          const actual = result[1];
          expect(actual.overlappingIndex).toBe(0);
          expect(actual.overlappingCount).toBe(1);
        }
      },
    ],
    [
      '3つの重なりイベント(1)',
      // 10:00  +------+
      //        |event1| +------+
      // 10:30  +------+ |event2|
      //                 |      |
      // 11:00           |      | +------+
      //                 +------+ |event3|
      // 11:30                    +------+
      [
        eventTimeCellFixture(
          EventEntryFixture.default({
            id: 'event1',
            start: { dateTime: new Date('2023-07-01T10:00:00+0900') },
            end: { dateTime: new Date('2023-07-01T10:30:00+0900') },
          })
        ),
        eventTimeCellFixture(
          EventEntryFixture.default({
            id: 'event2',
            start: { dateTime: new Date('2023-07-01T10:15:00+0900') },
            end: { dateTime: new Date('2023-07-01T11:15:00+0900') },
          })
        ),
        eventTimeCellFixture(
          EventEntryFixture.default({
            id: 'event3',
            start: { dateTime: new Date('2023-07-01T11:00:00+0900') },
            end: { dateTime: new Date('2023-07-01T11:30:00+0900') },
          })
        ),
      ],
      (result): void => {
        expect(result.length).toBe(3);
        {
          const actual = result[0];
          expect(actual.overlappingIndex).toBe(0);
          expect(actual.overlappingCount).toBe(3);
        }
        {
          const actual = result[1];
          expect(actual.overlappingIndex).toBe(1);
          expect(actual.overlappingCount).toBe(3);
        }
        {
          const actual = result[2];
          expect(actual.overlappingIndex).toBe(2);
          expect(actual.overlappingCount).toBe(3);
        }
      },
    ],
  ])('%s', (_desc, events, checkFn) => {
    const result = service.execute(events);
    checkFn(result);
  });
});
