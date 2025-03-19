import { IEventAggregationService } from '../IEventAggregationService';
import { EventAggregationServiceImpl } from '../EventAggregationServiceImpl';
import { IEventEntrySearchService } from '../IEventEntrySearchService';
import { EventEntrySearchServiceMockBuilder } from './__mocks__/EventEntrySearchServiceMockBuilder';
import { EventDateTimeFixture } from '@shared/data/__tests__/EventEntryFixture';
import { EventEntrySearchFixture } from '@main/dto/__tests__/EventEntrySearchFixture';
import { EVENT_TYPE } from '@shared/data/EventEntry';

describe('EventAggregationServiceImpl', () => {
  let service: IEventAggregationService;
  let eventEntrySearchService: IEventEntrySearchService;

  beforeEach(() => {
    jest.resetAllMocks();
    eventEntrySearchService = new EventEntrySearchServiceMockBuilder().build();
    service = new EventAggregationServiceImpl(eventEntrySearchService);
  });

  describe('aggregatePlannedTimeByTasks', () => {
    describe('モックの呼び出し時のパラメータをテスト', () => {
      it('eventEntrySearchService.getAllByTask', async () => {
        jest.spyOn(eventEntrySearchService, 'getTaskAssociatedEvents').mockResolvedValue([]);
        const eventType = EVENT_TYPE.PLAN;
        await service.aggregatePlannedTimeByTasks([]);
        expect(eventEntrySearchService.getTaskAssociatedEvents).toHaveBeenCalledWith(
          undefined,
          undefined,
          eventType
        );
      });
    });

    describe('返り値のテスト', () => {
      const testCases = [
        {
          description: '合計の計算のテスト',
          taskIds: ['t1'],
          eventEntrySearchs: [
            EventEntrySearchFixture.default({
              eventEntryId: '1',
              eventType: EVENT_TYPE.PLAN,
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-03T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({ dateTime: new Date('2023-07-03T11:00:00+0900') }),
              taskId: 't1',
            }),
            EventEntrySearchFixture.default({
              eventEntryId: '2',
              eventType: EVENT_TYPE.SHARED,
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-03T13:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({ dateTime: new Date('2023-07-03T14:00:00+0900') }),
              taskId: 't1',
            }),
          ],
          expected: new Map<string, number>([['t1', 120 * 60 * 1000]]),
        },
        {
          description: 'タスクに対応する予定がない場合のテスト',
          taskIds: ['t1', 't2'],
          eventEntrySearchs: [
            EventEntrySearchFixture.default({
              eventEntryId: '1',
              eventType: EVENT_TYPE.PLAN,
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-03T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({ dateTime: new Date('2023-07-03T11:00:00+0900') }),
              taskId: 't1',
            }),
          ],
          expected: new Map<string, number>([
            ['t1', 60 * 60 * 1000],
            ['t2', 0],
          ]),
        },
      ];

      it.each(testCases)('%s', async (testCase) => {
        jest
          .spyOn(eventEntrySearchService, 'getTaskAssociatedEvents')
          .mockResolvedValue(testCase.eventEntrySearchs);

        const plannedTimeMap = await service.aggregatePlannedTimeByTasks(testCase.taskIds);

        expect(plannedTimeMap.size).toEqual(testCase.taskIds.length);
        for (const taskId of testCase.taskIds) {
          expect(plannedTimeMap.get(taskId)).toEqual(testCase.expected.get(taskId));
        }
      });
    });
  });

  describe('aggregateByProject', () => {
    const start = new Date('2024-12-30T10:00:00+0900');
    const end = new Date('2024-12-30T10:00:00+0900');
    const eventType = EVENT_TYPE.PLAN;

    describe('モックの呼び出し時のパラメータをテスト', () => {
      it('eventEntrySearchService.getProjectAssociatedEvents', async () => {
        jest.spyOn(eventEntrySearchService, 'getProjectAssociatedEvents').mockResolvedValue([]);
        await service.aggregateByProject(start, end, eventType);
        expect(eventEntrySearchService.getProjectAssociatedEvents).toHaveBeenCalledWith(
          start,
          end,
          eventType
        );
      });
    });

    describe('返り値のテスト', () => {
      const testCases = [
        {
          description: '合計の計算のテスト',
          eventEntrySearchs: [
            EventEntrySearchFixture.default({
              eventEntryId: '1',
              eventType: EVENT_TYPE.PLAN,
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-03T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({ dateTime: new Date('2023-07-03T11:00:00+0900') }),
              projectId: 'p1',
            }),
            EventEntrySearchFixture.default({
              eventEntryId: '2',
              eventType: EVENT_TYPE.SHARED,
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-03T13:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({ dateTime: new Date('2023-07-03T14:00:00+0900') }),
              projectId: 'p1',
            }),
            EventEntrySearchFixture.default({
              eventEntryId: '3',
              eventType: EVENT_TYPE.SHARED,
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-03T13:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({ dateTime: new Date('2023-07-03T14:00:00+0900') }),
              projectId: 'p2',
            }),
          ],
          expected: {
            projectIds: ['p1', 'p2'],
            result: new Map<string, number>([
              ['p1', 120 * 60 * 1000],
              ['p2', 60 * 60 * 1000],
            ]),
          },
        },
        {
          description: 'プロジェクトに対応するイベントがない場合のテスト',
          eventEntrySearchs: [
            EventEntrySearchFixture.default({
              eventEntryId: '1',
              eventType: EVENT_TYPE.PLAN,
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-03T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({ dateTime: new Date('2023-07-03T11:00:00+0900') }),
            }),
          ],
          expected: {
            projectIds: [],
            result: new Map<string, number>([]),
          },
        },
      ];

      it.each(testCases)('%s', async (testCase) => {
        jest
          .spyOn(eventEntrySearchService, 'getProjectAssociatedEvents')
          .mockResolvedValue(testCase.eventEntrySearchs);

        const aggregateEventMap = await service.aggregateByProject(start, end, eventType);

        expect(aggregateEventMap.size).toEqual(testCase.expected.projectIds.length);
        for (const projectId of testCase.expected.projectIds) {
          expect(aggregateEventMap.get(projectId)).toEqual(testCase.expected.result.get(projectId));
        }
      });
    });
  });

  describe('aggregateByCategory', () => {
    const start = new Date('2024-12-30T10:00:00+0900');
    const end = new Date('2024-12-30T10:00:00+0900');
    const eventType = EVENT_TYPE.PLAN;

    describe('モックの呼び出し時のパラメータをテスト', () => {
      it('eventEntrySearchService.getCategoryAssociatedEvents', async () => {
        jest.spyOn(eventEntrySearchService, 'getCategoryAssociatedEvents').mockResolvedValue([]);
        await service.aggregateByCategory(start, end, eventType);
        expect(eventEntrySearchService.getCategoryAssociatedEvents).toHaveBeenCalledWith(
          start,
          end,
          eventType
        );
      });
    });

    describe('返り値のテスト', () => {
      const testCases = [
        {
          description: '合計の計算のテスト',
          eventEntrySearchs: [
            EventEntrySearchFixture.default({
              eventEntryId: '1',
              eventType: EVENT_TYPE.PLAN,
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-03T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({ dateTime: new Date('2023-07-03T11:00:00+0900') }),
              categoryId: 'c1',
            }),
            EventEntrySearchFixture.default({
              eventEntryId: '2',
              eventType: EVENT_TYPE.SHARED,
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-03T13:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({ dateTime: new Date('2023-07-03T14:00:00+0900') }),
              categoryId: 'c1',
            }),
            EventEntrySearchFixture.default({
              eventEntryId: '3',
              eventType: EVENT_TYPE.SHARED,
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-03T13:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({ dateTime: new Date('2023-07-03T14:00:00+0900') }),
              categoryId: 'c2',
            }),
          ],
          expected: {
            categoryIds: ['c1', 'c2'],
            result: new Map<string, number>([
              ['c1', 120 * 60 * 1000],
              ['c2', 60 * 60 * 1000],
            ]),
          },
        },
        {
          description: 'カテゴリに対応するイベントがない場合のテスト',
          eventEntrySearchs: [
            EventEntrySearchFixture.default({
              eventEntryId: '1',
              eventType: EVENT_TYPE.PLAN,
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-03T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({ dateTime: new Date('2023-07-03T11:00:00+0900') }),
            }),
          ],
          expected: {
            categoryIds: [],
            result: new Map<string, number>([]),
          },
        },
      ];

      it.each(testCases)('%s', async (testCase) => {
        jest
          .spyOn(eventEntrySearchService, 'getCategoryAssociatedEvents')
          .mockResolvedValue(testCase.eventEntrySearchs);

        const aggregateEventMap = await service.aggregateByCategory(start, end, eventType);

        expect(aggregateEventMap.size).toEqual(testCase.expected.categoryIds.length);
        for (const categoryId of testCase.expected.categoryIds) {
          expect(aggregateEventMap.get(categoryId)).toEqual(
            testCase.expected.result.get(categoryId)
          );
        }
      });
    });
  });

  describe('aggregateByTask', () => {
    const start = new Date('2024-12-30T10:00:00+0900');
    const end = new Date('2024-12-30T10:00:00+0900');
    const eventType = EVENT_TYPE.PLAN;

    describe('モックの呼び出し時のパラメータをテスト', () => {
      it('eventEntrySearchService.getTaskAssociatedEvents', async () => {
        jest.spyOn(eventEntrySearchService, 'getTaskAssociatedEvents').mockResolvedValue([]);
        await service.aggregateByTask(start, end, eventType);
        expect(eventEntrySearchService.getTaskAssociatedEvents).toHaveBeenCalledWith(
          start,
          end,
          eventType
        );
      });
    });

    describe('返り値のテスト', () => {
      const testCases = [
        {
          description: '合計の計算のテスト',
          eventEntrySearchs: [
            EventEntrySearchFixture.default({
              eventEntryId: '1',
              eventType: EVENT_TYPE.PLAN,
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-03T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({ dateTime: new Date('2023-07-03T11:00:00+0900') }),
              taskId: 't1',
            }),
            EventEntrySearchFixture.default({
              eventEntryId: '2',
              eventType: EVENT_TYPE.SHARED,
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-03T13:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({ dateTime: new Date('2023-07-03T14:00:00+0900') }),
              taskId: 't1',
            }),
            EventEntrySearchFixture.default({
              eventEntryId: '3',
              eventType: EVENT_TYPE.SHARED,
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-03T13:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({ dateTime: new Date('2023-07-03T14:00:00+0900') }),
              taskId: 't2',
            }),
          ],
          expected: {
            taskIds: ['t1', 't2'],
            result: new Map<string, number>([
              ['t1', 120 * 60 * 1000],
              ['t2', 60 * 60 * 1000],
            ]),
          },
        },
        {
          description: 'タスクに対応するイベントがない場合のテスト',
          eventEntrySearchs: [
            EventEntrySearchFixture.default({
              eventEntryId: '1',
              eventType: EVENT_TYPE.PLAN,
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-03T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({ dateTime: new Date('2023-07-03T11:00:00+0900') }),
            }),
          ],
          expected: {
            taskIds: [],
            result: new Map<string, number>([]),
          },
        },
      ];

      it.each(testCases)('%s', async (testCase) => {
        jest
          .spyOn(eventEntrySearchService, 'getTaskAssociatedEvents')
          .mockResolvedValue(testCase.eventEntrySearchs);

        const aggregateEventMap = await service.aggregateByTask(start, end, eventType);

        expect(aggregateEventMap.size).toEqual(testCase.expected.taskIds.length);
        for (const taskId of testCase.expected.taskIds) {
          expect(aggregateEventMap.get(taskId)).toEqual(testCase.expected.result.get(taskId));
        }
      });
    });
  });

  describe('aggregateByLabel', () => {
    const start = new Date('2024-12-30T10:00:00+0900');
    const end = new Date('2024-12-30T10:00:00+0900');
    const eventType = EVENT_TYPE.PLAN;

    describe('モックの呼び出し時のパラメータをテスト', () => {
      it('eventEntrySearchService.getLabelAssociatedEvents', async () => {
        jest.spyOn(eventEntrySearchService, 'getLabelAssociatedEvents').mockResolvedValue([]);
        await service.aggregateByLabel(start, end, eventType);
        expect(eventEntrySearchService.getLabelAssociatedEvents).toHaveBeenCalledWith(
          start,
          end,
          eventType
        );
      });
    });

    describe('返り値のテスト', () => {
      const testCases = [
        {
          description: '合計の計算のテスト',
          eventEntrySearchs: [
            EventEntrySearchFixture.default({
              eventEntryId: '1',
              eventType: EVENT_TYPE.PLAN,
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-03T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({ dateTime: new Date('2023-07-03T11:00:00+0900') }),
              labelIds: ['l1'],
            }),
            EventEntrySearchFixture.default({
              eventEntryId: '2',
              eventType: EVENT_TYPE.SHARED,
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-03T13:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({ dateTime: new Date('2023-07-03T14:00:00+0900') }),
              labelIds: ['l1'],
            }),
            EventEntrySearchFixture.default({
              eventEntryId: '3',
              eventType: EVENT_TYPE.SHARED,
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-03T13:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({ dateTime: new Date('2023-07-03T14:00:00+0900') }),
              labelIds: ['l2', 'l3'],
            }),
          ],
          expected: {
            labelIds: ['l1', 'l2', 'l3'],
            result: new Map<string, number>([
              ['l1', 120 * 60 * 1000],
              ['l2', 60 * 60 * 1000],
              ['l3', 60 * 60 * 1000],
            ]),
          },
        },
        {
          description: 'ラベルに対応するイベントがない場合のテスト',
          eventEntrySearchs: [
            EventEntrySearchFixture.default({
              eventEntryId: '1',
              eventType: EVENT_TYPE.PLAN,
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-03T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({ dateTime: new Date('2023-07-03T11:00:00+0900') }),
            }),
          ],
          expected: {
            labelIds: [],
            result: new Map<string, number>([]),
          },
        },
      ];

      it.each(testCases)('%s', async (testCase) => {
        jest
          .spyOn(eventEntrySearchService, 'getLabelAssociatedEvents')
          .mockResolvedValue(testCase.eventEntrySearchs);

        const aggregateEventMap = await service.aggregateByLabel(start, end, eventType);

        expect(aggregateEventMap.size).toEqual(testCase.expected.labelIds.length);
        for (const labelId of testCase.expected.labelIds) {
          expect(aggregateEventMap.get(labelId)).toEqual(testCase.expected.result.get(labelId));
        }
      });
    });
  });
});
