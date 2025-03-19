import { CategoryFixture } from '@shared/data/__tests__/CategoryFixture';
import { EventDateTimeFixture, EventEntryFixture } from '@shared/data/__tests__/EventEntryFixture';
import { LabelFixture } from '@shared/data/__tests__/LabelFixture';
import { ProjectFixture } from '@shared/data/__tests__/ProjectFixture';
import { TaskFixture } from '@shared/data/__tests__/TaskFixture';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { EventEntrySearchServiceImpl } from '../EventEntrySearchServiceImpl';
import { ICategoryService } from '../ICategoryService';
import { IEventEntrySearchService } from '../IEventEntrySearchService';
import { IEventEntryService } from '../IEventEntryService';
import { ILabelService } from '../ILabelService';
import { IProjectService } from '../IProjectService';
import { ITaskService } from '../ITaskService';
import { IUserDetailsService } from '../IUserDetailsService';
import { CategoryServiceMockBuilder } from './__mocks__/CategoryServiceMockBuilder';
import { EventEntryServiceMockBuilder } from './__mocks__/EventEntryServiceMockBuilder';
import { LabelServiceMockBuilder } from './__mocks__/LabelServiceMockBuilder';
import { ProjectServiceMockBuilder } from './__mocks__/ProjectServiceMockBuilder';
import { TaskServiceMockBuilder } from './__mocks__/TaskServiceMockBuilder';
import { UserDetailsServiceMockBuilder } from './__mocks__/UserDetailsServiceMockBuilder';

describe('EventEntrySearchServiceImpl', () => {
  let userDetailsService: IUserDetailsService;
  let eventEntryService: IEventEntryService;
  let service: IEventEntrySearchService;
  let projectService: IProjectService;
  let categoryService: ICategoryService;
  let taskService: ITaskService;
  let labelService: ILabelService;
  const userId = 'user1';

  beforeEach(() => {
    userDetailsService = new UserDetailsServiceMockBuilder().withGetUserId(userId).build();
    eventEntryService = new EventEntryServiceMockBuilder().build();
    projectService = new ProjectServiceMockBuilder().build();
    categoryService = new CategoryServiceMockBuilder().build();
    taskService = new TaskServiceMockBuilder().build();
    labelService = new LabelServiceMockBuilder().build();
    service = new EventEntrySearchServiceImpl(
      userDetailsService,
      eventEntryService,
      projectService,
      categoryService,
      taskService,
      labelService
    );
  });

  describe('getPlanAndActuals', () => {
    const start = new Date('2024-12-30T10:00:00+0900');
    const end = new Date('2024-12-30T10:00:00+0900');
    const eventType = EVENT_TYPE.PLAN;

    describe('引数を元に関数内の各サービスメソッドに入力が割り当てられているかのテスト。', () => {
      const resultEventEntry = [
        EventEntryFixture.default({
          projectId: '1',
          categoryId: '2',
          taskId: '3',
          labelIds: ['4'],
        }),
      ];
      const resultLabel = [
        LabelFixture.default({
          id: '4',
          name: 'test-label',
        }),
      ];

      const testCase = [
        {
          start: start,
          end: end,
          eventType: eventType,
          resultEventEntry: resultEventEntry,
          resultLabel: resultLabel,
          expected: {
            start: start,
            end: end,
            resultEventEntry: resultEventEntry,
            resultLabels: resultLabel,
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(t.resultEventEntry);
        jest.spyOn(projectService, 'getAll').mockResolvedValue([]);
        jest.spyOn(categoryService, 'getAll').mockResolvedValue([]);
        jest.spyOn(taskService, 'getAll').mockResolvedValue([]);
        jest.spyOn(labelService, 'getAll').mockResolvedValue(t.resultLabel);

        await service.getPlanAndActuals(t.start, t.end, t.eventType);

        expect(eventEntryService.list).toHaveBeenCalledWith(
          userId,
          t.expected.start,
          t.expected.end
        );
        expect(projectService.getAll).toHaveBeenCalledWith(
          t.expected.resultEventEntry.map((eventEntry) => eventEntry.projectId)
        );
        expect(categoryService.getAll).toHaveBeenCalledWith(
          t.expected.resultEventEntry.map((eventEntry) => eventEntry.categoryId)
        );
        expect(taskService.getAll).toHaveBeenCalledWith(
          t.expected.resultEventEntry.map((eventEntry) => eventEntry.taskId)
        );
        expect(labelService.getAll).toHaveBeenCalledWith(
          t.expected.resultEventEntry.map((eventEntry) => eventEntry.labelIds).flat()
        );
      });
    });
    describe('引数を元に検索されたEventEntryと、出力したEventEntrySearchの対応するフィールドが一致している。', () => {
      const resultProject = [
        ProjectFixture.default({
          id: '1',
          name: 'test-project',
        }),
      ];
      const resultCategory = [
        CategoryFixture.default({
          id: '2',
          name: 'test-category',
        }),
      ];
      const resultTask = [
        TaskFixture.default({
          id: '3',
          name: 'test-task',
        }),
      ];
      const resultLabel = [
        LabelFixture.default({
          id: '4',
          name: 'test-label',
        }),
      ];

      const testCase = [
        {
          start: start,
          end: end,
          eventType: eventType,
          resultEventEntry: EventEntryFixture.default({
            projectId: '1',
            categoryId: '2',
            taskId: '3',
            labelIds: ['4'],
          }),
          resultProject: resultProject,
          resultCategory: resultCategory,
          resultTask: resultTask,
          resultLabel: resultLabel,
          expected: {
            resultProject: resultProject,
            resultCategory: resultCategory,
            resultTask: resultTask,
            resultLabel: resultLabel,
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        // memo: 出力されたEventEntrySearchが各サービスの出力結果と一致しているか検証するためイベントは1件のみ許容する
        jest.spyOn(eventEntryService, 'list').mockResolvedValue([t.resultEventEntry]);
        jest.spyOn(projectService, 'getAll').mockResolvedValue(t.resultProject);
        jest.spyOn(categoryService, 'getAll').mockResolvedValue(t.resultCategory);
        jest.spyOn(taskService, 'getAll').mockResolvedValue(t.resultTask);
        jest.spyOn(labelService, 'getAll').mockResolvedValue(t.resultLabel);

        const eventEntrySearch = await service.getPlanAndActuals(t.start, t.end, t.eventType);

        expect(eventEntrySearch[0].projectId).toEqual(t.expected.resultProject[0].id);
        expect(eventEntrySearch[0].projectName).toEqual(t.expected.resultProject[0].name);
        expect(eventEntrySearch[0].categoryId).toEqual(t.expected.resultCategory[0].id);
        expect(eventEntrySearch[0].categoryName).toEqual(t.expected.resultCategory[0].name);
        expect(eventEntrySearch[0].taskId).toEqual(t.expected.resultTask[0].id);
        expect(eventEntrySearch[0].taskName).toEqual(t.expected.resultTask[0].name);
        expect(eventEntrySearch[0].labelIds).toEqual([t.expected.resultLabel[0].id]);
        expect(eventEntrySearch[0].labelNames).toEqual([t.expected.resultLabel[0].name]);
      });
    });
  });
  describe('getProjectAssociatedEvents', () => {
    const start = new Date('2024-12-30T10:00:00+0900');
    const end = new Date('2024-12-30T10:00:00+0900');
    const eventType = EVENT_TYPE.PLAN;

    describe('引数を元に関数内の各サービスメソッドに入力が割り当てられているかのテスト。', () => {
      const resultEventEntry = [
        EventEntryFixture.default({
          projectId: '1',
        }),
      ];
      const testCase = [
        {
          start: start,
          end: end,
          eventType: eventType,
          resultEventEntry: resultEventEntry,
          expected: {
            start: start,
            end: end,
            resultEventEntry: resultEventEntry,
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(t.resultEventEntry);
        jest.spyOn(projectService, 'getAll').mockResolvedValue([]);

        await service.getProjectAssociatedEvents(t.start, t.end, t.eventType);

        expect(eventEntryService.list).toHaveBeenCalledWith(
          userId,
          t.expected.start,
          t.expected.end
        );
        expect(projectService.getAll).toHaveBeenCalledWith(
          t.expected.resultEventEntry.map((eventEntry) => eventEntry.projectId).flat()
        );
      });
    });
    describe('引数で指定されたEVENT_TYPEで出力にフィルターが行われているかのテスト。', () => {
      const resultEventEntry = [
        EventEntryFixture.default({
          start: EventDateTimeFixture.default({ dateTime: start }),
          end: EventDateTimeFixture.default({ dateTime: end }),
          eventType: EVENT_TYPE.ACTUAL,
        }),
        EventEntryFixture.default({
          start: EventDateTimeFixture.default({ dateTime: start }),
          end: EventDateTimeFixture.default({ dateTime: end }),
          eventType: EVENT_TYPE.PLAN,
        }),
        EventEntryFixture.default({
          start: EventDateTimeFixture.default({ dateTime: start }),
          end: EventDateTimeFixture.default({ dateTime: end }),
          eventType: EVENT_TYPE.SHARED,
        }),
      ];
      const testCase = [
        {
          description: '実績(ACTUAL)が指定されている場合は実績イベントが出力されているかテスト',
          start: start,
          end: end,
          eventType: EVENT_TYPE.ACTUAL,
          resultEventEntry: resultEventEntry,
          expected: {
            count: 1,
            eventType: [EVENT_TYPE.ACTUAL],
          },
        },
        {
          description:
            '実績(ACTUAL)以外が指定されている場合は予定(PLAN)・共有(SHARED)イベントが出力されているかテスト',
          start: start,
          end: end,
          eventType: EVENT_TYPE.PLAN,
          resultEventEntry: resultEventEntry,
          expected: {
            count: 2,
            eventType: [EVENT_TYPE.PLAN, EVENT_TYPE.SHARED],
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(t.resultEventEntry);
        jest.spyOn(projectService, 'getAll').mockResolvedValue([]);

        const events = await service.getProjectAssociatedEvents(t.start, t.end, t.eventType);

        expect(events).toHaveLength(t.expected.count);
        for (let i = 0; i < events.length; i++) {
          expect(events[i].eventType).toEqual(t.expected.eventType[i]);
        }
      });
    });
    describe('イベントとプロジェクトが紐づいているかのテスト', () => {
      const testCase = [
        {
          description: '1つのイベントに1つのプロジェクトが紐づく場合のテスト',
          start: start,
          end: end,
          eventType: eventType,
          resultEventEntry: [
            EventEntryFixture.default({
              start: EventDateTimeFixture.default({ dateTime: start }),
              end: EventDateTimeFixture.default({ dateTime: end }),
              eventType: eventType,
              projectId: '1',
            }),
          ],
          resultProject: [
            ProjectFixture.default({
              id: '1',
              name: 'test-project',
            }),
          ],
          expected: {
            count: 1,
            resultProject: ['test-project'],
          },
        },
        {
          description: 'イベントにプロジェクトが紐づかない場合のテスト',
          start: start,
          end: end,
          eventType: eventType,
          resultEventEntry: [
            EventEntryFixture.default({
              start: EventDateTimeFixture.default({ dateTime: new Date(start) }),
              end: EventDateTimeFixture.default({ dateTime: new Date(end) }),
              eventType: eventType,
              projectId: '1',
            }),
          ],
          resultProject: [],
          expected: {
            count: 1,
            resultProject: [undefined],
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(t.resultEventEntry);
        jest.spyOn(projectService, 'getAll').mockResolvedValue(t.resultProject);

        const events = await service.getProjectAssociatedEvents(t.start, t.end, t.eventType);

        expect(events).toHaveLength(t.expected.count);
        for (let i = 0; i < events.length; i++) {
          expect(events[i].projectName).toEqual(t.expected.resultProject[i]);
        }
      });
    });
  });
  describe('getCategoryAssociatedEvents', () => {
    const start = new Date('2024-12-30T10:00:00+0900');
    const end = new Date('2024-12-30T10:00:00+0900');
    const eventType = EVENT_TYPE.PLAN;

    describe('引数を元に関数内の各サービスメソッドに入力が割り当てられているかのテスト。', () => {
      const resultEventEntry = [
        EventEntryFixture.default({
          categoryId: '1',
        }),
      ];
      const testCase = [
        {
          start: start,
          end: end,
          eventType: eventType,
          resultEventEntry: resultEventEntry,
          expected: {
            start: start,
            end: end,
            resultEventEntry: resultEventEntry,
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(t.resultEventEntry);
        jest.spyOn(categoryService, 'getAll').mockResolvedValue([]);

        await service.getCategoryAssociatedEvents(t.start, t.end, t.eventType);

        expect(eventEntryService.list).toHaveBeenCalledWith(
          userId,
          t.expected.start,
          t.expected.end
        );
        expect(categoryService.getAll).toHaveBeenCalledWith(
          t.expected.resultEventEntry.map((eventEntry) => eventEntry.categoryId).flat()
        );
      });
    });
    describe('引数で指定されたEVENT_TYPEで出力にフィルターが行われているかのテスト。', () => {
      const resultEventEntry = [
        EventEntryFixture.default({
          start: EventDateTimeFixture.default({ dateTime: start }),
          end: EventDateTimeFixture.default({ dateTime: end }),
          eventType: EVENT_TYPE.ACTUAL,
        }),
        EventEntryFixture.default({
          start: EventDateTimeFixture.default({ dateTime: start }),
          end: EventDateTimeFixture.default({ dateTime: end }),
          eventType: EVENT_TYPE.PLAN,
        }),
        EventEntryFixture.default({
          start: EventDateTimeFixture.default({ dateTime: start }),
          end: EventDateTimeFixture.default({ dateTime: end }),
          eventType: EVENT_TYPE.SHARED,
        }),
      ];
      const testCase = [
        {
          description: '実績(ACTUAL)が指定されている場合は実績イベントが出力されているかテスト',
          start: start,
          end: end,
          eventType: EVENT_TYPE.ACTUAL,
          resultEventEntry: resultEventEntry,
          expected: {
            count: 1,
            eventType: [EVENT_TYPE.ACTUAL],
          },
        },
        {
          description:
            '実績(ACTUAL)以外が指定されている場合は予定(PLAN)・共有(SHARED)イベントが出力されているかテスト',
          start: start,
          end: end,
          eventType: EVENT_TYPE.PLAN,
          resultEventEntry: resultEventEntry,
          expected: {
            count: 2,
            eventType: [EVENT_TYPE.PLAN, EVENT_TYPE.SHARED],
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(t.resultEventEntry);
        jest.spyOn(categoryService, 'getAll').mockResolvedValue([]);

        const events = await service.getCategoryAssociatedEvents(t.start, t.end, t.eventType);

        expect(events).toHaveLength(t.expected.count);
        for (let i = 0; i < events.length; i++) {
          expect(events[i].eventType).toEqual(t.expected.eventType[i]);
        }
      });
    });
    describe('イベントとカテゴリが紐づいているかのテスト', () => {
      const testCase = [
        {
          description: '1つのイベントに1つのカテゴリが紐づく場合のテスト',
          start: start,
          end: end,
          eventType: eventType,
          resultEventEntry: [
            EventEntryFixture.default({
              start: EventDateTimeFixture.default({ dateTime: start }),
              end: EventDateTimeFixture.default({ dateTime: end }),
              eventType: eventType,
              categoryId: '1',
            }),
          ],
          resultCategory: [
            CategoryFixture.default({
              id: '1',
              name: 'test-category',
            }),
          ],
          expected: {
            count: 1,
            resultCategory: ['test-category'],
          },
        },
        {
          description: 'イベントにプロジェクトが紐づかない場合のテスト',
          start: start,
          end: end,
          eventType: eventType,
          resultEventEntry: [
            EventEntryFixture.default({
              start: EventDateTimeFixture.default({ dateTime: new Date(start) }),
              end: EventDateTimeFixture.default({ dateTime: new Date(end) }),
              eventType: eventType,
              categoryId: '1',
            }),
          ],
          resultCategory: [],
          expected: {
            count: 1,
            resultCategory: [undefined],
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(t.resultEventEntry);
        jest.spyOn(categoryService, 'getAll').mockResolvedValue(t.resultCategory);

        const events = await service.getCategoryAssociatedEvents(t.start, t.end, t.eventType);

        expect(events).toHaveLength(t.expected.count);
        for (let i = 0; i < events.length; i++) {
          expect(events[i].categoryName).toEqual(t.expected.resultCategory[i]);
        }
      });
    });
  });
  describe('getTaskAssociatedEvents', () => {
    const start = new Date('2024-12-30T10:00:00+0900');
    const end = new Date('2024-12-30T10:00:00+0900');
    const eventType = EVENT_TYPE.PLAN;

    describe('引数を元に関数内の各サービスメソッドに入力が割り当てられているかのテスト。', () => {
      const resultEventEntry = [
        EventEntryFixture.default({
          taskId: '1',
        }),
      ];
      const testCase = [
        {
          start: start,
          end: end,
          eventType: eventType,
          resultEventEntry: resultEventEntry,
          expected: {
            start: start,
            end: end,
            resultEventEntry: resultEventEntry,
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(t.resultEventEntry);
        jest.spyOn(taskService, 'getAll').mockResolvedValue([]);

        await service.getTaskAssociatedEvents(t.start, t.end, t.eventType);

        expect(eventEntryService.list).toHaveBeenCalledWith(
          userId,
          t.expected.start,
          t.expected.end
        );
        expect(taskService.getAll).toHaveBeenCalledWith(
          t.expected.resultEventEntry.map((eventEntry) => eventEntry.taskId).flat()
        );
      });
    });
    describe('引数で指定されたEVENT_TYPEで出力にフィルターが行われているかのテスト。', () => {
      const resultEventEntry = [
        EventEntryFixture.default({
          start: EventDateTimeFixture.default({ dateTime: start }),
          end: EventDateTimeFixture.default({ dateTime: end }),
          eventType: EVENT_TYPE.ACTUAL,
        }),
        EventEntryFixture.default({
          start: EventDateTimeFixture.default({ dateTime: start }),
          end: EventDateTimeFixture.default({ dateTime: end }),
          eventType: EVENT_TYPE.PLAN,
        }),
        EventEntryFixture.default({
          start: EventDateTimeFixture.default({ dateTime: start }),
          end: EventDateTimeFixture.default({ dateTime: end }),
          eventType: EVENT_TYPE.SHARED,
        }),
      ];
      const testCase = [
        {
          description: '実績(ACTUAL)が指定されている場合は実績イベントが出力されているかテスト',
          start: start,
          end: end,
          eventType: EVENT_TYPE.ACTUAL,
          resultEventEntry: resultEventEntry,
          expected: {
            count: 1,
            eventType: [EVENT_TYPE.ACTUAL],
          },
        },
        {
          description:
            '実績(ACTUAL)以外が指定されている場合は予定(PLAN)・共有(SHARED)イベントが出力されているかテスト',
          start: start,
          end: end,
          eventType: EVENT_TYPE.PLAN,
          resultEventEntry: resultEventEntry,
          expected: {
            count: 2,
            eventType: [EVENT_TYPE.PLAN, EVENT_TYPE.SHARED],
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(t.resultEventEntry);
        jest.spyOn(taskService, 'getAll').mockResolvedValue([]);

        const events = await service.getTaskAssociatedEvents(t.start, t.end, t.eventType);

        expect(events).toHaveLength(t.expected.count);
        for (let i = 0; i < events.length; i++) {
          expect(events[i].eventType).toEqual(t.expected.eventType[i]);
        }
      });
    });
    describe('イベントとタスクが紐づいているかのテスト', () => {
      const testCase = [
        {
          description: '1つのイベントに1つのタスクが紐づく場合のテスト',
          start: start,
          end: end,
          eventType: eventType,
          resultEventEntry: [
            EventEntryFixture.default({
              start: EventDateTimeFixture.default({ dateTime: start }),
              end: EventDateTimeFixture.default({ dateTime: end }),
              eventType: eventType,
              taskId: '1',
            }),
          ],
          resultTask: [
            TaskFixture.default({
              id: '1',
              name: 'test-task',
            }),
          ],
          expected: {
            count: 1,
            resultTask: ['test-task'],
          },
        },
        {
          description: 'イベントにタスクが紐づかない場合のテスト',
          start: start,
          end: end,
          eventType: eventType,
          resultEventEntry: [
            EventEntryFixture.default({
              start: EventDateTimeFixture.default({ dateTime: new Date(start) }),
              end: EventDateTimeFixture.default({ dateTime: new Date(end) }),
              eventType: eventType,
              taskId: '1',
            }),
          ],
          resultTask: [],
          expected: {
            count: 1,
            resultTask: [undefined],
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(t.resultEventEntry);
        jest.spyOn(taskService, 'getAll').mockResolvedValue(t.resultTask);

        const events = await service.getTaskAssociatedEvents(t.start, t.end, t.eventType);

        expect(events).toHaveLength(t.expected.count);
        for (let i = 0; i < events.length; i++) {
          expect(events[i].taskName).toEqual(t.expected.resultTask[i]);
        }
      });
    });
  });
  describe('getLabelAssociatedEvents', () => {
    const start = new Date('2024-12-30T10:00:00+0900');
    const end = new Date('2024-12-30T10:00:00+0900');
    const eventType = EVENT_TYPE.PLAN;

    describe('引数を元に関数内の各サービスメソッドに入力が割り当てられているかのテスト。', () => {
      const resultEventEntry = [
        EventEntryFixture.default({
          labelIds: ['1'],
        }),
      ];
      const testCase = [
        {
          start: start,
          end: end,
          eventType: eventType,
          resultEventEntry: resultEventEntry,
          expected: {
            start: start,
            end: end,
            resultEventEntry: resultEventEntry,
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(t.resultEventEntry);
        jest.spyOn(labelService, 'getAll').mockResolvedValue([]);

        await service.getLabelAssociatedEvents(t.start, t.end, t.eventType);

        expect(eventEntryService.list).toHaveBeenCalledWith(
          userId,
          t.expected.start,
          t.expected.end
        );
        expect(labelService.getAll).toHaveBeenCalledWith(
          t.expected.resultEventEntry.map((eventEntry) => eventEntry.labelIds).flat()
        );
      });
    });
    describe('引数で指定されたEVENT_TYPEで出力にフィルターが行われているかのテスト。', () => {
      const resultEventEntry = [
        EventEntryFixture.default({
          start: EventDateTimeFixture.default({ dateTime: start }),
          end: EventDateTimeFixture.default({ dateTime: end }),
          eventType: EVENT_TYPE.ACTUAL,
        }),
        EventEntryFixture.default({
          start: EventDateTimeFixture.default({ dateTime: start }),
          end: EventDateTimeFixture.default({ dateTime: end }),
          eventType: EVENT_TYPE.PLAN,
        }),
        EventEntryFixture.default({
          start: EventDateTimeFixture.default({ dateTime: start }),
          end: EventDateTimeFixture.default({ dateTime: end }),
          eventType: EVENT_TYPE.SHARED,
        }),
      ];
      const testCase = [
        {
          description: '実績(ACTUAL)が指定されている場合は実績イベントが出力されているかテスト',
          start: start,
          end: end,
          eventType: EVENT_TYPE.ACTUAL,
          resultEventEntry: resultEventEntry,
          expected: {
            count: 1,
            eventType: [EVENT_TYPE.ACTUAL],
          },
        },
        {
          description:
            '実績(ACTUAL)以外が指定されている場合は予定(PLAN)・共有(SHARED)イベントが出力されているかテスト',
          start: start,
          end: end,
          eventType: EVENT_TYPE.PLAN,
          resultEventEntry: resultEventEntry,
          expected: {
            count: 2,
            eventType: [EVENT_TYPE.PLAN, EVENT_TYPE.SHARED],
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(t.resultEventEntry);
        jest.spyOn(labelService, 'getAll').mockResolvedValue([]);

        const events = await service.getLabelAssociatedEvents(t.start, t.end, t.eventType);

        expect(events).toHaveLength(t.expected.count);
        for (let i = 0; i < events.length; i++) {
          expect(events[i].eventType).toEqual(t.expected.eventType[i]);
        }
      });
    });
    describe('イベントとラベルが紐づいているかのテスト', () => {
      const testCase = [
        {
          description: '1つのイベントに1つのラベルが紐づく場合のテスト',
          start: start,
          end: end,
          eventType: eventType,
          resultEventEntry: [
            EventEntryFixture.default({
              start: EventDateTimeFixture.default({ dateTime: start }),
              end: EventDateTimeFixture.default({ dateTime: end }),
              eventType: eventType,
              labelIds: ['1'],
            }),
          ],
          resultLabel: [
            LabelFixture.default({
              id: '1',
              name: 'test-label',
            }),
          ],
          expected: {
            count: 1,
            resultLabel: [['test-label']],
          },
        },
        {
          description: '1つのイベントに複数のラベルが紐づく場合のテスト',
          start: start,
          end: end,
          eventType: eventType,
          resultEventEntry: [
            EventEntryFixture.default({
              start: EventDateTimeFixture.default({ dateTime: start }),
              end: EventDateTimeFixture.default({ dateTime: end }),
              eventType: eventType,
              labelIds: ['1', '2'],
            }),
          ],
          resultLabel: [
            LabelFixture.default({
              id: '1',
              name: 'test-label',
            }),
            LabelFixture.default({
              id: '2',
              name: 'test-label2',
            }),
          ],
          expected: {
            count: 1,
            resultLabel: [['test-label', 'test-label2']],
          },
        },
        {
          description: '複数のイベントに1つのラベルが紐づく場合のテスト',
          start: start,
          end: end,
          eventType: eventType,
          resultEventEntry: [
            EventEntryFixture.default({
              start: EventDateTimeFixture.default({ dateTime: start }),
              end: EventDateTimeFixture.default({ dateTime: end }),
              eventType: eventType,
              labelIds: ['1'],
            }),
            EventEntryFixture.default({
              start: EventDateTimeFixture.default({ dateTime: start }),
              end: EventDateTimeFixture.default({ dateTime: end }),
              eventType: eventType,
              labelIds: ['1'],
            }),
          ],
          resultLabel: [
            LabelFixture.default({
              id: '1',
              name: 'test-label',
            }),
          ],
          expected: {
            count: 2,
            resultLabel: [['test-label'], ['test-label']],
          },
        },
        {
          description: 'イベントにラベルが紐づかない場合のテスト',
          start: start,
          end: end,
          eventType: eventType,
          resultEventEntry: [
            EventEntryFixture.default({
              start: EventDateTimeFixture.default({ dateTime: new Date(start) }),
              end: EventDateTimeFixture.default({ dateTime: new Date(end) }),
              eventType: eventType,
              labelIds: ['1'],
            }),
          ],
          resultLabel: [],
          expected: {
            count: 1,
            resultLabel: [[undefined]],
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(t.resultEventEntry);
        jest.spyOn(labelService, 'getAll').mockResolvedValue(t.resultLabel);

        const events = await service.getLabelAssociatedEvents(t.start, t.end, t.eventType);

        expect(events).toHaveLength(t.expected.count);
        for (let i = 0; i < events.length; i++) {
          expect(events[i].labelNames).toEqual(t.expected.resultLabel[i]);
        }
      });
    });
  });
});
