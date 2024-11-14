import { ICsvCreateService } from '../ICsvCreateService';
import { IEventEntryCsvSearchService } from '../IEventEntryCsvSearchService';
import { IEventEntryCsvService } from '../IEventEntryCsvService';
import { EventEntryCsvServiceImpl } from '../EventEntryCsvServiceImpl';
import { EventEntryCsvSettingFixture } from '@shared/data/__tests__/EventEntryCsvSettingFixture';
import { CsvCreateServiceMockBuilder } from './__mocks__/CsvCreateServiceMockBuilder';
import { EventEntryCsv } from '../../dto/EventEntryCsv';
import { EventEntryCsvSearchServiceMockBuilder } from './__mocks__/EventEntryCsvSearchServiceMockBuilder';
import { EventEntryCsvFixture } from '../../dto/__tests__/EventEntryCsvFixture';

describe('EventEntryCsvServiceImpl', () => {
  let service: IEventEntryCsvService;
  let eventEntryCsvSearchService: IEventEntryCsvSearchService;
  let csvCreateService: ICsvCreateService<EventEntryCsv>;

  beforeEach(() => {
    eventEntryCsvSearchService = new EventEntryCsvSearchServiceMockBuilder().build();
    csvCreateService = new CsvCreateServiceMockBuilder().build();
    service = new EventEntryCsvServiceImpl(eventEntryCsvSearchService, csvCreateService);
  });

  describe('createCsv', () => {
    describe('引数を元に関数内のサービスメソッドの入出力データが一連の流れになっている。', () => {
      const testCase = [
        {
          paramEventEntryCsv: EventEntryCsvSettingFixture.default(),
          resultEventEntryCsvSearch: [EventEntryCsvFixture.default()],
          resultCsvCreate: 'dummyData',
          expected: {
            paramEventEntryCsv: EventEntryCsvSettingFixture.default(),
            resultEventEntryCsvSearch: [EventEntryCsvFixture.default()],
            resultCsvCreate: 'dummyData',
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        jest
          .spyOn(eventEntryCsvSearchService, 'searchEventEntryCsv')
          .mockResolvedValue(t.resultEventEntryCsvSearch);
        jest.spyOn(csvCreateService, 'createCsv').mockResolvedValue(t.resultCsvCreate);

        const csv = await service.createCsv(t.paramEventEntryCsv);

        expect(eventEntryCsvSearchService.searchEventEntryCsv).toHaveBeenCalledWith(
          t.expected.paramEventEntryCsv
        );
        expect(csvCreateService.createCsv).toHaveBeenCalledWith(
          t.expected.resultEventEntryCsvSearch
        );
        expect(csv).toEqual(t.expected.resultCsvCreate);
      });
    });
    describe('引数の開始日時が終了日時を超えていると例外が出力される。', () => {
      const testCase = [
        {
          paramEventEntryCsv: EventEntryCsvSettingFixture.default({
            start: new Date('2025-01-01T00:00:00+0900'),
            end: new Date('2024-12-31T00:00:00+0900'),
          }),
          expected: {
            errorMessage:
              'EventEntryCsvSetting start is over end. Wed Jan 01 2025 00:00:00 GMT+0900 (日本標準時), Tue Dec 31 2024 00:00:00 GMT+0900 (日本標準時)',
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        await expect(service.createCsv(t.paramEventEntryCsv)).rejects.toThrow(
          t.expected.errorMessage
        );
      });
    });
    describe('引数の開始日時から終了日時の期間が1カ月を超えていると例外が出力される。', () => {
      const testCase = [
        {
          paramEventEntryCsv: EventEntryCsvSettingFixture.default({
            start: new Date('2024-12-01T00:00:00+0900'),
            end: new Date('2025-01-01T00:00:00+0900'),
          }),
          expected: {
            errorMessage:
              'EventEntryCsv output range exceeds 1 month. Sun Dec 01 2024 00:00:00 GMT+0900 (日本標準時), Wed Jan 01 2025 00:00:00 GMT+0900 (日本標準時)',
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        await expect(service.createCsv(t.paramEventEntryCsv)).rejects.toThrow(
          t.expected.errorMessage
        );
      });
    });
  });
});
