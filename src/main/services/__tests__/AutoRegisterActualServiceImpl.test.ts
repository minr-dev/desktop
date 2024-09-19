import {
  ActivityDetailFixture,
  ActivityEventFixture,
} from '@shared/data/__tests__/ActivityEventFixture';
import { IActivityService } from '../IActivityService';
import { ActivityServiceMockBuilder } from './__mocks__/ActivityServiceMockBuilder';
import { IAutoRegisterActualService } from '../IAutoRegisterActualService';
import { IEventEntryService } from '../IEventEntryService';
import { IUserDetailsService } from '../IUserDetailsService';
import { IPatternService } from '../IPatternService';
import { EventEntryServiceMockBuilder } from './__mocks__/EventEntryServiceMockBuilder';
import { UserDetailsServiceMockBuilder } from './__mocks__/UserDetailsServiceMockBuilder';
import { AutoRegisterActualServiceImpl } from '../AutoRegisterActuralServiceImpl';
import { PatternServiceMockBuilder } from './__mocks__/PatternServiceMockBuilder';
import { EventDateTimeFixture, EventEntryFixture } from '@shared/data/__tests__/EventEntryFixture';
import { PatternFixture } from '@shared/data/__tests__/PatternFixture';
import { ITaskService } from '../ITaskService';
import { TaskServiceMockBuilder } from './__mocks__/TaskServiceMockBuilder';
import { Page, Pageable } from '@shared/data/Page';
import { Pattern } from '@shared/data/Pattern';
import { Task } from '@shared/data/Task';
import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { IOverlapEventMergeService } from '../IOverlapEventMergeService';
import { OverlapEventMergeServiceMockBuilder } from './__mocks__/OverlapEventMergeServiceMockBuilder';
import { TaskFixture } from '@shared/data/__tests__/TaskFixture';

describe('ActivityServiceImpl', () => {
  let service: IAutoRegisterActualService;
  let userDetailsService: IUserDetailsService;
  let eventEntryService: IEventEntryService;
  let activityService: IActivityService;
  let patternService: IPatternService;
  let taskService: ITaskService;
  let overlapEventMergeService: IOverlapEventMergeService;
  const userId = 'test user';

  beforeEach(() => {
    jest.resetAllMocks();
    userDetailsService = new UserDetailsServiceMockBuilder().withGetUserId(userId).build();
    eventEntryService = new EventEntryServiceMockBuilder().build();
    activityService = new ActivityServiceMockBuilder().build();
    patternService = new PatternServiceMockBuilder().build();
    taskService = new TaskServiceMockBuilder().build();
    overlapEventMergeService = new OverlapEventMergeServiceMockBuilder().build();
    service = new AutoRegisterActualServiceImpl(
      userDetailsService,
      eventEntryService,
      activityService,
      patternService,
      taskService,
      overlapEventMergeService
    );
  });

  describe('autoRegisterProvisionalActuals', () => {
    describe('実績のマージ前までのテスト', () => {
      const targetDate = new Date('2023-07-01T06:00:00+0900');
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
                  windowTitle: 'Meets',
                  start: new Date('2023-07-01T09:30:00+0900'),
                  end: new Date('2023-07-01T10:00:00+0900'),
                }),
                ActivityDetailFixture.default({
                  windowTitle: 'Meets1',
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
              regularExpression: '^Meets$',
              projectId: 'pr1',
            }),
          ],
          tasks: [TaskFixture.default({})],
          expected: [
            EventEntryFixture.default({
              userId: userId,
              eventType: EVENT_TYPE.ACTUAL,
              summary: '仮実績',
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
            EventEntryFixture.default({
              userId: userId,
              eventType: EVENT_TYPE.ACTUAL,
              summary: '仮実績',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T11:00:00+0900'),
              }),
              isProvisional: true,
              projectId: null,
              categoryId: null,
              labelIds: null,
              taskId: null,
            }),
          ],
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
        const mergeSpy = jest.spyOn(overlapEventMergeService, 'mergeOverlapEvent');
        await service.autoRegisterProvisionalActuals(targetDate);

        // expectedから、比較すべきところだけ抽出
        const expectedArray = testCase.expected.map(
          (expected: EventEntry): Partial<EventEntry> =>
            expect.objectContaining({
              userId: expected.userId,
              eventType: expected.eventType,
              summary: expected.summary,
              description: expected.description,
              start: expected.start,
              end: expected.end,
              isProvisional: expected.isProvisional,
              projectId: expected.projectId,
              categoryId: expected.categoryId,
              labelIds: expected.labelIds,
              taskId: expected.taskId,
            })
        );

        expect(mergeSpy.mock.calls[0][0]).toHaveLength(expectedArray.length);
        expect(mergeSpy).toHaveBeenCalledWith(expect.arrayContaining(expectedArray));
      });
    });

    describe('実績のマージ後のテスト', () => {
      const targetDate = new Date('2023-07-01T06:00:00+0900');
      const testCases = [
        {
          description: 'タイトル生成チェック',
          eventEntries: [
            EventEntryFixture.default({
              userId: userId,
              eventType: EVENT_TYPE.PLAN,
              summary: 'タスク1',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T09:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T11:00:00+0900'),
              }),
            }),
          ],
          mergedActuals: [
            EventEntryFixture.default({
              userId: userId,
              eventType: EVENT_TYPE.ACTUAL,
              summary: '仮実績',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T09:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T11:00:00+0900'),
              }),
              isProvisional: true,
              projectId: 'pr1',
              categoryId: null,
              labelIds: null,
              taskId: null,
            }),
          ],
          expected: [
            EventEntryFixture.default({
              userId: userId,
              eventType: EVENT_TYPE.ACTUAL,
              summary: 'タスク1',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T09:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-01T11:00:00+0900'),
              }),
              isProvisional: true,
              projectId: 'pr1',
              categoryId: null,
              labelIds: null,
              taskId: null,
            }),
          ],
        },
      ];

      it.each(testCases)('%s', async (testCase) => {
        const PAGEABLE = new Pageable(0, Number.MAX_SAFE_INTEGER);
        // マージ後の値を直接モックで渡すので、それより前でしか使わないモックは適当な値を返していい
        jest.spyOn(activityService, 'fetchActivities').mockResolvedValue([]);
        jest.spyOn(patternService, 'list').mockResolvedValue(new Page<Pattern>([], 0, PAGEABLE));
        jest.spyOn(taskService, 'list').mockResolvedValue(new Page<Task>([], 0, PAGEABLE));

        jest.spyOn(eventEntryService, 'list').mockResolvedValue(testCase.eventEntries);
        jest
          .spyOn(overlapEventMergeService, 'mergeOverlapEvent')
          .mockReturnValue(testCase.mergedActuals);
        const saveSpy = jest
          .spyOn(eventEntryService, 'save')
          .mockImplementation(async (data) => data);

        await service.autoRegisterProvisionalActuals(targetDate);

        // expectedから、比較すべきところだけ抽出
        const expectedArray = testCase.expected.map(
          (expected: EventEntry): Partial<EventEntry> =>
            expect.objectContaining({
              userId: expected.userId,
              eventType: expected.eventType,
              summary: expected.summary,
              description: expected.description,
              start: expected.start,
              end: expected.end,
              isProvisional: expected.isProvisional,
              projectId: expected.projectId,
              categoryId: expected.categoryId,
              labelIds: expected.labelIds,
              taskId: expected.taskId,
            })
        );
        expect(saveSpy).toHaveBeenCalledTimes(expectedArray.length);
        const saveDataArray = saveSpy.mock.calls.map((call) => call[0]);
        expect(saveDataArray).toEqual(expect.arrayContaining(expectedArray));
      });
    });
  });
});
