import { EventEntryFixture } from '@shared/data/__tests__/EventEntryFixture';
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
    describe('引数を元に関数内の各サービスメソッドに入力が割り当てられているかのテスト。', () => {
      const testCase = [
        {
          start: new Date('2024-12-01T09:00:00+0900'),
          end: new Date('2024-12-01T10:00:00+0900'),
          eventEntries: [EventEntryFixture.default()],
          patterns: [PlanPatternFixture.default()],
          expected: {
            start: new Date('2024-12-01T09:00:00+0900'),
            end: new Date('2024-12-01T10:00:00+0900'),
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(t.eventEntries);
        jest
          .spyOn(planPatternService, 'list')
          .mockResolvedValue(new Page<PlanPattern>(t.patterns, t.patterns.length, PAGEABLE));
        await service.generatePredictedActual(t.start, t.end);
        expect(eventEntryService.list).toHaveBeenCalledWith(
          userId,
          t.expected.start,
          t.expected.end
        );
        expect(planPatternService.list).toHaveBeenCalledWith(PAGEABLE);
      });
    });
  });
});
