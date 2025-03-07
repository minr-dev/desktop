import { EVENT_TYPE } from '@shared/data/EventEntry';
import { EventAnalysisAggregationServiceImpl } from '../EventAnalysisAggregationServiceImpl';
import { IEventAnalysisAggregationService } from '../IEventAnalysisAggregationService';
import { IEventEntrySearchService } from '../IEventEntrySearchService';
import { EventEntrySearchServiceMockBuilder } from './__mocks__/EventEntrySearchServiceMockBuilder';
import { EventEntrySearchFixture } from '@main/dto/__tests__/EventEntrySearchFixture';
import { EventDateTimeFixture } from '@shared/data/__tests__/EventEntryFixture';
import { EventAggregationTimeFixture } from '@shared/data/__tests__/EventAggregationTimeFixture';

describe('EventAnalysisAggregationServiceImpl', () => {
  let service: IEventAnalysisAggregationService;
  let eventEntrySearchService: IEventEntrySearchService;

  beforeEach(() => {
    jest.resetAllMocks();
    eventEntrySearchService = new EventEntrySearchServiceMockBuilder().build();
    service = new EventAnalysisAggregationServiceImpl(eventEntrySearchService);
  });

  describe('引数が各サービスメソッドに入力されているかのテスト。', () => {
    const start = new Date('2024-12-30T10:00:00+0900');
    const end = new Date('2024-12-30T10:00:00+0900');
    const eventType = EVENT_TYPE.PLAN;

    const testCase = [
      {
        start: start,
        end: end,
        eventType: eventType,
        expected: {
          start: start,
          end: end,
          eventType: eventType,
        },
      },
    ];
    it.each(testCase)('%s', async (t) => {
      jest.spyOn(eventEntrySearchService, 'searchLabelAssociatedEvent').mockResolvedValue([]);

      await service.aggregateLabel(t.start, t.end, t.eventType);

      expect(eventEntrySearchService.searchLabelAssociatedEvent).toHaveBeenCalledWith(
        t.expected.start,
        t.expected.end,
        t.expected.eventType
      );
    });
  });

  describe('EventEntrySearchに設定されているラベル毎に業務時間を集計しているかのテスト。', () => {
    const start = new Date('2024-12-30T10:00:00+0900');
    const end = new Date('2024-12-31T10:00:00+0900');
    const eventType = EVENT_TYPE.PLAN;

    const testCase = [
      {
        resultEventEntrySearch: [
          EventEntrySearchFixture.default({
            start: EventDateTimeFixture.default({ dateTime: new Date('2024-12-30T10:00:00+0900') }),
            end: EventDateTimeFixture.default({ dateTime: new Date('2024-12-30T11:00:00+0900') }),
            labelNames: ['test1'],
          }),
          EventEntrySearchFixture.default({
            start: EventDateTimeFixture.default({ dateTime: new Date('2024-12-30T10:00:00+0900') }),
            end: EventDateTimeFixture.default({ dateTime: new Date('2024-12-30T11:00:00+0900') }),
            labelNames: ['test1', 'test2'],
          }),
          EventEntrySearchFixture.default({
            start: EventDateTimeFixture.default({ dateTime: new Date('2024-12-30T10:00:00+0900') }),
            end: EventDateTimeFixture.default({ dateTime: new Date('2024-12-30T11:00:00+0900') }),
            labelNames: ['test1', 'test2', 'test3'],
          }),
        ],
        expected: [
          EventAggregationTimeFixture.default({
            name: 'test1',
            aggregationTime: 60 * 60 * 1000 * 3,
          }),
          EventAggregationTimeFixture.default({
            name: 'test2',
            aggregationTime: 60 * 60 * 1000 * 2,
          }),
          EventAggregationTimeFixture.default({
            name: 'test3',
            aggregationTime: 60 * 60 * 1000,
          }),
        ],
      },
    ];
    it.each(testCase)('%s', async (t) => {
      jest
        .spyOn(eventEntrySearchService, 'searchLabelAssociatedEvent')
        .mockResolvedValue(t.resultEventEntrySearch);

      const businessClassificationUsage = await service.aggregateLabel(start, end, eventType);

      expect(businessClassificationUsage.length).toEqual(t.expected.length);
      expect(businessClassificationUsage).toEqual(
        t.expected.map((e) => expect.objectContaining(e))
      );
    });
  });
});
