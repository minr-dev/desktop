import { PlanTemplateEvent } from '@shared/data/PlanTemplateEvent';
import { IEventEntryService } from '../IEventEntryService';
import { IPlanTemplateApplicationService } from '../IPlanTemplateApplicationService';
import { IPlanTemplateEventService } from '../IPlanTemplateEventService';
import { PlanTemplateApplicationServiceImpl } from '../PlanTemplateApplicationServiceImpl';
import { EventEntryServiceMockBuilder } from './__mocks__/EventEntryServiceMockBuilder';
import { PlanTemplateEventServiceMockBuilder } from './__mocks__/PlanTemplateEventServiceMockBuilder';
import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { PlanTemplateEventFixture } from '@shared/data/__tests__/PlanTemplateEventFixture';
import { EventDateTimeFixture, EventEntryFixture } from '@shared/data/__tests__/EventEntryFixture';

describe('PlanTemplateApplicationServiceImpl', () => {
  let service: IPlanTemplateApplicationService;
  let planTemplateEventService: IPlanTemplateEventService;
  let eventEntryService: IEventEntryService;

  beforeEach(() => {
    jest.resetAllMocks();
    planTemplateEventService = new PlanTemplateEventServiceMockBuilder().build();
    eventEntryService = new EventEntryServiceMockBuilder().build();
    service = new PlanTemplateApplicationServiceImpl(planTemplateEventService, eventEntryService);
  });

  describe('applyTemplate', () => {
    const templateId = 'pt1';
    const userId = 'user1';
    it('モックの呼び出しのテスト', async () => {
      const targetDate = new Date('2025-01-01T09:00:00+0900');
      const spy = jest.spyOn(planTemplateEventService, 'list').mockResolvedValue([]);
      await service.applyTemplate(targetDate, templateId);
      expect(spy).toHaveBeenCalledWith(templateId);
    });
    type TestCase = {
      description: string;
      targetDate: Date;
      planTemplateEvents: PlanTemplateEvent[];
      expectSaveCount: number;
      expectSaved: EventEntry[];
    };
    const testCases: TestCase[] = [
      {
        description: '1イベントの変換テスト',
        targetDate: new Date('2025-04-01T09:00:00+0900'),
        planTemplateEvents: [
          PlanTemplateEventFixture.default({
            id: 'tev1',
            userId: userId,
            start: { hours: 10, minutes: 0 },
            end: { hours: 11, minutes: 0 },
            summary: 'test',
            description: 'test',
            projectId: 'pr1',
            categoryId: 'c1',
            labelIds: ['l1'],
            taskId: 't1',
          }),
        ],
        expectSaveCount: 1,
        expectSaved: [
          EventEntryFixture.default({
            userId: userId,
            start: EventDateTimeFixture.default({
              dateTime: new Date('2025-04-01T10:00:00+0900'),
            }),
            end: EventDateTimeFixture.default({
              dateTime: new Date('2025-04-01T11:00:00+0900'),
            }),
            summary: 'test',
            description: 'test',
            projectId: 'pr1',
            categoryId: 'c1',
            labelIds: ['l1'],
            taskId: 't1',
          }),
        ],
      },
      {
        description: '1日の開始時刻をまたぐイベントは分割されて登録される',
        targetDate: new Date('2025-04-01T09:00:00+0900'),
        planTemplateEvents: [
          PlanTemplateEventFixture.default({
            id: 'tev1',
            userId: userId,
            start: { hours: 8, minutes: 0 },
            end: { hours: 11, minutes: 0 },
            summary: 'test',
            description: 'test',
            projectId: 'pr1',
            categoryId: 'c1',
            labelIds: ['l1'],
            taskId: 't1',
          }),
        ],
        expectSaveCount: 2,
        expectSaved: [
          EventEntryFixture.default({
            userId: userId,
            start: EventDateTimeFixture.default({
              dateTime: new Date('2025-04-01T09:00:00+0900'),
            }),
            end: EventDateTimeFixture.default({
              dateTime: new Date('2025-04-01T11:00:00+0900'),
            }),
            summary: 'test',
            description: 'test',
            projectId: 'pr1',
            categoryId: 'c1',
            labelIds: ['l1'],
            taskId: 't1',
          }),
          EventEntryFixture.default({
            userId: userId,
            start: EventDateTimeFixture.default({
              dateTime: new Date('2025-04-02T08:00:00+0900'),
            }),
            end: EventDateTimeFixture.default({
              dateTime: new Date('2025-04-02T09:00:00+0900'),
            }),
            summary: 'test',
            description: 'test',
            projectId: 'pr1',
            categoryId: 'c1',
            labelIds: ['l1'],
            taskId: 't1',
          }),
        ],
      },
    ];
    it.each(testCases)('%s', async (testCase) => {
      jest.spyOn(planTemplateEventService, 'list').mockResolvedValue(testCase.planTemplateEvents);
      const spy = jest.spyOn(eventEntryService, 'save');
      await service.applyTemplate(testCase.targetDate, templateId);
      expect(spy).toHaveBeenCalledTimes(testCase.expectSaveCount);
      const savedEvents = spy.mock.calls.map((call) => call[0]);
      const expected = expect.arrayContaining(
        testCase.expectSaved
          .map(
            (event): Partial<EventEntry> => ({
              userId: event.userId,
              start: expect.objectContaining({ dateTime: event.start.dateTime }),
              end: expect.objectContaining({ dateTime: event.end.dateTime }),
              summary: event.summary,
              description: event.description,
              projectId: event.projectId,
              categoryId: event.categoryId,
              labelIds: event.labelIds,
              taskId: event.taskId,
            })
          )
          .map(expect.objectContaining)
      );
      expect(savedEvents).toEqual(expected);

      // テストケースに依存しないプロパティ
      for (const event of savedEvents) {
        expect(event.eventType).toBe(EVENT_TYPE.PLAN);
        expect(event.isProvisional).toBe(false);
        expect(event.externalEventEntryId == null).toBe(true);
        expect(event.deleted == null).toBe(true);
      }
    });
  });
});
