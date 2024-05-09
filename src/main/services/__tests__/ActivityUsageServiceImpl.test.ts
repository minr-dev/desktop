import { ActivityEventFixture } from '@shared/data/__tests__/ActivityEventFixture';
import { IActivityService } from '../IActivityService';
import { ActivityServiceMockBuilder } from './__mocks__/ActivityServiceMockBuilder';
import { ActivityUsageServiceImpl } from '../ActicityUsageServiceImpl';
import { IActivityUsageService } from '../IActivityUsageService';
import { ActivityUsageFixture } from '@shared/data/__tests__/ActivityUsageFixture';

describe('ActivityServiceImpl', () => {
  let service: IActivityUsageService;
  let activityService: IActivityService;

  beforeEach(() => {
    jest.resetAllMocks();
    activityService = new ActivityServiceMockBuilder().build();
    service = new ActivityUsageServiceImpl(activityService);
  });

  describe('get', () => {
    describe('モックの呼び出し時のパラメータをテスト', () => {
      it('activityService.fetchActivities', async () => {
        const startDate = new Date('2023-07-01T10:00:00+0900');
        const endDate = new Date('2023-07-02T10:00:00+0900');
        await service.get(startDate, endDate);
        expect(activityService.fetchActivities).toHaveBeenCalledWith(startDate, endDate);
      });
    });

    describe('返り値のテスト', () => {
      const startDate = new Date('2023-07-01T10:00:00+0900');
      const endDate = new Date('2023-07-02T10:00:00+0900');
      const testCases = [
        {
          description: '開始時刻より前の時間は計算されない',
          activities: [
            ActivityEventFixture.default({
              id: 'a1',
              basename: 'test.exe',
              start: new Date('2023-07-01T09:30:00+0900'),
              end: new Date('2023-07-01T10:30:00+0900'),
              appColor: '#888888',
            }),
          ],
          expected: [
            ActivityUsageFixture.default({
              basename: 'test.exe',
              color: '#888888',
              usageTime: 30 * 60 * 1000,
            }),
          ],
        },
        {
          description: '終了時刻より後の時間は計算されない',
          activities: [
            ActivityEventFixture.default({
              id: 'a1',
              basename: 'test.exe',
              start: new Date('2023-07-02T09:30:00+0900'),
              end: new Date('2023-07-02T10:30:00+0900'),
              appColor: '#888888',
            }),
          ],
          expected: [
            ActivityUsageFixture.default({
              basename: 'test.exe',
              color: '#888888',
              usageTime: 30 * 60 * 1000,
            }),
          ],
        },
        {
          description: '同じbasenameを持つActivityは一つのActivityUsageにまとめられる',
          activities: [
            ActivityEventFixture.default({
              id: 'a1',
              basename: 'test.exe',
              start: new Date('2023-07-01T10:00:00+0900'),
              end: new Date('2023-07-01T10:30:00+0900'),
              appColor: '#888888',
            }),
            ActivityEventFixture.default({
              id: 'a2',
              basename: 'test.exe',
              start: new Date('2023-07-01T11:00:00+0900'),
              end: new Date('2023-07-01T11:30:00+0900'),
              appColor: '#888888',
            }),
          ],
          expected: [
            ActivityUsageFixture.default({
              basename: 'test.exe',
              color: '#888888',
              usageTime: 60 * 60 * 1000,
            }),
          ],
        },
        {
          description: '異なるbasenameを持つActivityは別々のActivityUsageにまとめられる',
          activities: [
            ActivityEventFixture.default({
              id: 'a1',
              basename: 'test.exe',
              start: new Date('2023-07-01T10:00:00+0900'),
              end: new Date('2023-07-01T10:30:00+0900'),
              appColor: '#888888',
            }),
            ActivityEventFixture.default({
              id: 'a2',
              basename: 'test2.exe',
              start: new Date('2023-07-01T11:00:00+0900'),
              end: new Date('2023-07-01T11:30:00+0900'),
              appColor: '#888888',
            }),
          ],
          expected: [
            ActivityUsageFixture.default({
              basename: 'test.exe',
              color: '#888888',
              usageTime: 30 * 60 * 1000,
            }),
            ActivityUsageFixture.default({
              basename: 'test2.exe',
              color: '#888888',
              usageTime: 30 * 60 * 1000,
            }),
          ],
        },
        {
          description: 'usageTimeの順にソートされる',
          activities: [
            ActivityEventFixture.default({
              id: 'a1',
              basename: 'test.exe',
              start: new Date('2023-07-01T10:00:00+0900'),
              end: new Date('2023-07-01T10:30:00+0900'),
              appColor: '#888888',
            }),
            ActivityEventFixture.default({
              id: 'a2',
              basename: 'test2.exe',
              start: new Date('2023-07-01T11:00:00+0900'),
              end: new Date('2023-07-01T11:30:00+0900'),
              appColor: '#888888',
            }),
            ActivityEventFixture.default({
              id: 'a3',
              basename: 'test2.exe',
              start: new Date('2023-07-01T12:00:00+0900'),
              end: new Date('2023-07-01T12:30:00+0900'),
              appColor: '#888888',
            }),
          ],
          expected: [
            ActivityUsageFixture.default({
              basename: 'test2.exe',
              color: '#888888',
              usageTime: 60 * 60 * 1000,
            }),
            ActivityUsageFixture.default({
              basename: 'test.exe',
              color: '#888888',
              usageTime: 30 * 60 * 1000,
            }),
          ],
        },
      ];

      it.each(testCases)('%s', async (testCase) => {
        jest.spyOn(activityService, 'fetchActivities').mockResolvedValue(testCase.activities);

        const activityUsage = await service.get(startDate, endDate);

        for (const act of activityUsage) {
          console.log(act.basename + '/' + act.usageTime);
        }
        expect(activityUsage.length).toEqual(testCase.expected.length);
        expect(activityUsage).toEqual(testCase.expected.map((e) => expect.objectContaining(e)));
      });
    });
  });
});
