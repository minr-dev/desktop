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

  describe('searchPlanAndActual', () => {
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
            eventType: eventType,
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

        await service.searchPlanAndActual(t.start, t.end, t.eventType);

        expect(eventEntryService.list).toHaveBeenCalledWith(
          userId,
          t.expected.start,
          t.expected.end,
          t.expected.eventType
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
    describe('引数を元に検索された予実データのマスタ紐づいたフィールドと、出力したCSVデータの対応するフィールドが一致している。', () => {
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
          resultEventEntry: [
            EventEntryFixture.default({
              projectId: '1',
              categoryId: '2',
              taskId: '3',
              labelIds: ['4'],
            }),
          ],
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
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(t.resultEventEntry);
        jest.spyOn(projectService, 'getAll').mockResolvedValue(t.resultProject);
        jest.spyOn(categoryService, 'getAll').mockResolvedValue(t.resultCategory);
        jest.spyOn(taskService, 'getAll').mockResolvedValue(t.resultTask);
        jest.spyOn(labelService, 'getAll').mockResolvedValue(t.resultLabel);

        const eventEntrySearch = await service.searchPlanAndActual(t.start, t.end, t.eventType);

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
  describe('searchLabelAssociatedEvent', () => {
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
            eventType: eventType,
            resultEventEntry: resultEventEntry,
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(t.resultEventEntry);
        jest.spyOn(labelService, 'getAll').mockResolvedValue([]);

        await service.searchLabelAssociatedEvent(t.start, t.end, t.eventType);

        expect(eventEntryService.list).toHaveBeenCalledWith(
          userId,
          t.expected.start,
          t.expected.end,
          t.expected.eventType
        );
        expect(labelService.getAll).toHaveBeenCalledWith(
          t.expected.resultEventEntry.map((eventEntry) => eventEntry.labelIds).flat()
        );
      });
    });
    describe('予実データとラベルが紐づいているかのテスト', () => {
      const testCase = [
        {
          description: '1件のラベルに紐づく場合のテスト',
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
          resultLabel: [
            LabelFixture.default({
              id: '1',
              name: 'test-label',
            }),
          ],
          expected: {
            start: EventDateTimeFixture.default({ dateTime: new Date(start) }),
            end: EventDateTimeFixture.default({ dateTime: new Date(end) }),
            eventType: eventType,
            resultLabel: [
              LabelFixture.default({
                id: '1',
                name: 'test-label',
              }).name,
            ],
          },
        },
        {
          description: '複数のラベルに紐づく場合のテスト',
          start: start,
          end: end,
          eventType: eventType,
          resultEventEntry: [
            EventEntryFixture.default({
              start: EventDateTimeFixture.default({ dateTime: new Date(start) }),
              end: EventDateTimeFixture.default({ dateTime: new Date(end) }),
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
            start: EventDateTimeFixture.default({ dateTime: new Date(start) }),
            end: EventDateTimeFixture.default({ dateTime: new Date(end) }),
            eventType: eventType,
            resultLabel: [
              LabelFixture.default({
                id: '1',
                name: 'test-label',
              }).name,
              LabelFixture.default({
                id: '2',
                name: 'test-label2',
              }).name,
            ],
          },
        },
        {
          description: 'ラベルに紐づかない場合のテスト',
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
            start: EventDateTimeFixture.default({ dateTime: new Date(start) }),
            end: EventDateTimeFixture.default({ dateTime: new Date(end) }),
            eventType: eventType,
            resultLabel: [],
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(t.resultEventEntry);
        jest.spyOn(labelService, 'getAll').mockResolvedValue(t.resultLabel);

        const eventEntrySearch = await service.searchLabelAssociatedEvent(
          t.start,
          t.end,
          t.eventType
        );

        expect(eventEntrySearch[0].start).toEqual(t.expected.start);
        expect(eventEntrySearch[0].end).toEqual(t.expected.end);
        expect(eventEntrySearch[0].eventType).toEqual(t.expected.eventType);
        expect(eventEntrySearch[0].labelNames).toEqual(t.expected.resultLabel);
      });
    });
  });
});
