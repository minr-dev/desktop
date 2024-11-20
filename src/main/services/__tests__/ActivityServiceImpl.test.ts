import { WindowLogServiceMockBuilder } from './__mocks__/WindowLogServiceMockBuilder';
import { WindowLogFixture } from '@shared/data/__tests__/WindowLogFixture';
import { ActivityColorFixture } from '@shared/data/__tests__/ActivityColorFixture';
import {
  ActivityDetailFixture,
  ActivityEventFixture,
} from '@shared/data/__tests__/ActivityEventFixture';
import { IActivityService } from '../IActivityService';
import { ActivityServiceImpl } from '../ActivityServiceImpl';
import { IWindowLogService } from '../IWindowLogService';
import { SYSTEM_IDLE_PID } from '@shared/data/WindowLog';
import { ActivityColorServiceMockBuilder } from './__mocks__/ActivityColorServiceMockBuilder';
import { IActivityColorService } from '../IActivityColorService';

describe('ActivityServiceImpl', () => {
  let service: IActivityService;
  let windowLogService: IWindowLogService;
  let activityColorService: IActivityColorService;

  beforeEach(() => {
    jest.resetAllMocks();
    windowLogService = new WindowLogServiceMockBuilder().build();
    activityColorService = new ActivityColorServiceMockBuilder()
      .withGet(
        ActivityColorFixture.default({
          appColor: '#888888',
        })
      )
      .build();
    service = new ActivityServiceImpl(windowLogService, activityColorService);
  });

  describe('createActivityEvent', () => {
    describe('戻り値 ActivityEvent の項目のテスト', () => {
      const startDate = new Date('2023-07-01T10:00:00+0900');
      const endDate = new Date('2023-07-01T10:30:00+0900');
      const testData = [
        {
          description: 'WindowLog からの変換テスト',
          winlog: WindowLogFixture.default({
            id: 'a1',
            basename: 'test.exe',
            windowTitle: 'test title',
            activated: startDate,
            deactivated: endDate,
          }),
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
            appColor: '#888888',
          }),
        },
      ];
      it.each(testData)('%s', async (testData) => {
        const actual = await service.createActivityEvent(testData.winlog);
        const expected = testData.expected;
        // 仕様変更時に関係のないところで、エラーが多発するので、DTOを丸ごと比較することはしない
        expect(actual.id).toEqual(expected.id);
        expect(actual.basename).toEqual(expected.basename);
        expect(actual.start).toEqual(expected.start);
        expect(actual.end).toEqual(expected.end);
        expect(actual.appColor).toEqual(expected.appColor);
        expect(actual.details.length).toEqual(expected.details.length);
        const actualDetail = actual.details[0];
        const expectedDetail = expected.details[0];
        expect(actualDetail.id).toEqual(expectedDetail.id);
        expect(actualDetail.windowTitle).toEqual(expectedDetail.windowTitle);
        expect(actualDetail.start).toEqual(expectedDetail.start);
        expect(actualDetail.end).toEqual(expectedDetail.end);
      });
    });
  });

  describe('updateActivityEvent', () => {
    describe('更新有無と、ActivityEvent の中身の更新のテスト', () => {
      const startDate = new Date('2023-07-01T10:00:00+0900');
      const endDate = new Date('2023-07-01T10:30:00+0900');
      const activityEvent1 = ActivityEventFixture.default({
        id: '1',
        basename: 'test.exe',
        start: startDate,
        end: endDate,
        details: [
          ActivityDetailFixture.default({
            id: '1',
            windowTitle: 'test title',
            start: startDate,
            end: endDate,
          }),
        ],
      });
      const testData = [
        {
          description: '異なるbasenameを持つWindowLogでは更新されない',
          activityEvent: activityEvent1,
          winlog: WindowLogFixture.default({
            id: '2',
            basename: 'test2.exe',
            windowTitle: 'title2',
            activated: new Date('2023-07-01T11:00:00+0900'),
            deactivated: new Date('2023-07-01T11:40:00+0900'),
          }),
          expected: {
            result: false,
            updatedActivityEvent: activityEvent1,
          },
        },
        {
          description: '同じbasenameを持つWindowLogは更新されて、details に追加される',
          activityEvent: activityEvent1,
          winlog: WindowLogFixture.default({
            id: '2',
            basename: 'test.exe',
            windowTitle: 'title2',
            activated: new Date('2023-07-01T11:00:00+0900'),
            deactivated: new Date('2023-07-01T11:40:00+0900'),
          }),
          expected: {
            result: true,
            updatedActivityEvent: {
              id: '1',
              basename: 'test.exe',
              start: startDate,
              end: new Date('2023-07-01T11:40:00+0900'),
              details: [
                ActivityDetailFixture.default({
                  id: '1',
                  windowTitle: 'test title',
                  start: startDate,
                  end: endDate,
                }),
                ActivityDetailFixture.default({
                  id: '2',
                  windowTitle: 'title2',
                  start: new Date('2023-07-01T11:00:00+0900'),
                  end: new Date('2023-07-01T11:40:00+0900'),
                }),
              ],
            },
          },
        },
      ];
      it.each(testData)('%s', async (testData) => {
        const result = await service.updateActivityEvent(testData.activityEvent, testData.winlog);
        expect(result).toEqual(testData.expected.result);
        // 仕様変更時に関係のないところで、エラーが多発するので、DTOを丸ごと比較することはしない
        const expected = testData.expected.updatedActivityEvent;
        const actual = testData.activityEvent;
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
  });

  describe('fetchActivities', () => {
    describe('モックの呼び出し時のパラメータをテスト', () => {
      /*
       * 他のテストと一緒にテストできるが、ここでテストしておくことで、
       * 他のテストでは、メソッドのパラメターとモックのパラメータとの整合を考える必要がなくなるので
       * モックの呼び出し時のパラメータのテストは、それだけで実施しておく
       */
      it('windowLogService.list', async () => {
        const startDate = new Date('2023-07-01T10:00:00+0900');
        const endDate = new Date('2023-07-01T10:30:00+0900');
        await service.fetchActivities(startDate, endDate);
        expect(windowLogService.list).toHaveBeenCalledWith(startDate, endDate);
      });
    });

    describe('集約処理', () => {
      const testCases = [
        {
          description: '同じbasenameを持つWindowLogは一つのActivityEventにまとめられる',
          winlogs: [
            WindowLogFixture.default({
              id: '1',
              basename: 'test.exe',
              windowTitle: 'title1',
            }),
            WindowLogFixture.default({
              id: '2',
              basename: 'test.exe',
              windowTitle: 'title2',
            }),
          ],
          expected: [
            ActivityEventFixture.default({
              id: '1',
              basename: 'test.exe',
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
          description: '異なるbasenameを持つWindowLogは別々のActivityEventになる',
          winlogs: [
            WindowLogFixture.default({
              id: '1',
              basename: 'test.exe',
              windowTitle: 'title1',
            }),
            WindowLogFixture.default({
              id: '2',
              basename: 'test2.exe',
              windowTitle: 'title2',
            }),
          ],
          expected: [
            ActivityEventFixture.default({
              id: '1',
              basename: 'test.exe',
              details: [
                ActivityDetailFixture.default({
                  windowTitle: 'title1',
                }),
              ],
            }),
            ActivityEventFixture.default({
              id: '2',
              basename: 'test2.exe',
              details: [
                ActivityDetailFixture.default({
                  windowTitle: 'title2',
                }),
              ],
            }),
          ],
        },
        {
          description: 'アイドル状態のWindowLogはアクティビティに含めない',
          winlogs: [
            WindowLogFixture.default({
              id: '1',
              basename: 'test.exe',
              windowTitle: 'title1',
            }),
            WindowLogFixture.default({
              id: '2',
              basename: 'test.exe',
              windowTitle: 'title2',
              pid: SYSTEM_IDLE_PID,
            }),
            WindowLogFixture.default({
              id: '3',
              basename: 'test.exe',
              windowTitle: 'title3',
            }),
          ],
          expected: [
            // id=1 と id=3 の basename が同じなので、pid = SYSTEM_IDLE_PID をスキップ
            // するだけでは、 1 と 3 が連続したアクティビティにまとめられてしまうので、
            // 1 と 3 が別々のアクティビティになることを確認する
            ActivityEventFixture.default({
              id: '1',
              basename: 'test.exe',
              details: [
                ActivityDetailFixture.default({
                  windowTitle: 'title1',
                }),
              ],
            }),
            ActivityEventFixture.default({
              id: '3',
              basename: 'test.exe',
              details: [
                ActivityDetailFixture.default({
                  windowTitle: 'title3',
                }),
              ],
            }),
          ],
        },
      ];

      it.each(testCases)('%s', async (testCase) => {
        jest.spyOn(windowLogService, 'list').mockResolvedValueOnce(testCase.winlogs);

        const dummy = new Date();
        const events = await service.fetchActivities(dummy, dummy);
        expect(events.length).toEqual(testCase.expected.length);

        for (let i = 0; i < testCase.expected.length; i++) {
          // 仕様変更時に関係のないところで、エラーが多発するので、DTOを丸ごと比較することはしない
          const actual = events[i];
          const expected = testCase.expected[i];
          expect(actual.id).toEqual(expected.id);
          expect(actual.basename).toEqual(expected.basename);
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
