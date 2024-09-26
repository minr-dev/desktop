import { IUserDetailsService } from '../IUserDetailsService';
import { UserDetailsServiceMockBuilder } from './__mocks__/UserDetailsServiceMockBuilder';
import { EventDateTimeFixture, EventEntryFixture } from '@shared/data/__tests__/EventEntryFixture';
import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { IEventEntryService } from '../IEventEntryService';
import { EventEntryServiceMockBuilder } from './__mocks__/EventEntryServiceMockBuilder';
import { ActualAutoRegistrationFinalizerServiceImpl } from '../ActualAutoRegistrationFinalizerServiceImpl';
import { IActualAutoRegistrationFinalizerService } from '../IActualAutoRegistrationFinalizerService';

describe('ActualAutoRegistrationFinalizerService', () => {
  let service: IActualAutoRegistrationFinalizerService;
  let userDetailsService: IUserDetailsService;
  let eventEntryService: IEventEntryService;
  const userId = 'test user';

  beforeEach(() => {
    jest.resetAllMocks();
    userDetailsService = new UserDetailsServiceMockBuilder().withGetUserId(userId).build();
    eventEntryService = new EventEntryServiceMockBuilder().build();
    service = new ActualAutoRegistrationFinalizerServiceImpl(userDetailsService, eventEntryService);
  });

  describe('finarizeRegistration', () => {
    const testCases = [
      {
        description: '保存されるデータのチェック',
        eventEntries: [
          EventEntryFixture.default({
            userId: userId,
            eventType: EVENT_TYPE.PLAN,
            summary: 'Implementation 1',
            start: EventDateTimeFixture.default({
              dateTime: new Date('2023-07-01T09:00:00+0900'),
            }),
            end: EventDateTimeFixture.default({
              dateTime: new Date('2023-07-01T09:30:00+0900'),
            }),
            isProvisional: true,
            projectId: 'pr1',
            categoryId: null,
            labelIds: null,
            taskId: null,
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
            summary: 'Implementation 1',
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
      jest.spyOn(eventEntryService, 'list').mockResolvedValue(testCase.eventEntries);
      const saveSpy = jest.spyOn(eventEntryService, 'save');

      await service.finalizeRegistration(testCase.mergedActuals);

      // expectedから、比較すべきところだけ抽出
      const expectedArray = testCase.expected.map(
        (expected): Partial<EventEntry> =>
          expect.objectContaining({
            userId: expected.userId,
            eventType: expected.eventType,
            summary: expected.summary,
            start: expect.objectContaining({ dateTime: expected.start.dateTime }),
            end: expect.objectContaining({ dateTime: expected.end.dateTime }),
            isProvisional: expected.isProvisional,
            projectId: expected.projectId,
            categoryId: expected.categoryId,
            labelIds: expected.labelIds,
            taskId: expected.taskId,
          })
      );

      expect(saveSpy).toBeCalledTimes(expectedArray.length);

      const savedActuals = saveSpy.mock.calls.map((call) => call[0]);
      expect(savedActuals).toEqual(expect.arrayContaining(expectedArray));
    });
  });
});
