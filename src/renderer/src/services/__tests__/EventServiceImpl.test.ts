import { ScheduleEventProxyMockBuilder } from './__mocks__/ScheduleEventProxyMockBuilder';
import { ScheduleEventFixture } from '@shared/dto/__tests__/ScheduleEventFixture';
import { IScheduleEventProxy } from '../IScheduleEventProxy';
import { IEventService } from '../IEventService';
import { EVENT_TYPE } from '@shared/dto/ScheduleEvent';
import { EventServiceImpl } from '../EventServiceImpl';

describe('EventServiceImpl', () => {
  let eventService: IEventService;
  let scheduleEventProxy: IScheduleEventProxy;

  beforeEach(() => {
    jest.resetAllMocks();
    scheduleEventProxy = new ScheduleEventProxyMockBuilder().build();
    eventService = new EventServiceImpl(scheduleEventProxy);
  });

  describe('fetchEvents', () => {
    describe('モックの呼び出し時のパラメータをテスト', () => {
      /*
       * 他のテストと一緒にテストできるが、ここでテストしておくことで、
       * 他のテストでは、メソッドのパラメターとモックのパラメータとの整合を考える必要がなくなるので
       * モックの呼び出し時のパラメータのテストは、それだけで実施しておく
       */
      it('scheduleEventProxy.list', async () => {
        const startDate = new Date('2023-07-01T10:00:00+0900');
        const endDate = new Date('2023-07-01T10:30:00+0900');
        await eventService.fetchEvents(startDate, endDate);
        expect(scheduleEventProxy.list).toHaveBeenCalledWith(startDate, endDate);
      });
    });

    describe('戻り値 ScheduleEventFixture の単純な項目のテスト', () => {
      /*
       * 例えば検索されたデータを単純にコピーしただけのような単純なデータのテストを、
       * まとめてテストする。
       * ロジックが関係して条件によって、値が変化するようなテストは、別途実施する。
       */
      const startDate = new Date('2023-07-01T10:00:00+0900');
      const endDate = new Date('2023-07-01T10:30:00+0900');
      const testData = [
        {
          description: 'ScheduleEvent から作成されたときの変換のテスト',
          scheduleEvents: [
            ScheduleEventFixture.default({
              id: 'a1',
              eventType: EVENT_TYPE.PLAN,
              summary: 'summary',
              start: startDate,
              end: endDate,
            }),
          ],
          activities: [],
          expected: ScheduleEventFixture.default({
            id: 'a1',
            eventType: EVENT_TYPE.PLAN,
            summary: 'summary',
            start: startDate,
            end: endDate,
          }),
        },
      ];
      it.each(testData)('%s', async (testData) => {
        jest.spyOn(scheduleEventProxy, 'list').mockResolvedValueOnce(testData.scheduleEvents);

        const dummy = new Date();
        const events = await eventService.fetchEvents(dummy, dummy);
        expect(events.length).toEqual(1);

        const actual = events[0];
        const expected = testData.expected;
        // 仕様変更時に関係のないところで、エラーが多発するので、DTOを丸ごと比較することはしない
        expect(actual.id).toEqual(expected.id);
        expect(actual.summary).toEqual(expected.summary);
        expect(actual.start).toEqual(expected.start);
        expect(actual.end).toEqual(expected.end);
        expect(actual.eventType).toEqual(expected.eventType);
      });
    });
  });
});
