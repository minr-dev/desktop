import { EventDateTimeFixture, EventEntryFixture } from '@shared/data/__tests__/EventEntryFixture';
import { ActualPredictiveCreationFromPlanServiceImpl } from '../ActualPredictiveCreationFromPlanServiceImpl';
import { IActualPredictiveCreationFromPlanService } from '../IActualPredictiveCreationFromPlanService';
import { IEventEntryService } from '../IEventEntryService';
import { IPlanPatternService } from '../IPlanPatternService';
import { IUserDetailsService } from '../IUserDetailsService';
import { EventEntryServiceMockBuilder } from './__mocks__/EventEntryServiceMockBuilder';
import { PlanPatternServiceMockBuilder } from './__mocks__/PlanPatternServiceMockBuilder';
import { UserDetailsServiceMockBuilder } from './__mocks__/UserDetailsServiceMockBuilder';
import { Page, Pageable } from '@shared/data/Page';
import { PlanPattern } from '@shared/data/PlanPattern';
import { PlanPatternFixture } from '@shared/data/__tests__/PlanPatternFixture';
import { EVENT_TYPE } from '@shared/data/EventEntry';

describe('ActualPredictiveCreationFromPlanServiceImpl', () => {
  let service: IActualPredictiveCreationFromPlanService;
  let userDetailsService: IUserDetailsService;
  let eventEntryService: IEventEntryService;
  let planPatternService: IPlanPatternService;
  const userId = 'test user';
  const PAGEABLE = new Pageable(0, Number.MAX_SAFE_INTEGER);

  beforeEach(() => {
    jest.resetAllMocks();
    userDetailsService = new UserDetailsServiceMockBuilder().withGetUserId(userId).build();
    eventEntryService = new EventEntryServiceMockBuilder().build();
    planPatternService = new PlanPatternServiceMockBuilder().build();
    service = new ActualPredictiveCreationFromPlanServiceImpl(
      userDetailsService,
      eventEntryService,
      planPatternService
    );
  });

  describe('generatePredictedActual', () => {
    describe('返り値のテスト', () => {
      const baseCase = {
        start: new Date('2024-12-01T09:00:00+0900'),
        end: new Date('2024-12-01T10:00:00+0900'),
        eventEntries: [],
        patterns: [],
        expected: {
          provisionalActuals: [],
        },
      };
      const testCases = [
        {
          description: 'マスタにパターンがない場合は空配列を出力する',
          ...baseCase,
          patterns: [],
          expected: {
            provisionalActuals: [],
          },
        },
        {
          description: '引数で設定した期間に予定がない場合は空配列を出力する',
          ...baseCase,
          start: new Date('2024-12-01T09:00:00+0900'),
          end: new Date('2024-12-01T10:00:00+0900'),
          patterns: [PlanPatternFixture.default()],
          eventEntries: [],
          expected: {
            start: new Date('2024-12-01T09:00:00+0900'),
            end: new Date('2024-12-01T10:00:00+0900'),
            provisionalActuals: [],
          },
        },
        {
          description: 'パターンにマッチする予定がない場合は空配列を出力する',
          ...baseCase,
          patterns: [
            PlanPatternFixture.default({
              regularExpression: '\\btest\\b',
            }),
          ],
          eventEntries: [
            EventEntryFixture.default({
              userId: userId,
              eventType: EVENT_TYPE.PLAN,
              summary: 'bummy',
              isProvisional: false,
            }),
          ],
          expected: {
            provisionalActuals: [],
          },
        },
        {
          description:
            '予定がパターンの正規表現、カテゴリ、ラベルにマッチしたとき、仮実績を出力する',
          ...baseCase,
          patterns: [
            PlanPatternFixture.default({
              regularExpression: '\\btest\\b',
              categoryId: '1',
              labelIds: ['2', '3'],
            }),
          ],
          eventEntries: [
            EventEntryFixture.default({
              userId: userId,
              eventType: EVENT_TYPE.PLAN,
              summary: 'test',
              isProvisional: false,
              categoryId: '1',
              labelIds: ['2', '3'],
            }),
          ],
          expected: {
            provisionalActuals: [
              EventEntryFixture.default({
                userId: userId,
                eventType: EVENT_TYPE.ACTUAL,
                summary: 'test',
                isProvisional: true,
                categoryId: '1',
                labelIds: ['2', '3'],
              }),
            ],
          },
        },
        {
          description:
            'パターンにマッチした複数の予定の期間が重複する場合、開始日時が早い予定を優先して仮実績を出力する',
          ...baseCase,
          patterns: [
            PlanPatternFixture.default({
              regularExpression: '\\btest\\b',
            }),
          ],
          eventEntries: [
            EventEntryFixture.default({
              userId: userId,
              eventType: EVENT_TYPE.PLAN,
              summary: 'test',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2024-12-01T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2024-12-01T12:00:00+0900'),
              }),
              isProvisional: false,
            }),
            EventEntryFixture.default({
              userId: userId,
              eventType: EVENT_TYPE.PLAN,
              summary: 'test',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2024-12-01T11:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2024-12-01T13:00:00+0900'),
              }),
              isProvisional: false,
            }),
          ],
          expected: {
            provisionalActuals: [
              EventEntryFixture.default({
                userId: userId,
                eventType: EVENT_TYPE.ACTUAL,
                summary: 'test',
                start: EventDateTimeFixture.default({
                  dateTime: new Date('2024-12-01T10:00:00+0900'),
                }),
                end: EventDateTimeFixture.default({
                  dateTime: new Date('2024-12-01T12:00:00+0900'),
                }),
                isProvisional: true,
              }),
              EventEntryFixture.default({
                userId: userId,
                eventType: EVENT_TYPE.ACTUAL,
                summary: 'test',
                start: EventDateTimeFixture.default({
                  dateTime: new Date('2024-12-01T12:00:00+0900'),
                }),
                end: EventDateTimeFixture.default({
                  dateTime: new Date('2024-12-01T13:00:00+0900'),
                }),
                isProvisional: true,
              }),
            ],
          },
        },
        {
          description:
            'パターンにマッチした複数の予定の開始日時が一致する場合、更新日時が遅い予定を優先して仮実績を出力する',
          ...baseCase,
          patterns: [
            PlanPatternFixture.default({
              regularExpression: '\\btest\\b',
            }),
          ],
          eventEntries: [
            EventEntryFixture.default({
              userId: userId,
              eventType: EVENT_TYPE.PLAN,
              summary: 'test',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2024-12-01T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2024-12-01T12:00:00+0900'),
              }),
              isProvisional: false,
              updated: new Date('2024-12-01T02:00:00+0900'),
            }),
            EventEntryFixture.default({
              userId: userId,
              eventType: EVENT_TYPE.PLAN,
              summary: 'test',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2024-12-01T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2024-12-01T13:00:00+0900'),
              }),
              isProvisional: false,
              updated: new Date('2024-12-01T01:00:00+0900'),
            }),
          ],
          expected: {
            provisionalActuals: [
              EventEntryFixture.default({
                userId: userId,
                eventType: EVENT_TYPE.ACTUAL,
                summary: 'test',
                start: EventDateTimeFixture.default({
                  dateTime: new Date('2024-12-01T10:00:00+0900'),
                }),
                end: EventDateTimeFixture.default({
                  dateTime: new Date('2024-12-01T13:00:00+0900'),
                }),
                isProvisional: true,
              }),
            ],
          },
        },
        {
          description: '既に仮実績が登録されている場合、その期間の仮実績は出力しない',
          ...baseCase,
          patterns: [
            PlanPatternFixture.default({
              regularExpression: '\\btest\\b',
            }),
          ],
          eventEntries: [
            EventEntryFixture.default({
              userId: userId,
              eventType: EVENT_TYPE.PLAN,
              summary: 'test',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2024-12-01T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2024-12-01T12:00:00+0900'),
              }),
              isProvisional: false,
            }),
            EventEntryFixture.default({
              userId: userId,
              eventType: EVENT_TYPE.ACTUAL,
              summary: 'bummy',
              start: EventDateTimeFixture.default({
                dateTime: new Date('2024-12-01T10:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({
                dateTime: new Date('2024-12-01T12:00:00+0900'),
              }),
              isProvisional: true,
            }),
          ],
          expected: {
            provisionalActuals: [],
          },
        },
      ];

      it.each(testCases)('%s', async (testCase) => {
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(testCase.eventEntries);
        jest
          .spyOn(planPatternService, 'list')
          .mockResolvedValue(
            new Page<PlanPattern>(testCase.patterns, testCase.patterns.length, PAGEABLE)
          );
        const provisionalActuals = await service.generatePredictedActual(
          testCase.start,
          testCase.end
        );

        expect(planPatternService.list).toHaveBeenCalledWith(PAGEABLE);
        if (testCase.expected.start && testCase.expected.end) {
          expect(eventEntryService.list).toHaveBeenCalledWith(
            userId,
            testCase.expected.start,
            testCase.expected.end
          );
        }
        expect(provisionalActuals).toHaveLength(testCase.expected.provisionalActuals.length);
        for (let i = 0; i < testCase.expected.provisionalActuals.length; i++) {
          expect(provisionalActuals[i].userId).toEqual(
            testCase.expected.provisionalActuals[i].userId
          );
          expect(provisionalActuals[i].eventType).toEqual(
            testCase.expected.provisionalActuals[i].eventType
          );
          expect(provisionalActuals[i].summary).toEqual(
            testCase.expected.provisionalActuals[i].summary
          );
          expect(provisionalActuals[i].start).toEqual(
            testCase.expected.provisionalActuals[i].start
          );
          expect(provisionalActuals[i].end).toEqual(testCase.expected.provisionalActuals[i].end);
          expect(provisionalActuals[i].isProvisional).toEqual(
            testCase.expected.provisionalActuals[i].isProvisional
          );
          expect(provisionalActuals[i].categoryId).toEqual(
            testCase.expected.provisionalActuals[i].categoryId
          );
          expect(provisionalActuals[i].labelIds).toEqual(
            testCase.expected.provisionalActuals[i].labelIds
          );
        }
      });
    });
  });
});
