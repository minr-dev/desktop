import { format } from 'date-fns';
import { CategoryFixture } from '@shared/data/__tests__/CategoryFixture';
import { EventEntryCsvSettingFixture } from '@shared/data/__tests__/EventEntryCsvSettingFixture';
import { EventDateTimeFixture, EventEntryFixture } from '@shared/data/__tests__/EventEntryFixture';
import { LabelFixture } from '@shared/data/__tests__/LabelFixture';
import { ProjectFixture } from '@shared/data/__tests__/ProjectFixture';
import { TaskFixture } from '@shared/data/__tests__/TaskFixture';
import { eventDateTimeToDate } from '@shared/data/EventDateTime';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { EventEntryCsv } from '../../dto/EventEntryCsv';
import { EventEntryCsvSearchServiceImpl } from '../EventEntryCsvSearchServiceImpl';
import { ICategoryService } from '../ICategoryService';
import { ICsvCreateService } from '../ICsvCreateService';
import { IEventEntryCsvSearchService } from '../IEventEntryCsvSearchService';
import { IEventEntryService } from '../IEventEntryService';
import { ILabelService } from '../ILabelService';
import { IProjectService } from '../IProjectService';
import { ITaskService } from '../ITaskService';
import { IUserDetailsService } from '../IUserDetailsService';
import { CategoryServiceMockBuilder } from './__mocks__/CategoryServiceMockBuilder';
import { CsvCreateServiceMockBuilder } from './__mocks__/CsvCreateServiceMockBuilder';
import { LabelServiceMockBuilder } from './__mocks__/LabelServiceMockBuilder';
import { ProjectServiceMockBuilder } from './__mocks__/ProjectServiceMockBuilder';
import { TaskServiceMockBuilder } from './__mocks__/TaskServiceMockBuilder';
import { UserDetailsServiceMockBuilder } from './__mocks__/UserDetailsServiceMockBuilder';
import { EventEntryServiceMockBuilder } from './__mocks__/EventEntryServiceMockBuilder';
import { getLogger } from '../../utils/LoggerUtil';

const logger = getLogger('EventEntryCsvSearchServiceImpl_test');

const eventEntryCsvHeader = {
  eventEntryId: '予実ID',
  eventType: '予実種類',
  start: '開始日時',
  end: '終了日時',
  summary: 'タイトル',
  projectId: 'プロジェクトID',
  projectName: 'プロジェクト名',
  categoryId: 'カテゴリーID',
  categoryName: 'カテゴリー名',
  taskId: 'タスクID',
  taskName: 'タスク名',
  labelIds: 'ラベルID',
  labelNames: 'ラベル名',
  description: '概要',
};

describe('EventEntryCsvSearchServiceImpl', () => {
  let userDetailsService: IUserDetailsService;
  let eventEntryService: IEventEntryService;
  let service: IEventEntryCsvSearchService;
  let projectService: IProjectService;
  let categoryService: ICategoryService;
  let taskService: ITaskService;
  let labelService: ILabelService;
  let csvCreateService: ICsvCreateService<EventEntryCsv>;
  const userId = 'user1';

  beforeEach(() => {
    userDetailsService = new UserDetailsServiceMockBuilder().withGetUserId(userId).build();
    eventEntryService = new EventEntryServiceMockBuilder().build();
    projectService = new ProjectServiceMockBuilder().build();
    categoryService = new CategoryServiceMockBuilder().build();
    taskService = new TaskServiceMockBuilder().build();
    labelService = new LabelServiceMockBuilder().build();
    csvCreateService = new CsvCreateServiceMockBuilder().build();
    service = new EventEntryCsvSearchServiceImpl(
      userDetailsService,
      eventEntryService,
      projectService,
      categoryService,
      taskService,
      labelService,
      csvCreateService
    );
  });

  describe('searchEventEntryCsv', () => {
    const projects = [
      ProjectFixture.default({
        id: '1',
        name: 'test-project',
      }),
    ];
    const categories = [
      CategoryFixture.default({
        id: '1',
        name: 'test-category',
      }),
    ];
    const tasks = [
      TaskFixture.default({
        id: '1',
        name: 'test-task',
      }),
    ];
    const labels = [
      LabelFixture.default({
        id: '1',
        name: 'test-label1',
      }),
      LabelFixture.default({
        id: '2',
        name: 'test-label2',
      }),
    ];
    const testCases = [
      {
        description: '予実CSVデータを出力する',
        paramEventEntrySetting: EventEntryCsvSettingFixture.default({
          start: new Date('2024-12-30T00:00:00+0900'),
          end: new Date('2025-01-01T23:59:59+0900'),
          eventType: undefined,
        }),
        eventEntries: [
          EventEntryFixture.default({
            id: '1',
            userId: userId,
            eventType: EVENT_TYPE.PLAN,
            summary: 'test event 1',
            start: EventDateTimeFixture.default({
              dateTime: new Date('2024-12-30T10:00:00+0900'),
            }),
            end: EventDateTimeFixture.default({
              dateTime: new Date('2024-12-30T11:00:00+0900'),
            }),
            description: 'PLAN TEST',
            projectId: '1',
            categoryId: '1',
            taskId: '1',
            labelIds: ['1', '2'],
          }),
          EventEntryFixture.default({
            id: '2',
            userId: userId,
            eventType: EVENT_TYPE.ACTUAL,
            summary: 'test event 2',
            start: EventDateTimeFixture.default({
              dateTime: new Date('2024-12-31T10:00:00+0900'),
            }),
            end: EventDateTimeFixture.default({
              dateTime: new Date('2024-12-31T11:00:00+0900'),
            }),
            description: 'ACTUAL TEST',
            projectId: '1',
            categoryId: '1',
            taskId: '1',
            labelIds: ['1'],
          }),
          EventEntryFixture.default({
            id: '3',
            userId: userId,
            eventType: EVENT_TYPE.SHARED,
            summary: 'test event 3',
            start: EventDateTimeFixture.default({
              dateTime: new Date('2025-01-01T10:00:00+0900'),
            }),
            end: EventDateTimeFixture.default({
              dateTime: new Date('2025-01-01T11:00:00+0900'),
            }),
            description: 'SHARED TEST',
            projectId: null,
            categoryId: null,
            taskId: null,
            labelIds: null,
          }),
        ],
        expected: {
          count: 4,
          projectIds: ['1'],
          categoryIds: ['1'],
          taskIds: ['1'],
          labelIds: ['1', '2'],
          events: [
            eventEntryCsvHeader,
            {
              eventEntryId: '1',
              eventType: '予定',
              start: format(
                eventDateTimeToDate(
                  EventDateTimeFixture.default({ dateTime: new Date('2024-12-30T10:00:00+0900') })
                ),
                'yyyy/MM/dd HH:mm'
              ),
              end: format(
                eventDateTimeToDate(
                  EventDateTimeFixture.default({ dateTime: new Date('2024-12-30T11:00:00+0900') })
                ),
                'yyyy/MM/dd HH:mm'
              ),
              summary: 'test event 1',
              projectId: '1',
              projectName: 'test-project',
              categoryId: '1',
              categoryName: 'test-category',
              taskId: '1',
              taskName: 'test-task',
              labelIds: '1,2',
              labelNames: 'test-label1,test-label2',
              description: 'PLAN TEST',
            },
            {
              eventEntryId: '2',
              eventType: '実績',
              start: format(
                eventDateTimeToDate(
                  EventDateTimeFixture.default({ dateTime: new Date('2024-12-31T10:00:00+0900') })
                ),
                'yyyy/MM/dd HH:mm'
              ),
              end: format(
                eventDateTimeToDate(
                  EventDateTimeFixture.default({ dateTime: new Date('2024-12-31T11:00:00+0900') })
                ),
                'yyyy/MM/dd HH:mm'
              ),
              summary: 'test event 2',
              projectId: '1',
              projectName: 'test-project',
              categoryId: '1',
              categoryName: 'test-category',
              taskId: '1',
              taskName: 'test-task',
              labelIds: '1',
              labelNames: 'test-label1',
              description: 'ACTUAL TEST',
            },
            {
              eventEntryId: '3',
              eventType: '共有',
              start: format(
                eventDateTimeToDate(
                  EventDateTimeFixture.default({ dateTime: new Date('2025-01-01T10:00:00+0900') })
                ),
                'yyyy/MM/dd HH:mm'
              ),
              end: format(
                eventDateTimeToDate(
                  EventDateTimeFixture.default({ dateTime: new Date('2025-01-01T11:00:00+0900') })
                ),
                'yyyy/MM/dd HH:mm'
              ),
              summary: 'test event 3',
              projectId: '',
              projectName: '',
              categoryId: '',
              categoryName: '',
              taskId: '',
              taskName: '',
              labelIds: '',
              labelNames: '',
              description: 'SHARED TEST',
            },
          ],
        },
      },
      {
        description: '予実CSVデータを出力する(検索結果が0件)',
        paramEventEntrySetting: EventEntryCsvSettingFixture.default({
          start: new Date('2024-12-01T00:00:00+0900'),
          end: new Date('2024-12-01T23:59:59+0900'),
          eventType: EVENT_TYPE.SHARED,
        }),
        eventEntries: [],
        expected: {
          projectIds: [],
          categoryIds: [],
          taskIds: [],
          labelIds: [],
          count: 1,
          events: [eventEntryCsvHeader],
        },
      },
    ];

    it.each(testCases)('%s', async (t) => {
      const expected = t.expected;
      jest.spyOn(eventEntryService, 'list').mockResolvedValue(t.eventEntries);
      jest.spyOn(projectService, 'getAll').mockResolvedValue(projects);
      jest.spyOn(categoryService, 'getAll').mockResolvedValue(categories);
      jest.spyOn(taskService, 'getAll').mockResolvedValue(tasks);
      jest.spyOn(labelService, 'getAll').mockResolvedValue(labels);

      const csvSearch = await service.searchEventEntryCsv(t.paramEventEntrySetting);
      expect(eventEntryService.list).toHaveBeenCalledWith(
        userId,
        t.paramEventEntrySetting.start,
        t.paramEventEntrySetting.end,
        t.paramEventEntrySetting.eventType
      );
      expect(projectService.getAll).toHaveBeenCalledWith(expected.projectIds);
      expect(categoryService.getAll).toHaveBeenCalledWith(expected.categoryIds);
      expect(taskService.getAll).toHaveBeenCalledWith(expected.taskIds);
      expect(labelService.getAll).toHaveBeenCalledWith(expected.labelIds);
      logger.debug('csvSearch:', csvSearch, 'expected:', expected.events);

      expect(csvSearch).toHaveLength(expected.count);
      for (let i = 0; i < csvSearch.length; i++) {
        expect(csvSearch[i].eventEntryId).toEqual(expected.events[i].eventEntryId);
        expect(csvSearch[i].eventType).toEqual(expected.events[i].eventType);
        expect(csvSearch[i].start).toEqual(expected.events[i].start);
        expect(csvSearch[i].end).toEqual(expected.events[i].end);
        expect(csvSearch[i].summary).toEqual(expected.events[i].summary);
        expect(csvSearch[i].projectId).toEqual(expected.events[i].projectId);
        expect(csvSearch[i].projectName).toEqual(expected.events[i].projectName);
        expect(csvSearch[i].categoryId).toEqual(expected.events[i].categoryId);
        expect(csvSearch[i].categoryName).toEqual(expected.events[i].categoryName);
        expect(csvSearch[i].taskId).toEqual(expected.events[i].taskId);
        expect(csvSearch[i].taskName).toEqual(expected.events[i].taskName);
        expect(csvSearch[i].labelIds).toEqual(expected.events[i].labelIds);
        expect(csvSearch[i].labelNames).toEqual(expected.events[i].labelNames);
        expect(csvSearch[i].description).toEqual(expected.events[i].description);
      }
    });
  });
});
