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
import { IActualPredictiveCreationService } from '../IActualPredictiveCreationService';
import { ActualPredictiveCreationServiceImpl } from '../ActualPredictiveCreationServiceImpl';
import { IEventEntryService } from '../IEventEntryService';
import { EventEntryServiceMockBuilder } from './__mocks__/EventEntryServiceMockBuilder';
import { assert } from 'console';

describe('ActualPredictiveCreationServiceImpl', () => {
  let service: IActualPredictiveCreationService;
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
    service = new ActualPredictiveCreationServiceImpl(
      userDetailsService,
      eventEntryService,
      activityService,
      patternService,
      taskService
    );
  });

  describe('generatePredictedActual', () => {
    describe('返り値のテスト(パターンがない場合)', () => {
      const DEFAULT_SUMMARY = '仮実績';

      const testCases = [
        {
          description:
            '実績を生成できた場合の、パターンに関係しない部分のテスト、' +
            '及びパターンがない場合でもアクティビティがあれば実績が生成されることの確認',
          start: new Date('2023-07-01T09:00:00+0900'),
          end: new Date('2023-07-01T10:00:00+0900'),
          eventEntries: [],
          activities: [
            ActivityEventFixture.default({
              id: 'a1',
              start: new Date('2023-07-01T09:00:00+0900'),
              end: new Date('2023-07-01T10:00:00+0900'),
              details: [
                ActivityDetailFixture.default({
                  start: new Date('2023-07-01T09:00:00+0900'),
                  end: new Date('2023-07-01T10:00:00+0900'),
                }),
              ],
            }),
          ],
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
          }),
        },
        {
          description: '実績登録済みの時間帯には生成しない',
          start: new Date('2023-07-01T09:00:00+0900'),
          end: new Date('2023-07-01T10:00:00+0900'),
          eventEntries: [
            EventEntryFixture.default({
              id: 'e1',
              userId: userId,
              eventType: EVENT_TYPE.ACTUAL,
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T08:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({ dateTime: new Date('2023-07-01T11:00:00+0900') }),
            }),
          ],
          activities: [
            ActivityEventFixture.default({
              id: 'a1',
              start: new Date('2023-07-01T09:00:00+0900'),
              end: new Date('2023-07-01T10:00:00+0900'),
              details: [
                ActivityDetailFixture.default({
                  start: new Date('2023-07-01T09:00:00+0900'),
                  end: new Date('2023-07-01T10:00:00+0900'),
                }),
              ],
            }),
          ],
          expected: null,
        },
        {
          description: 'アクティビティがないときは実績を生成しない',
          start: new Date('2023-07-01T09:00:00+0900'),
          end: new Date('2023-07-01T10:00:00+0900'),
          eventEntries: [],
          activities: [],
          expected: null,
        },
      ];

      it.each(testCases)('%s', async (testCase) => {
        const PAGEABLE = new Pageable(0, Number.MAX_SAFE_INTEGER);
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(testCase.eventEntries);
        jest.spyOn(activityService, 'fetchActivities').mockResolvedValue(testCase.activities);
        jest.spyOn(patternService, 'list').mockResolvedValue(new Page<Pattern>([], 0, PAGEABLE));
        jest.spyOn(taskService, 'list').mockResolvedValue(new Page<Task>([], 0, PAGEABLE));
        const received = await service.generatePredictedActual(testCase.start, testCase.end);

        // expectedから、比較すべきところだけ抽出
        const expected = testCase.expected
          ? expect.objectContaining({
              userId: testCase.expected.userId,
              eventType: testCase.expected.eventType,
              summary: testCase.expected.summary,
              start: { dateTime: testCase.expected.start.dateTime },
              end: { dateTime: testCase.expected.end.dateTime },
              isProvisional: testCase.expected.isProvisional,
            })
          : null;

        expect(received).toEqual(expected);
      });
    });

    describe('パターンのマッチに関するテスト', () => {
      // Fixture のデフォルトでの時間帯を含むように start と endを指定する
      const start = new Date('2023-07-01T09:00:00+0900');
      const end = new Date('2023-07-02T09:00:00+0900');

      // activity 及びその details の start と end は Fixture のデフォルトの値を用いるようにする
      const testCases = [
        {
          description: '正規表現のチェック',
          activity: ActivityEventFixture.default({
            basename: 'test.exe',
            details: [
              ActivityDetailFixture.default({
                windowTitle: 'abc123',
              }),
            ],
          }),
          pattern: PatternFixture.default({
            basename: 'test.exe',
            regularExpression: String.raw`^[a-z]{3}\d`,
            projectId: 'pr1',
          }),
          expected: EventEntryFixture.default({
            projectId: 'pr1',
            categoryId: undefined,
          }),
        },
      ];

      it.each(testCases)('%s', async (testCase) => {
        // 引数で指定した時間帯内に activity や activityDetail が含まれないと結果が返らないため、ここで確認する
        assert(testCase.activity.start < end || testCase.activity.end > start);
        for (const detail of testCase.activity.details) {
          assert(detail.start <= end || detail.end >= start);
        }

        const PAGEABLE = new Pageable(0, Number.MAX_SAFE_INTEGER);
        jest.spyOn(eventEntryService, 'list').mockResolvedValue([]);
        jest.spyOn(activityService, 'fetchActivities').mockResolvedValue([testCase.activity]);
        jest
          .spyOn(patternService, 'list')
          .mockResolvedValue(new Page<Pattern>([testCase.pattern], 1, PAGEABLE));
        jest.spyOn(taskService, 'list').mockResolvedValue(new Page<Task>([], 0, PAGEABLE));
        const received = await service.generatePredictedActual(start, end);

        const expected = testCase.expected;
        if (expected.projectId == null) {
          // nullかundefinedのどちらかでよい
          expect(received?.projectId == null).toBe(true);
        } else {
          expect(received?.projectId).toEqual(expected.projectId);
        }
        if (expected.categoryId == null) {
          // nullかundefinedのどちらかでよい
          expect(received?.categoryId == null).toBe(true);
        } else {
          expect(received?.categoryId).toEqual(expected.categoryId);
        }
        if (expected.labelIds == null || expected.labelIds.length == 0) {
          // nullかundefinedか[]のどれかでよい
          expect(received?.labelIds == null || received.labelIds.length == 0).toBe(true);
        } else {
          expect(received?.labelIds).toHaveLength(expected.labelIds.length);
          expect(received?.labelIds).toEqual(expect.arrayContaining(expected.labelIds));
        }
        if (expected.taskId == null) {
          // nullかundefinedのどちらかでよい
          expect(received?.taskId == null).toBe(true);
        } else {
          expect(received?.taskId).toEqual(expected.taskId);
        }
      });
    });

    describe('パターンが複数ある場合でのテスト', () => {
      const start = new Date('2023-07-01T09:00:00+0900');
      const end = new Date('2023-07-01T10:00:00+0900');
      const testCases = [
        {
          description: 'プロジェクトと紐づかないタスクは設定されない',
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
            projectId: 'pr2',
            categoryId: 'cat1',
            labelIds: null,
            taskId: null,
          }),
        },
        {
          description: 'アクティビティの時間を加算した値で比較して割り当てが行われていることの確認',
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
            projectId: 'pr1',
            categoryId: 'cat1',
            labelIds: null,
            taskId: 't1',
          }),
        },
      ];
      it.each(testCases)('%s', async (testCase) => {
        const PAGEABLE = new Pageable(0, Number.MAX_SAFE_INTEGER);
        jest.spyOn(eventEntryService, 'list').mockResolvedValue([]);
        jest.spyOn(activityService, 'fetchActivities').mockResolvedValue(testCase.activities);
        jest
          .spyOn(patternService, 'list')
          .mockResolvedValue(
            new Page<Pattern>(testCase.patterns, testCase.patterns.length, PAGEABLE)
          );
        jest
          .spyOn(taskService, 'list')
          .mockResolvedValue(new Page<Task>(testCase.tasks, testCase.tasks.length, PAGEABLE));
        const received = await service.generatePredictedActual(start, end);

        const expected = testCase.expected;
        if (expected.projectId == null) {
          // nullかundefinedのどちらかでよい
          expect(received?.projectId == null).toBe(true);
        } else {
          expect(received?.projectId).toEqual(expected.projectId);
        }
        if (expected.categoryId == null) {
          // nullかundefinedのどちらかでよい
          expect(received?.categoryId == null).toBe(true);
        } else {
          expect(received?.categoryId).toEqual(expected.categoryId);
        }
        if (expected.labelIds == null || expected.labelIds.length == 0) {
          // nullかundefinedか[]のどれかでよい
          expect(received?.labelIds == null || received.labelIds.length == 0).toBe(true);
        } else {
          expect(received?.labelIds).toHaveLength(expected.labelIds.length);
          expect(received?.labelIds).toEqual(expect.arrayContaining(expected.labelIds));
        }
        if (expected.taskId == null) {
          // nullかundefinedのどちらかでよい
          expect(received?.taskId == null).toBe(true);
        } else {
          expect(received?.taskId).toEqual(expected.taskId);
        }
      });
    });
  });
});
