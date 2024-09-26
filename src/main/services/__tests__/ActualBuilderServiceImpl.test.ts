import {
  ActivityDetailFixture,
  ActivityEventFixture,
} from '@shared/data/__tests__/ActivityEventFixture';
import { IActivityService } from '../IActivityService';
import { ActivityServiceMockBuilder } from './__mocks__/ActivityServiceMockBuilder';
import { IUserDetailsService } from '../IUserDetailsService';
import { IPatternService } from '../IPatternService';
import { UserDetailsServiceMockBuilder } from './__mocks__/UserDetailsServiceMockBuilder';
import { PatternServiceMockBuilder } from './__mocks__/PatternServiceMockBuilder';
import { EventDateTimeFixture, EventEntryFixture } from '@shared/data/__tests__/EventEntryFixture';
import { PatternFixture } from '@shared/data/__tests__/PatternFixture';
import { ITaskService } from '../ITaskService';
import { TaskServiceMockBuilder } from './__mocks__/TaskServiceMockBuilder';
import { Page, Pageable } from '@shared/data/Page';
import { Pattern } from '@shared/data/Pattern';
import { Task } from '@shared/data/Task';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { TaskFixture } from '@shared/data/__tests__/TaskFixture';
import { IActualBuilderService } from '../IActualBuilderService';
import { ActualBuilderServiceImpl } from '../ActualBuilderServiceImpl';
import { IEventEntryService } from '../IEventEntryService';
import { EventEntryServiceMockBuilder } from './__mocks__/EventEntryServiceMockBuilder';

describe('ActualBuilderServiceImpl', () => {
  let service: IActualBuilderService;
  let userDetailsService: IUserDetailsService;
  let eventEntryService: IEventEntryService;
  let activityService: IActivityService;
  let patternService: IPatternService;
  let taskService: ITaskService;
  const userId = 'test user';

  beforeEach(() => {
    jest.resetAllMocks();
    userDetailsService = new UserDetailsServiceMockBuilder().withGetUserId(userId).build();
    eventEntryService = new EventEntryServiceMockBuilder().build();
    activityService = new ActivityServiceMockBuilder().build();
    patternService = new PatternServiceMockBuilder().build();
    taskService = new TaskServiceMockBuilder().build();
    service = new ActualBuilderServiceImpl(
      userDetailsService,
      eventEntryService,
      activityService,
      patternService,
      taskService
    );
  });

  describe('buildActual', () => {
    const start = new Date('2023-07-01T09:00:00+0900');
    const end = new Date('2023-07-01T10:00:00+0900');
    const DEFAULT_SUMMARY = '仮実績';
    const testCases = [
      {
        description: '正規表現のチェック',
        eventEntries: [],
        activities: [
          ActivityEventFixture.default({
            id: 'a1',
            basename: 'test.exe',
            start: new Date('2023-07-01T09:30:00+0900'),
            end: new Date('2023-07-01T10:30:00+0900'),
            details: [
              ActivityDetailFixture.default({
                windowTitle: 'abc123',
                start: new Date('2023-07-01T09:30:00+0900'),
                end: new Date('2023-07-01T10:00:00+0900'),
              }),
              ActivityDetailFixture.default({
                windowTitle: 'test',
                start: new Date('2023-07-01T10:00:00+0900'),
                end: new Date('2023-07-01T10:30:00+0900'),
              }),
            ],
          }),
        ],
        patterns: [
          PatternFixture.default({
            id: 'p1',
            basename: 'test.exe',
            regularExpression: String.raw`^[a-z]{3}\d`,
            projectId: 'pr1',
          }),
        ],
        tasks: [],
        expected: EventEntryFixture.default({
          userId: userId,
          eventType: EVENT_TYPE.ACTUAL,
          summary: DEFAULT_SUMMARY,
          start: EventDateTimeFixture.default({
            dateTime: new Date('2023-07-01T09:00:00+0900'),
          }),
          end: EventDateTimeFixture.default({
            dateTime: new Date('2023-07-01T10:00:00+0900'),
          }),
          isProvisional: true,
          projectId: 'pr1',
          categoryId: null,
          labelIds: null,
          taskId: null,
        }),
      },
      {
        description: '実績登録済みの時間帯には生成しない',
        eventEntries: [
          EventEntryFixture.default({
            id: 'e1',
            userId: userId,
            eventType: EVENT_TYPE.ACTUAL,
            start: EventDateTimeFixture.default({ dateTime: new Date('2023-07-01T08:00:00+0900') }),
            end: EventDateTimeFixture.default({ dateTime: new Date('2023-07-01T11:00:00+0900') }),
          }),
        ],
        activities: [
          ActivityEventFixture.default({
            id: 'a1',
            basename: 'test.exe',
            start: new Date('2023-07-01T09:30:00+0900'),
            end: new Date('2023-07-01T10:30:00+0900'),
            details: [
              ActivityDetailFixture.default({
                windowTitle: 'test',
                start: new Date('2023-07-01T09:30:00+0900'),
                end: new Date('2023-07-01T10:00:00+0900'),
              }),
            ],
          }),
        ],
        patterns: [
          PatternFixture.default({
            id: 'p1',
            basename: 'test.exe',
            projectId: 'pr1',
          }),
        ],
        tasks: [],
        expected: null,
      },
      {
        description: 'プロジェクトと紐づかないタスクは設定されない',
        eventEntries: [],
        activities: [
          ActivityEventFixture.default({
            id: 'a1',
            basename: 'test.exe',
            start: new Date('2023-07-01T08:40+0900'),
            end: new Date('2023-07-01T09:10:00+0900'),
            details: [
              ActivityDetailFixture.default({
                windowTitle: 'test',
                start: new Date('2023-07-01T08:40:00+0900'),
                end: new Date('2023-07-01T09:10:00+0900'),
              }),
            ],
          }),
          ActivityEventFixture.default({
            id: 'a2',
            basename: 'test2.exe',
            start: new Date('2023-07-01T09:30:00+0900'),
            end: new Date('2023-07-01T10:30:00+0900'),
            details: [
              ActivityDetailFixture.default({
                windowTitle: 'test',
                start: new Date('2023-07-01T09:30:00+0900'),
                end: new Date('2023-07-01T10:30:00+0900'),
              }),
            ],
          }),
        ],
        patterns: [
          PatternFixture.default({
            id: 'p1',
            basename: 'test.exe',
            projectId: 'pr1',
            categoryId: 'cat1',
            taskId: 't1',
          }),
          PatternFixture.default({
            id: 'p2',
            basename: 'test2.exe',
            projectId: 'pr2',
            categoryId: 'cat1',
          }),
        ],
        tasks: [TaskFixture.default({ id: 't1', projectId: 'pr1' })],
        expected: EventEntryFixture.default({
          userId: userId,
          eventType: EVENT_TYPE.ACTUAL,
          summary: DEFAULT_SUMMARY,
          start: EventDateTimeFixture.default({
            dateTime: new Date('2023-07-01T09:00:00+0900'),
          }),
          end: EventDateTimeFixture.default({
            dateTime: new Date('2023-07-01T10:00:00+0900'),
          }),
          isProvisional: true,
          projectId: 'pr2',
          categoryId: 'cat1',
          labelIds: null,
          taskId: null,
        }),
      },
      {
        description: 'アクティビティの時間の加算が関係する場合',
        eventEntries: [],
        activities: [
          ActivityEventFixture.default({
            id: 'a1',
            basename: 'test.exe',
            start: new Date('2023-07-01T08:40+0900'),
            end: new Date('2023-07-01T09:10:00+0900'),
            details: [
              ActivityDetailFixture.default({
                windowTitle: 'test',
                start: new Date('2023-07-01T08:40:00+0900'),
                end: new Date('2023-07-01T09:10:00+0900'),
              }),
            ],
          }),
          ActivityEventFixture.default({
            id: 'a2',
            basename: 'test2.exe',
            start: new Date('2023-07-01T09:10:00+0900'),
            end: new Date('2023-07-01T09:30:00+0900'),
            details: [
              ActivityDetailFixture.default({
                windowTitle: 'test',
                start: new Date('2023-07-01T09:10:00+0900'),
                end: new Date('2023-07-01T09:30:00+0900'),
              }),
            ],
          }),
          ActivityEventFixture.default({
            id: 'a3',
            basename: 'test.exe',
            start: new Date('2023-07-01T09:30+0900'),
            end: new Date('2023-07-01T10:00:00+0900'),
            details: [
              ActivityDetailFixture.default({
                windowTitle: 'test',
                start: new Date('2023-07-01T09:30:00+0900'),
                end: new Date('2023-07-01T10:00:00+0900'),
              }),
            ],
          }),
        ],
        patterns: [
          PatternFixture.default({
            id: 'p1',
            basename: 'test.exe',
            projectId: 'pr1',
            categoryId: 'cat1',
            taskId: 't1',
          }),
          PatternFixture.default({
            id: 'p2',
            basename: 'test2.exe',
            projectId: 'pr2',
            categoryId: 'cat1',
          }),
        ],
        tasks: [TaskFixture.default({ id: 't1', projectId: 'pr1' })],
        expected: EventEntryFixture.default({
          userId: userId,
          eventType: EVENT_TYPE.ACTUAL,
          summary: DEFAULT_SUMMARY,
          start: EventDateTimeFixture.default({
            dateTime: new Date('2023-07-01T09:00:00+0900'),
          }),
          end: EventDateTimeFixture.default({
            dateTime: new Date('2023-07-01T10:00:00+0900'),
          }),
          isProvisional: true,
          projectId: 'pr1',
          categoryId: 'cat1',
          labelIds: null,
          taskId: 't1',
        }),
      },
    ];

    it.each(testCases)('%s', async (testCase) => {
      const PAGEABLE = new Pageable(0, Number.MAX_SAFE_INTEGER);
      jest.spyOn(eventEntryService, 'list').mockResolvedValue(testCase.eventEntries);
      jest.spyOn(activityService, 'fetchActivities').mockResolvedValue(testCase.activities);
      jest
        .spyOn(patternService, 'list')
        .mockResolvedValue(
          new Page<Pattern>(testCase.patterns, testCase.patterns.length, PAGEABLE)
        );
      jest
        .spyOn(taskService, 'list')
        .mockResolvedValue(new Page<Task>(testCase.tasks, testCase.tasks.length, PAGEABLE));
      const received = await service.buildActual(start, end);

      // expectedから、比較すべきところだけ抽出
      const expected = testCase.expected
        ? expect.objectContaining({
            userId: testCase.expected.userId,
            eventType: testCase.expected.eventType,
            summary: testCase.expected.summary,
            start: { dateTime: testCase.expected.start.dateTime },
            end: { dateTime: testCase.expected.end.dateTime },
            isProvisional: testCase.expected.isProvisional,
            projectId: testCase.expected.projectId,
            categoryId: testCase.expected.categoryId,
            labelIds: testCase.expected.labelIds,
            taskId: testCase.expected.taskId,
          })
        : null;

      expect(received).toEqual(expected);
    });
  });
});
