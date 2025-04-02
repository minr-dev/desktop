import { EventEntryFixture } from '@shared/data/__tests__/EventEntryFixture';
import { IEventEntryService } from '../IEventEntryService';
import { ITaskProviderService } from '../ITaskProviderService';
import { ITaskService } from '../ITaskService';
import { IUserDetailsService } from '../IUserDetailsService';
import { TaskProviderServiceImpl } from '../TaskProviderServiceImpl';
import { EventEntryServiceMockBuilder } from './__mocks__/EventEntryServiceMockBuilder';
import { TaskServiceMockBuilder } from './__mocks__/TaskServiceMockBuilder';
import { UserDetailsServiceMockBuilder } from './__mocks__/UserDetailsServiceMockBuilder';
import { TaskFixture } from '@shared/data/__tests__/TaskFixture';
import { addDays } from 'date-fns';
import { EVENT_TYPE } from '@shared/data/EventEntry';

describe('TaskProviderServiceImpl', () => {
  let service: ITaskProviderService;
  let userDetailService: IUserDetailsService;
  let eventEntryService: IEventEntryService;
  let taskService: ITaskService;

  const userId = 'test user';

  beforeEach(() => {
    jest.resetAllMocks();
    userDetailService = new UserDetailsServiceMockBuilder().withGetUserId(userId).build();
    eventEntryService = new EventEntryServiceMockBuilder().build();
    taskService = new TaskServiceMockBuilder().build();
    service = new TaskProviderServiceImpl(userDetailService, eventEntryService, taskService);
  });

  describe('getTasksForAllocation', () => {
    describe('パラメータを元に各サービスの入力が割り当てられているかのテスト。', () => {
      it('eventEntryService.list', async () => {
        const targetDate = new Date('2025-04-01T10:00:00+0900');
        const expected = {
          start: targetDate,
          end: addDays(targetDate, 1),
        };
        jest.spyOn(eventEntryService, 'list').mockResolvedValue([]);
        jest.spyOn(taskService, 'getUncompletedByPriority').mockResolvedValue([]);
        // memo: projectId はサービスのパラメータとは関係ないので省略する。
        await service.getTasksForAllocation(targetDate);
        expect(eventEntryService.list).toHaveBeenCalledWith(userId, expected.start, expected.end);
      });
    });

    describe('返り値のテスト', () => {
      const targetDate = new Date('2025-01-01T10:00:00+0900');
      const testCases = [
        {
          description:
            'projectId が undefined のとき予定・共有イベントの taskId に合致しない Task を返す。',
          projectId: undefined,
          eventEntries: [
            EventEntryFixture.default({
              eventType: EVENT_TYPE.PLAN,
              taskId: 't1',
            }),
            EventEntryFixture.default({
              eventType: EVENT_TYPE.SHARED,
              taskId: 't2',
            }),
          ],
          tasks: [
            TaskFixture.default({
              id: 't1',
              projectId: 'p1',
            }),
            TaskFixture.default({
              id: 't2',
              projectId: 'p2',
            }),
            TaskFixture.default({
              id: 't3',
              projectId: 'p3',
            }),
          ],
          expected: {
            tasks: [
              TaskFixture.default({
                id: 't3',
                projectId: 'p3',
              }),
            ],
          },
        },
        {
          description:
            'projectId が引数に渡されているとき projectId に合致しイベントの taskId に合致しない Task を返す。',
          projectId: 'p1',
          eventEntries: [
            EventEntryFixture.default({
              eventType: EVENT_TYPE.PLAN,
              taskId: 't1',
            }),
            EventEntryFixture.default({
              eventType: EVENT_TYPE.PLAN,
              taskId: 't2',
            }),
          ],
          tasks: [
            TaskFixture.default({
              id: 't3',
              projectId: 'p1',
            }),
            TaskFixture.default({
              id: 't4',
              projectId: 'p2',
            }),
          ],
          expected: {
            tasks: [
              TaskFixture.default({
                id: 't3',
                projectId: 'p1',
              }),
            ],
          },
        },
      ];

      it.each(testCases)('%s', async (testCase) => {
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(testCase.eventEntries);
        jest.spyOn(taskService, 'getUncompletedByPriority').mockResolvedValue(testCase.tasks);

        const tasksForAllocation = await service.getTasksForAllocation(
          targetDate,
          testCase.projectId
        );

        expect(tasksForAllocation).toHaveLength(testCase.expected.tasks.length);
        for (let i = 0; i < tasksForAllocation.length; i++) {
          expect(tasksForAllocation[i].id).toEqual(testCase.expected.tasks[i].id);
          expect(tasksForAllocation[i].projectId).toEqual(testCase.expected.tasks[i].projectId);
        }
      });
    });
  });
});
