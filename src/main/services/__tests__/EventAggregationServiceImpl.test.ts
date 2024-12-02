import { IEventAggregationService } from '../IEventAggregationService';
import { EventAggregationServiceImpl } from '../EventAggregationServiceImpl';
import { IEventEntryService } from '../IEventEntryService';
import { EventEntryServiceMockBuilder } from './__mocks__/EventEntryServiceMockBuilder';
import { EventDateTimeFixture, EventEntryFixture } from '@shared/data/__tests__/EventEntryFixture';
import { EVENT_TYPE } from '@shared/data/EventEntry';

describe('EventAggregationServiceImpl', () => {
  let service: IEventAggregationService;
  let eventEntryService: IEventEntryService;

  beforeEach(() => {
    jest.resetAllMocks();
    eventEntryService = new EventEntryServiceMockBuilder().build();
    service = new EventAggregationServiceImpl(eventEntryService);
  });

  describe('getPlannedTimeByTasks', () => {
    describe('モックの呼び出し時のパラメータをテスト', () => {
      it('eventEntryService.getAllByTask', async () => {
        jest.spyOn(eventEntryService, 'getAllByTasks').mockResolvedValue([]);
        const userId = 'userId';
        const taskIds = ['t1', 't2'];
        await service.getPlannedTimeByTasks(userId, taskIds);
        expect(eventEntryService.getAllByTasks).toHaveBeenCalledWith(userId, taskIds);
      });
    });

    describe('返り値のテスト', () => {
      const userId = 'user';
      const testCases = [
        {
          description: '合計の計算のテスト',
          taskIds: ['t1'],
          eventEntries: [
            EventEntryFixture.default({
              id: '1',
              eventType: EVENT_TYPE.PLAN,
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-03T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({ dateTime: new Date('2023-07-03T11:00:00+0900') }),
              taskId: 't1',
            }),
            EventEntryFixture.default({
              id: '2',
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
          eventEntries: [
            EventEntryFixture.default({
              id: '1',
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
        jest.spyOn(eventEntryService, 'getAllByTasks').mockResolvedValue(testCase.eventEntries);

        const plannedTimeMap = await service.getPlannedTimeByTasks(userId, testCase.taskIds);

        expect(plannedTimeMap.size).toEqual(testCase.taskIds.length);
        for (const taskId of testCase.taskIds) {
          expect(plannedTimeMap.get(taskId)).toEqual(testCase.expected.get(taskId));
        }
      });
    });
  });
});
