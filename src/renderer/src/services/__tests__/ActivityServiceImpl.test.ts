import { ActiveWindowLogProxyMockBuilder } from './__mocks__/ActiveWindowLogProxyMockBuilder';
import { ActiveWindowLogFixture } from '@shared/dto/__tests__/ActiveWindowLogFixture';
import { IActivityService } from '../IActivityService';
import {
  ActivityDetailFixture,
  ActivityEventFixture,
} from '@shared/dto/__tests__/ActivityEventFixture';
import { IActiveWindowLogProxy } from '../IActiveWindowLogProxy';
import { ActivityServiceImpl } from '../ActivityServiceImpl';

describe('ActivityServiceImpl', () => {
  let service: IActivityService;
  let activeWindowLogProxy: IActiveWindowLogProxy;

  beforeEach(() => {
    jest.resetAllMocks();
    activeWindowLogProxy = new ActiveWindowLogProxyMockBuilder().build();
    service = new ActivityServiceImpl(activeWindowLogProxy);
  });

  describe('fetchActivities', () => {
    describe('モックの呼び出し時のパラメータをテスト', () => {
      /*
       * 他のテストと一緒にテストできるが、ここでテストしておくことで、
       * 他のテストでは、メソッドのパラメターとモックのパラメータとの整合を考える必要がなくなるので
       * モックの呼び出し時のパラメータのテストは、それだけで実施しておく
       */
      it('activityService.list', async () => {
        const startDate = new Date('2023-07-01T10:00:00+0900');
        const endDate = new Date('2023-07-01T10:30:00+0900');
        await service.fetchActivities(startDate, endDate);
        expect(activeWindowLogProxy.list).toHaveBeenCalledWith(startDate, endDate);
      });
    });

    describe('戻り値 ProcessedEvent の単純な項目のテスト', () => {
      /*
       * 例えば検索されたデータを単純にコピーしただけのような単純なデータのテストを、
       * まとめてテストする。
       * ロジックが関係して条件によって、値が変化するようなテストは、別途実施する。
       */
      const startDate = new Date('2023-07-01T10:00:00+0900');
      const endDate = new Date('2023-07-01T10:30:00+0900');
      const testData = [
        {
          description: 'ActiveWindowLog から作成されたときの変換のテスト',
          winlogs: [
            ActiveWindowLogFixture.default({
              id: 'a1',
              basename: 'test.exe',
              windowTitle: 'test title',
              activated: startDate,
              deactivated: endDate,
            }),
          ],
          expected: ActivityEventFixture.default({
            id: 'a1',
            basename: 'test.exe',
            start: startDate,
            end: endDate,
            details: [
              ActivityDetailFixture.default({
                id: 'a1',
                windowTitle: 'test title',
                start: startDate,
                end: endDate,
              }),
            ],
          }),
        },
      ];
      it.each(testData)('%s', async (testData) => {
        jest.spyOn(activeWindowLogProxy, 'list').mockResolvedValueOnce(testData.winlogs);

        const dummy = new Date();
        const events = await service.fetchActivities(dummy, dummy);
        expect(events.length).toEqual(1);

        const actual = events[0];
        const expected = testData.expected;
        // 仕様変更時に関係のないところで、エラーが多発するので、DTOを丸ごと比較することはしない
        expect(actual.id).toEqual(expected.id);
        expect(actual.basename).toEqual(expected.basename);
        expect(actual.start).toEqual(expected.start);
        expect(actual.end).toEqual(expected.end);
        expect(actual.details.length).toEqual(expected.details.length);
        const actualDetail = actual.details[0];
        const expectedDetail = expected.details[0];
        expect(actualDetail.id).toEqual(expectedDetail.id);
        expect(actualDetail.windowTitle).toEqual(expectedDetail.windowTitle);
        expect(actualDetail.start).toEqual(expectedDetail.start);
        expect(actualDetail.end).toEqual(expectedDetail.end);
      });
    });

    describe('集約処理', () => {
      const testCases = [
        {
          description: '同じbasenameを持つActiveWindowLogは一つのProcessedEventにまとめられる',
          winlogs: [
            ActiveWindowLogFixture.default({
              id: '1',
              basename: 'test.exe',
              windowTitle: 'title1',
              activated: new Date('2023-07-01T10:30:00+0900'),
              deactivated: new Date('2023-07-01T11:00:00+0900'),
            }),
            ActiveWindowLogFixture.default({
              id: '2',
              basename: 'test.exe',
              windowTitle: 'title2',
              activated: new Date('2023-07-01T11:00:00+0900'),
              deactivated: new Date('2023-07-01T11:40:00+0900'),
            }),
          ],
          expected: [
            ActivityEventFixture.default({
              id: '1',
              basename: 'test.exe',
              start: new Date('2023-07-01T10:30:00+0900'),
              end: new Date('2023-07-01T11:40:00+0900'),
              details: [
                ActivityDetailFixture.default({
                  windowTitle: 'title1',
                }),
                ActivityDetailFixture.default({
                  windowTitle: 'title2',
                }),
              ],
            }),
          ],
        },
        {
          description: '異なるbasenameを持つActiveWindowLogは別々のProcessedEventになる',
          winlogs: [
            ActiveWindowLogFixture.default({
              id: '1',
              basename: 'test.exe',
              windowTitle: 'title1',
              activated: new Date('2023-07-01T10:30:00+0900'),
              deactivated: new Date('2023-07-01T11:00:00+0900'),
            }),
            ActiveWindowLogFixture.default({
              id: '2',
              basename: 'test2.exe',
              windowTitle: 'title2',
              activated: new Date('2023-07-01T11:00:00+0900'),
              deactivated: new Date('2023-07-01T11:40:00+0900'),
            }),
          ],
          expected: [
            ActivityEventFixture.default({
              id: '1',
              basename: 'test.exe',
              start: new Date('2023-07-01T10:30:00+0900'),
              end: new Date('2023-07-01T11:00:00+0900'),
              details: [
                ActivityDetailFixture.default({
                  windowTitle: 'title1',
                }),
              ],
            }),
            ActivityEventFixture.default({
              id: '2',
              basename: 'test2.exe',
              start: new Date('2023-07-01T11:00:00+0900'),
              end: new Date('2023-07-01T11:40:00+0900'),
              details: [
                ActivityDetailFixture.default({
                  windowTitle: 'title2',
                }),
              ],
            }),
          ],
        },
      ];

      it.each(testCases)('%s', async (testCase) => {
        jest.spyOn(activeWindowLogProxy, 'list').mockResolvedValueOnce(testCase.winlogs);

        const dummy = new Date();
        if (
          testCase.description === '異なるbasenameを持つActiveWindowLogは別々のProcessedEventになる'
        ) {
          console.log(testCase.description);
        }
        const events = await service.fetchActivities(dummy, dummy);
        expect(events.length).toEqual(testCase.expected.length);

        for (let i = 0; i < testCase.expected.length; i++) {
          // 仕様変更時に関係のないところで、エラーが多発するので、DTOを丸ごと比較することはしない
          const actual = events[i];
          const expected = testCase.expected[i];
          expect(actual.id).toEqual(expected.id);
          expect(actual.basename).toEqual(expected.basename);
          expect(actual.start).toEqual(expected.start);
          expect(actual.end).toEqual(expected.end);
          expect(actual.details.length).toEqual(expected.details.length);
          for (let j = 0; j < expected.details.length; j++) {
            const actualDetail = actual.details[j];
            const expectedDetail = expected.details[j];
            expect(actualDetail.windowTitle).toEqual(expectedDetail.windowTitle);
          }
        }
      });
    });
  });
});
