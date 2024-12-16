import { ICsvCreateService } from '../ICsvCreateService';
import { IPlanAndActualCsvSearchService } from '../IPlanAndActualCsvSearchService';
import { IPlanAndActualCsvService } from '../IPlanAndActualCsvService';
import { PlanAndActualCsvServiceImpl } from '../PlanAndActualCsvServiceImpl';
import { PlanAndActualCsvSettingFixture } from '@shared/data/__tests__/PlanAndActualCsvSettingFixture';
import { CsvCreateServiceMockBuilder } from './__mocks__/CsvCreateServiceMockBuilder';
import { PlanAndActualCsv } from '../../dto/PlanAndActualCsv';
import { PlanAndActualCsvSearchServiceMockBuilder } from './__mocks__/PlanAndActualCsvSearchServiceMockBuilder';
import { PlanAndActualCsvFixture } from '../../dto/__tests__/PlanAndActualCsvFixture';

describe('PlanAndActualCsvServiceImpl', () => {
  let service: IPlanAndActualCsvService;
  let planAndActualCsvSearchService: IPlanAndActualCsvSearchService;
  let csvCreateService: ICsvCreateService<PlanAndActualCsv>;

  beforeEach(() => {
    planAndActualCsvSearchService = new PlanAndActualCsvSearchServiceMockBuilder().build();
    csvCreateService = new CsvCreateServiceMockBuilder().build();
    service = new PlanAndActualCsvServiceImpl(planAndActualCsvSearchService, csvCreateService);
  });

  describe('createCsv', () => {
    describe('引数を元に関数内のサービスメソッドの入出力データが一連の流れになっている。', () => {
      const testCase = [
        {
          paramPlanAndActualCsv: PlanAndActualCsvSettingFixture.default(),
          resultPlanAndActualCsvSearch: [PlanAndActualCsvFixture.default()],
          resultCsvCreate: 'dummyData',
          expected: {
            paramPlanAndActualCsv: PlanAndActualCsvSettingFixture.default(),
            resultPlanAndActualCsvSearch: [PlanAndActualCsvFixture.default()],
            resultCsvCreate: 'dummyData',
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        jest
          .spyOn(planAndActualCsvSearchService, 'searchPlanAndActualCsv')
          .mockResolvedValue(t.resultPlanAndActualCsvSearch);
        jest.spyOn(csvCreateService, 'createCsv').mockResolvedValue(t.resultCsvCreate);

        const csv = await service.createCsv(t.paramPlanAndActualCsv);

        expect(planAndActualCsvSearchService.searchPlanAndActualCsv).toHaveBeenCalledWith(
          t.expected.paramPlanAndActualCsv
        );
        expect(csvCreateService.createCsv).toHaveBeenCalledWith(
          t.expected.resultPlanAndActualCsvSearch
        );
        expect(csv).toEqual(t.expected.resultCsvCreate);
      });
    });
    describe('引数の開始日時が終了日時を超えていると例外が出力される。', () => {
      const testCase = [
        {
          paramPlanAndActualCsv: PlanAndActualCsvSettingFixture.default({
            start: new Date('2025-01-01T00:00:00+0900'),
            end: new Date('2024-12-31T00:00:00+0900'),
          }),
          expected: {
            errorMessage:
              'PlanAndActualCsvSetting start is over end. Wed Jan 01 2025 00:00:00 GMT+0900 (日本標準時), Tue Dec 31 2024 00:00:00 GMT+0900 (日本標準時)',
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        await expect(service.createCsv(t.paramPlanAndActualCsv)).rejects.toThrow(
          t.expected.errorMessage
        );
      });
    });
    describe('引数の開始日時から終了日時の期間が1カ月を超えていると例外が出力される。', () => {
      const testCase = [
        {
          paramPlanAndActualCsv: PlanAndActualCsvSettingFixture.default({
            start: new Date('2024-12-01T00:00:00+0900'),
            end: new Date('2025-01-01T00:00:00+0900'),
          }),
          expected: {
            errorMessage:
              'PlanAndActualCsv output range exceeds 1 month. Sun Dec 01 2024 00:00:00 GMT+0900 (日本標準時), Wed Jan 01 2025 00:00:00 GMT+0900 (日本標準時)',
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        await expect(service.createCsv(t.paramPlanAndActualCsv)).rejects.toThrow(
          t.expected.errorMessage
        );
      });
    });
  });
});
