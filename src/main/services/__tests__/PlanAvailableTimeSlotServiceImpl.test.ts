import { IEventEntryService } from '../IEventEntryService';
import { EventEntryServiceMockBuilder } from './__mocks__/EventEntryServiceMockBuilder';
import { EventDateTimeFixture, EventEntryFixture } from '@shared/data/__tests__/EventEntryFixture';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { IFreeTimeSlotService } from '../IFreeTimeSlotService';
import { PlanAvailableTimeSlotServiceImpl } from '../PlanAvailableTimeSlotService';
import { IUserDetailsService } from '../IUserDetailsService';
import { IUserPreferenceStoreService } from '../IUserPreferenceStoreService';
import { UserDetailsServiceMockBuilder } from './__mocks__/UserDetailsServiceMockBuilder';
import { UserPreferenceStoreServiceMockBuilder } from './__mocks__/UserPreferenceStoreServiceMockBuilder';
import { UserPreferenceFixture } from '@shared/data/__tests__/UserPreferenceFixture';

describe('PlanAvailableTimeSlotServiceImpl', () => {
  let service: IFreeTimeSlotService;
  let userDetailService: IUserDetailsService;
  let userPreferenceStoreService: IUserPreferenceStoreService;
  let eventEntryService: IEventEntryService;

  const userId = 'test user';

  beforeEach(() => {
    jest.resetAllMocks();
    userDetailService = new UserDetailsServiceMockBuilder().withGetUserId(userId).build();
    userPreferenceStoreService = new UserPreferenceStoreServiceMockBuilder().build();
    eventEntryService = new EventEntryServiceMockBuilder().build();
    service = new PlanAvailableTimeSlotServiceImpl(
      userDetailService,
      userPreferenceStoreService,
      eventEntryService
    );
  });

  describe('calculateFreeTimeSlot', () => {
    describe('モックの呼び出し時のパラメータをテスト', () => {
      it('eventEntryService.list', async () => {
        const userPreference = UserPreferenceFixture.default({
          userId: userId,
          dailyWorkStartTime: { hours: 10, minutes: 0 },
          dailyWorkHours: 8,
          dailyBreakTimeSlots: [
            { start: { hours: 12, minutes: 0 }, end: { hours: 13, minutes: 0 } },
          ],
        });
        jest.spyOn(userPreferenceStoreService, 'get').mockResolvedValue(userPreference);
        jest.spyOn(eventEntryService, 'list').mockResolvedValue([]);
        const targetDate = new Date('2023-07-03T10:00:00+0900');
        const start = new Date('2023-07-03T10:00:00+0900');
        const end = new Date('2023-07-03T19:00:00+0900');
        await service.calculateFreeTimeSlot(targetDate);
        expect(eventEntryService.list).toHaveBeenCalledWith(userId, start, end);
      });
    });

    describe('返り値のテスト', () => {
      const targetDate = new Date('2023-07-03T09:00:00+0900');
      const testCases = [
        {
          description: '予定が入っている場合',
          userPreference: UserPreferenceFixture.default({
            userId: userId,
            startHourLocal: 9,
            dailyWorkStartTime: { hours: 13, minutes: 0 },
            dailyWorkHours: 6,
          }),
          eventEntries: [
            EventEntryFixture.default({
              id: '1',
              eventType: EVENT_TYPE.PLAN,
              start: EventDateTimeFixture.default({
                dateTime: new Date('2023-07-03T15:00:00+0900'),
              }),
              end: EventDateTimeFixture.default({ dateTime: new Date('2023-07-03T16:00:00+0900') }),
            }),
          ],
          expected: [
            {
              start: new Date('2023-07-03T13:00:00+0900'),
              end: new Date('2023-07-03T15:00:00+0900'),
            },
            {
              start: new Date('2023-07-03T16:00:00+0900'),
              end: new Date('2023-07-03T19:00:00+0900'),
            },
          ],
        },
      ];

      it.each(testCases)('%s', async (testCase) => {
        jest.spyOn(userPreferenceStoreService, 'get').mockResolvedValue(testCase.userPreference);
        jest.spyOn(eventEntryService, 'list').mockResolvedValue(testCase.eventEntries);

        const timeSlots = await service.calculateFreeTimeSlot(targetDate);

        expect(timeSlots).toHaveLength(testCase.expected.length);
        expect(timeSlots).toEqual(expect.arrayContaining(testCase.expected));
      });
    });
  });
});
