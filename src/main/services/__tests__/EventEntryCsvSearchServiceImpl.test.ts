import { format } from 'date-fns';
import { CategoryFixture } from '@shared/data/__tests__/CategoryFixture';
import { EventEntryCsvFixture } from '@shared/data/__tests__/EventEntryCsvFixture';
import { EventEntryCsvSettingFixture } from '@shared/data/__tests__/EventEntryCsvSettingFixture';
import { EventDateTimeFixture, EventEntryFixture } from '@shared/data/__tests__/EventEntryFixture';
import { LabelFixture } from '@shared/data/__tests__/LabelFixture';
import { ProjectFixture } from '@shared/data/__tests__/ProjectFixture';
import { TaskFixture } from '@shared/data/__tests__/TaskFixture';
import { eventDateTimeToDate } from '@shared/data/EventDateTime';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { EventEntryCsvSearchServiceImpl } from '../EventEntryCsvSearchServiceImpl';
import { ICategoryService } from '../ICategoryService';
import { IEventEnryCsvSearchService } from '../IEventEntryCsvSearchService';
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

describe('EventEntryCsvSearchServiceImpl', () => {
  let userDetailsService: IUserDetailsService;
  let eventEntryService: IEventEntryService;
  let service: IEventEnryCsvSearchService;
  let projectService: IProjectService;
  let categoryService: ICategoryService;
  let taskService: ITaskService;
  let labelService: ILabelService;
  const userId = 'test user';
  const eventEntryCsvSetting = EventEntryCsvSettingFixture.default();

  beforeEach(() => {
    userDetailsService = new UserDetailsServiceMockBuilder().withGetUserId(userId).build();
    eventEntryService = new EventEntryServiceMockBuilder().build();
    projectService = new ProjectServiceMockBuilder().build();
    categoryService = new CategoryServiceMockBuilder().build();
    taskService = new TaskServiceMockBuilder().build();
    labelService = new LabelServiceMockBuilder().build();
    service = new EventEntryCsvSearchServiceImpl(
      userDetailsService,
      eventEntryService,
      projectService,
      categoryService,
      taskService,
      labelService
    );
  });

  describe('searchEventEntryCsv', () => {
    describe('CSVデータ生成テスト', () => {
      const testCases = [
        {
          description: '予実CSVデータを出力する',
          paramEventEntrySetting: eventEntryCsvSetting,
          paramEventEntry: [
            EventEntryFixture.default({
              id: '123456789',
              userId: userId,
              eventType: EVENT_TYPE.PLAN,
              summary: '予定テスト',
              start: EventDateTimeFixture.default({ dateTime: new Date('2024-01-01T11:00:00+0900') }),
              end: EventDateTimeFixture.default({ dateTime: new Date('2024-01-01T12:00:00+0900') }),
              description: '予定概要',
              projectId: '1',
              categoryId: '1',
              taskId: '1',
              labelIds: ['1', '2'],
            }),
            EventEntryFixture.default({
              id: '987654321',
              userId: userId,
              eventType: EVENT_TYPE.ACTUAL,
              summary: '実績テスト',
              start: EventDateTimeFixture.default({ dateTime: new Date('2024-12-30T13:00:00+0900') }),
              end: EventDateTimeFixture.default({ dateTime: new Date('2024-12-30T14:00:00+0900') }),
              description: '実績概要',
            }),
          ],
          paramProject: [
            ProjectFixture.default({
              id: '1',
              name: 'test-project',
            }),
          ],
          paramCategory: [
            CategoryFixture.default({
              id: '1',
              name: 'test-category',
            }),
          ],
          paramTask: [
            TaskFixture.default({
              id: '1',
              name: 'test-task',
            }),
          ],
          paramLabel: [
            LabelFixture.default({
              id: '1',
              name: 'test-label1',
            }),
            LabelFixture.default({
              id: '2',
              name: 'test-label2',
            }),
          ],
          expected: [
            EventEntryCsvFixture.default({
              eventEntryId: '123456789',
              eventType: '予定',
              start: format(
                eventDateTimeToDate(
                  EventDateTimeFixture.default({ dateTime: new Date('2024-01-01T11:00:00+0900') })
                ),
                'yyyy/MM/dd HH:mm'
              ),
              end: format(
                eventDateTimeToDate(
                  EventDateTimeFixture.default({ dateTime: new Date('2024-01-01T12:00:00+0900') })
                ),
                'yyyy/MM/dd HH:mm'
              ),
              summary: '予定テスト',
              projectId: '1',
              projectName: 'test-project',
              categoryId: '1',
              categoryName: 'test-category',
              taskId: '1',
              taskName: 'test-task',
              labelIds: '1,2',
              labelNames: 'test-label1,test-label2',
              description: '予定概要',
            }),
            EventEntryCsvFixture.default({
              eventEntryId: '987654321',
              eventType: '実績',
              start: format(
                eventDateTimeToDate(
                  EventDateTimeFixture.default({ dateTime: new Date('2024-12-30T13:00:00+0900') })
                ),
                'yyyy/MM/dd HH:mm'
              ),
              end: format(
                eventDateTimeToDate(
                  EventDateTimeFixture.default({ dateTime: new Date('2024-12-30T14:00:00+0900') })
                ),
                'yyyy/MM/dd HH:mm'
              ),
              summary: '実績テスト',
              description: '実績概要',
            }),
          ],
        },
      ];
      it.each(testCases)('%s', async (t) => {
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(t.paramEventEntry);
        jest.spyOn(projectService, 'getAll').mockResolvedValue(t.paramProject);
        jest.spyOn(categoryService, 'getAll').mockResolvedValue(t.paramCategory);
        jest.spyOn(taskService, 'getAll').mockResolvedValue(t.paramTask);
        jest.spyOn(labelService, 'getAll').mockResolvedValue(t.paramLabel);

        const csvSearch = await service.searchEventEntryCsv(t.paramEventEntrySetting);

        expect(csvSearch.length).toEqual(t.expected.length);
        expect(csvSearch).toEqual(t.expected);
      });
    });
  });
});
