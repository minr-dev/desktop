import { IEventAggregationService } from '../IEventAggregationService';
import { EventDateTimeFixture, EventEntryFixture } from '@shared/data/__tests__/EventEntryFixture';
import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { ITaskAllocationService } from '../ITaskAllocationService';
import { TaskAllocationServiceImpl } from '../TaskAllocationServiceImpl';
import { IUserDetailsService } from '../IUserDetailsService';
import { UserDetailsServiceMockBuilder } from './__mocks__/UserDetailsServiceMockBuilder';
import { EventAggregationServiceMockBuilder } from './__mocks__/EventAggregationServiceMockBuilder';
import { TaskFixture } from '@shared/data/__tests__/TaskFixture';
import { OverrunTaskFixture } from '@shared/data/__tests__/OverrunTaskFixture';

describe('TaskAllocationServiceImpl', () => {
  let service: ITaskAllocationService;
  let userDetailService: IUserDetailsService;
  let eventAggregationService: IEventAggregationService;

  const userId = 'test user';

  beforeEach(() => {
    jest.resetAllMocks();
    userDetailService = new UserDetailsServiceMockBuilder().withGetUserId(userId).build();
    eventAggregationService = new EventAggregationServiceMockBuilder().build();
    service = new TaskAllocationServiceImpl(userDetailService, eventAggregationService);
  });

  describe('allocate', () => {
    describe('モックの呼び出し時のパラメータをテスト', () => {
      it('eventAggregationService.getPlannedTimeByTasks', async () => {
        const tasks = [TaskFixture.default({ id: '1' }), TaskFixture.default({ id: '2' })];
        const taskIds = ['1', '2'];
        jest.spyOn(eventAggregationService, 'aggregatePlannedTimeByTasks').mockResolvedValue(
          new Map<string, number>([
            ['1', 0],
            ['2', 0],
          ])
        );
        await service.allocate([], tasks);
        expect(eventAggregationService.aggregatePlannedTimeByTasks).toHaveBeenCalledWith(taskIds);
      });
    });

    describe('返り値のテスト', () => {
      describe('超過工数なし', () => {
        const testCases = [
          {
            description: '空き時間よりタスクが少ないパターン',
            timeSlots: [
              {
                start: new Date('2023-07-03T13:00:00+0900'),
                end: new Date('2023-07-03T19:00:00+0900'),
              },
            ],
            extraAllocation: undefined,
            tasks: [
              TaskFixture.default({
                id: 't1',
                name: 'タスク1',
                projectId: 'pr1',
                description: 'タスク1の説明',
                plannedHours: 8,
              }),
            ],
            actualTimeMap: new Map<string, number>([['t1', 4 * 60 * 60 * 1000]]),
            expected: [
              EventEntryFixture.default({
                userId: userId,
                eventType: EVENT_TYPE.PLAN,
                summary: 'タスク1',
                start: EventDateTimeFixture.default({
                  dateTime: new Date('2023-07-03T13:00:00+0900'),
                }),
                end: EventDateTimeFixture.default({
                  dateTime: new Date('2023-07-03T17:00:00+0900'),
                }),
                isProvisional: true,
                description: 'タスク1の説明',
                projectId: 'pr1',
                taskId: 't1',
              }),
            ],
          },
          {
            description: '空き時間よりタスクが多いパターン',
            timeSlots: [
              {
                start: new Date('2023-07-03T10:00:00+0900'),
                end: new Date('2023-07-03T12:00:00+0900'),
              },
            ],
            extraAllocation: undefined,
            tasks: [
              TaskFixture.default({
                id: 't1',
                name: 'タスク1',
                projectId: 'pr1',
                description: 'タスク1の説明',
                plannedHours: 8,
              }),
            ],
            actualTimeMap: new Map<string, number>([['t1', 4 * 60 * 60 * 1000]]),
            expected: [
              EventEntryFixture.default({
                userId: userId,
                eventType: EVENT_TYPE.PLAN,
                summary: 'タスク1',
                start: EventDateTimeFixture.default({
                  dateTime: new Date('2023-07-03T10:00:00+0900'),
                }),
                end: EventDateTimeFixture.default({
                  dateTime: new Date('2023-07-03T12:00:00+0900'),
                }),
                isProvisional: true,
                description: 'タスク1の説明',
                projectId: 'pr1',
                taskId: 't1',
              }),
            ],
          },
          {
            description: '1つの時間帯に複数のタスクが入るパターン',
            timeSlots: [
              {
                start: new Date('2023-07-03T13:00:00+0900'),
                end: new Date('2023-07-03T19:00:00+0900'),
              },
            ],
            extraAllocation: undefined,
            tasks: [
              TaskFixture.default({
                id: 't1',
                name: 'タスク1',
                projectId: 'pr1',
                description: 'タスク1の説明',
                plannedHours: 8,
              }),
              TaskFixture.default({
                id: 't2',
                name: 'タスク2',
                projectId: 'pr2',
                description: 'タスク2の説明',
                plannedHours: 2,
              }),
            ],
            actualTimeMap: new Map<string, number>([
              ['t1', 4 * 60 * 60 * 1000],
              ['t2', 0],
            ]),
            expected: [
              EventEntryFixture.default({
                userId: userId,
                eventType: EVENT_TYPE.PLAN,
                summary: 'タスク1',
                start: EventDateTimeFixture.default({
                  dateTime: new Date('2023-07-03T13:00:00+0900'),
                }),
                end: EventDateTimeFixture.default({
                  dateTime: new Date('2023-07-03T17:00:00+0900'),
                }),
                isProvisional: true,
                description: 'タスク1の説明',
                projectId: 'pr1',
                taskId: 't1',
              }),
              EventEntryFixture.default({
                userId: userId,
                eventType: EVENT_TYPE.PLAN,
                summary: 'タスク2',
                start: EventDateTimeFixture.default({
                  dateTime: new Date('2023-07-03T17:00:00+0900'),
                }),
                end: EventDateTimeFixture.default({
                  dateTime: new Date('2023-07-03T19:00:00+0900'),
                }),
                isProvisional: true,
                description: 'タスク2の説明',
                projectId: 'pr2',
                taskId: 't2',
              }),
            ],
          },
          {
            description: 'タスクが2つ以上の時間帯に分かれるパターン',
            timeSlots: [
              {
                start: new Date('2023-07-03T10:00:00+0900'),
                end: new Date('2023-07-03T12:00:00+0900'),
              },
              {
                start: new Date('2023-07-03T13:00:00+0900'),
                end: new Date('2023-07-03T15:00:00+0900'),
              },
            ],
            extraAllocation: undefined,
            tasks: [
              TaskFixture.default({
                id: 't1',
                name: 'タスク1',
                projectId: 'pr1',
                description: 'タスク1の説明',
                plannedHours: 8,
              }),
            ],
            actualTimeMap: new Map<string, number>([['t1', 4 * 60 * 60 * 1000]]),
            expected: [
              EventEntryFixture.default({
                userId: userId,
                eventType: EVENT_TYPE.PLAN,
                summary: 'タスク1',
                start: EventDateTimeFixture.default({
                  dateTime: new Date('2023-07-03T10:00:00+0900'),
                }),
                end: EventDateTimeFixture.default({
                  dateTime: new Date('2023-07-03T12:00:00+0900'),
                }),
                isProvisional: true,
                description: 'タスク1の説明',
                projectId: 'pr1',
                taskId: 't1',
              }),
              EventEntryFixture.default({
                userId: userId,
                eventType: EVENT_TYPE.PLAN,
                summary: 'タスク1',
                start: EventDateTimeFixture.default({
                  dateTime: new Date('2023-07-03T13:00:00+0900'),
                }),
                end: EventDateTimeFixture.default({
                  dateTime: new Date('2023-07-03T15:00:00+0900'),
                }),
                isProvisional: true,
                description: 'タスク1の説明',
                projectId: 'pr1',
                taskId: 't1',
              }),
            ],
          },
          {
            description: '引数にタスク割り当てがある場合',
            timeSlots: [
              {
                start: new Date('2023-07-03T13:00:00+0900'),
                end: new Date('2023-07-03T19:00:00+0900'),
              },
            ],
            extraAllocation: new Map<string, number>([['t1', 4]]),
            tasks: [
              TaskFixture.default({
                id: 't1',
                name: 'タスク1',
                projectId: 'pr1',
                description: 'タスク1の説明',
                plannedHours: 8,
              }),
            ],
            actualTimeMap: new Map<string, number>([['t1', 16 * 60 * 60 * 1000]]),
            expected: [
              EventEntryFixture.default({
                userId: userId,
                eventType: EVENT_TYPE.PLAN,
                summary: 'タスク1',
                start: EventDateTimeFixture.default({
                  dateTime: new Date('2023-07-03T13:00:00+0900'),
                }),
                end: EventDateTimeFixture.default({
                  dateTime: new Date('2023-07-03T17:00:00+0900'),
                }),
                isProvisional: true,
                description: 'タスク1の説明',
                projectId: 'pr1',
                taskId: 't1',
              }),
            ],
          },
        ];

        it.each(testCases)('%s', async (testCase) => {
          jest
            .spyOn(eventAggregationService, 'aggregatePlannedTimeByTasks')
            .mockResolvedValue(testCase.actualTimeMap);

          const taskAllocationResult = await service.allocate(
            testCase.timeSlots,
            testCase.tasks,
            testCase.extraAllocation
          );

          // expectedから、比較すべきところだけ抽出
          const expectedArray = testCase.expected.map(
            (expected): Partial<EventEntry> =>
              expect.objectContaining({
                userId: expected.userId,
                eventType: expected.eventType,
                summary: expected.summary,
                start: expect.objectContaining({ dateTime: expected.start.dateTime }),
                end: expect.objectContaining({ dateTime: expected.end.dateTime }),
                isProvisional: expected.isProvisional,
                description: expected.description,
                projectId: expected.projectId,
                taskId: expected.taskId,
              })
          );

          expect(taskAllocationResult.taskAllocations).toHaveLength(expectedArray.length);
          expect(taskAllocationResult.taskAllocations).toEqual(
            expect.arrayContaining(expectedArray)
          );

          expect(taskAllocationResult.overrunTasks).toHaveLength(0);
        });
      });

      describe('超過工数あり', () => {
        // 超過時は予定の登録を行わないため timeSlots の値はあまり関係がないが、
        // タスクを予定に登録しようとしたタイミングで超過が判定されるため、十分に大きい期間をとる
        const timeSlots = [
          {
            start: new Date('2023-07-03T10:00:00+0900'),
            end: new Date('2023-07-04T10:00:00+0900'),
          },
        ];

        const testCases = [
          {
            description: '見積もり工数=登録済みの予定工数の場合も超過扱いにする',
            tasks: [
              TaskFixture.default({
                id: 't1',
                name: 'タスク1',
                projectId: 'pr1',
                description: 'タスク1の説明',
                plannedHours: 8,
              }),
            ],
            actualTimeMap: new Map<string, number>([['t1', 8 * 60 * 60 * 1000]]),
            expected: [
              OverrunTaskFixture.default({ taskId: 't1', schduledTime: 8 * 60 * 60 * 1000 }),
            ],
          },
          {
            description: '複数超過している場合',
            tasks: [
              TaskFixture.default({
                id: 't1',
                name: 'タスク1',
                projectId: 'pr1',
                description: 'タスク1の説明',
                plannedHours: 8,
              }),
              TaskFixture.default({
                id: 't2',
                name: 'タスク2',
                projectId: 'pr2',
                description: 'タスク2の説明',
                plannedHours: 16,
              }),
            ],
            actualTimeMap: new Map<string, number>([
              ['t1', 12 * 60 * 60 * 1000],
              ['t2', 24 * 60 * 60 * 1000],
            ]),
            expected: [
              OverrunTaskFixture.default({ taskId: 't1', schduledTime: 12 * 60 * 60 * 1000 }),
              OverrunTaskFixture.default({ taskId: 't2', schduledTime: 24 * 60 * 60 * 1000 }),
            ],
          },
        ];

        it.each(testCases)('%s', async (testCase) => {
          jest
            .spyOn(eventAggregationService, 'aggregatePlannedTimeByTasks')
            .mockResolvedValue(testCase.actualTimeMap);

          const taskAllocationResult = await service.allocate(timeSlots, testCase.tasks);

          expect(taskAllocationResult.overrunTasks).toHaveLength(testCase.expected.length);
          expect(taskAllocationResult.overrunTasks).toEqual(
            expect.arrayContaining(
              testCase.expected.map((expected) => expect.objectContaining(expected))
            )
          );
        });
      });
    });
  });
});
