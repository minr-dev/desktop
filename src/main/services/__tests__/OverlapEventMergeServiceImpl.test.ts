import { EventDateTimeFixture, EventEntryFixture } from '@shared/data/__tests__/EventEntryFixture';
import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
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

        // expectedから、比較すべきところだけ抽出
        const expectedArray = testCase.expected.map(
          (expected: EventEntry): Partial<EventEntry> =>
            expect.objectContaining({
              userId: expected.userId,
              eventType: expected.eventType,
              summary: expected.summary,
              description: expected.description,
              start: expect.objectContaining({ dateTime: expected.start.dateTime }),
              end: expect.objectContaining({ dateTime: expected.end.dateTime }),
              isProvisional: expected.isProvisional,
              projectId: expected.projectId,
              categoryId: expected.categoryId,
              labelIds: expected.labelIds,
              taskId: expected.taskId,
            })
        );
        expect(mergedEvents).toHaveLength(expectedArray.length);
        expect(mergedEvents).toEqual(expect.arrayContaining(expectedArray));
      });
    });
  });
});
