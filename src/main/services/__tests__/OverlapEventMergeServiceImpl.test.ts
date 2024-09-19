import { EventDateTimeFixture, EventEntryFixture } from '@shared/data/__tests__/EventEntryFixture';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { IOverlapEventMergeService } from '../IOverlapEventMergeService';
import { OverlapEventMergeServiceImpl } from '../OverlapEventMergeServiceImpl';

describe('ActivityServiceImpl', () => {
  let service: IOverlapEventMergeService;
  const userId = 'test user';

  beforeEach(() => {
    jest.resetAllMocks();
    service = new OverlapEventMergeServiceImpl();
  });

  describe('mergeOverlapEvent', () => {
    describe('返り値のテスト', () => {
      const testCases = [
        {
          description: '連続した同じ実績はマージされる',
          eventEntries: [
            EventEntryFixture.default({
              id: '1',
              userId: userId,
              eventType: EVENT_TYPE.ACTUAL,
              summary: '仮実績',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T11:00:00+0900'),
              }),
              projectId: 'pr1',
              categoryId: 'c1',
              labelIds: ['l1'],
              taskId: 't1',
            }),
            EventEntryFixture.default({
              id: '2',
              userId: userId,
              eventType: EVENT_TYPE.ACTUAL,
              summary: '仮実績',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T11:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T12:00:00+0900'),
              }),
              projectId: 'pr1',
              categoryId: 'c1',
              labelIds: ['l1'],
              taskId: 't1',
            }),
            EventEntryFixture.default({
              id: '3',
              userId: userId,
              eventType: EVENT_TYPE.ACTUAL,
              summary: '仮実績',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T12:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T13:00:00+0900'),
              }),
              projectId: 'pr1',
              categoryId: 'c1',
              labelIds: ['l1'],
              taskId: 't1',
            }),
          ],
          expected: [
            EventEntryFixture.default({
              id: expect.any(String),
              userId: userId,
              eventType: EVENT_TYPE.ACTUAL,
              summary: '仮実績',
              start: EventDateTimeFixture.default({
                date: null,
                dateTime: new Date('2023-07-01T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                date: null,
                dateTime: new Date('2023-07-01T13:00:00+0900'),
              }),
              projectId: 'pr1',
              categoryId: 'c1',
              labelIds: ['l1'],
              taskId: 't1',
            }),
          ],
        },
        {
          description: 'プロジェクト等が異なればマージされない',
          eventEntries: [
            EventEntryFixture.default({
              id: '1',
              userId: userId,
              eventType: EVENT_TYPE.ACTUAL,
              summary: '仮実績',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T11:00:00+0900'),
              }),
              projectId: 'pr1',
              categoryId: 'c1',
              labelIds: ['l1'],
              taskId: 't1',
            }),
            EventEntryFixture.default({
              id: '2',
              userId: userId,
              eventType: EVENT_TYPE.ACTUAL,
              summary: '仮実績',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T11:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T12:00:00+0900'),
              }),
              projectId: 'pr2',
              categoryId: 'c1',
              labelIds: ['l1'],
              taskId: 't1',
            }),
          ],
          expected: [
            EventEntryFixture.default({
              id: expect.any(String),
              userId: userId,
              eventType: EVENT_TYPE.ACTUAL,
              summary: '仮実績',
              start: EventDateTimeFixture.default({
                date: null,
                dateTime: new Date('2023-07-01T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                date: null,
                dateTime: new Date('2023-07-01T11:00:00+0900'),
              }),
              projectId: 'pr1',
              categoryId: 'c1',
              labelIds: ['l1'],
              taskId: 't1',
            }),
            EventEntryFixture.default({
              id: expect.any(String),
              userId: userId,
              eventType: EVENT_TYPE.ACTUAL,
              summary: '仮実績',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T11:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T12:00:00+0900'),
              }),
              projectId: 'pr2',
              categoryId: 'c1',
              labelIds: ['l1'],
              taskId: 't1',
            }),
          ],
        },
        {
          description: '連続していない実績はマージされない',
          eventEntries: [
            EventEntryFixture.default({
              id: '1',
              userId: userId,
              eventType: EVENT_TYPE.ACTUAL,
              summary: '仮実績',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T11:00:00+0900'),
              }),
              projectId: 'pr1',
              categoryId: 'c1',
              labelIds: ['l1'],
              taskId: 't1',
            }),
            EventEntryFixture.default({
              id: '2',
              userId: userId,
              eventType: EVENT_TYPE.ACTUAL,
              summary: '仮実績',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T12:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T13:00:00+0900'),
              }),
              projectId: 'pr1',
              categoryId: 'c1',
              labelIds: ['l1'],
              taskId: 't1',
            }),
          ],
          expected: [
            EventEntryFixture.default({
              id: expect.any(String),
              userId: userId,
              eventType: EVENT_TYPE.ACTUAL,
              summary: '仮実績',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T11:00:00+0900'),
              }),
              projectId: 'pr1',
              categoryId: 'c1',
              labelIds: ['l1'],
              taskId: 't1',
            }),
            EventEntryFixture.default({
              id: expect.any(String),
              userId: userId,
              eventType: EVENT_TYPE.ACTUAL,
              summary: '仮実績',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T12:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T13:00:00+0900'),
              }),
              projectId: 'pr1',
              categoryId: 'c1',
              labelIds: ['l1'],
              taskId: 't1',
            }),
          ],
        },
        {
          description: '削除された実績はマージされない',
          eventEntries: [
            EventEntryFixture.default({
              id: '1',
              userId: userId,
              eventType: EVENT_TYPE.ACTUAL,
              summary: '仮実績',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T11:00:00+0900'),
              }),
              projectId: 'pr1',
              categoryId: 'c1',
              labelIds: ['l1'],
              taskId: 't1',
              deleted: new Date('2023-07-01T10:00:00+0900'),
            }),
            EventEntryFixture.default({
              id: '2',
              userId: userId,
              eventType: EVENT_TYPE.ACTUAL,
              summary: '仮実績',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T11:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T12:00:00+0900'),
              }),
              projectId: 'pr1',
              categoryId: 'c1',
              labelIds: ['l1'],
              taskId: 't1',
              deleted: new Date('2023-07-01T10:00:00+0900'),
            }),
          ],
          expected: [
            EventEntryFixture.default({
              id: expect.any(String),
              userId: userId,
              eventType: EVENT_TYPE.ACTUAL,
              summary: '仮実績',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T11:00:00+0900'),
              }),
              projectId: 'pr1',
              categoryId: 'c1',
              labelIds: ['l1'],
              taskId: 't1',
              deleted: new Date('2023-07-01T10:00:00+0900'),
            }),
            EventEntryFixture.default({
              id: expect.any(String),
              userId: userId,
              eventType: EVENT_TYPE.ACTUAL,
              summary: '仮実績',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T11:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T12:00:00+0900'),
              }),
              projectId: 'pr1',
              categoryId: 'c1',
              labelIds: ['l1'],
              taskId: 't1',
              deleted: new Date('2023-07-01T10:00:00+0900'),
            }),
          ],
        },
      ];

      it.each(testCases)('%s', async (testCase) => {
        const mergedEvents = await service.mergeOverlapEvent(testCase.eventEntries);
        expect(mergedEvents).toEqual(testCase.expected);
      });
    });
  });
});
