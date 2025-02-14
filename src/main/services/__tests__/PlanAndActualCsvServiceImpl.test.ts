import { ICsvCreateService } from '../ICsvCreateService';
import { IEventEntrySearchService } from '../IEventEntrySearchService';
import { IPlanAndActualCsvService } from '../IPlanAndActualCsvService';
import { PlanAndActualCsvServiceImpl } from '../PlanAndActualCsvServiceImpl';
import { PlanAndActualCsvSettingFixture } from '@shared/data/__tests__/PlanAndActualCsvSettingFixture';
import { CsvCreateServiceMockBuilder } from './__mocks__/CsvCreateServiceMockBuilder';
import { PlanAndActualCsv } from '../../dto/PlanAndActualCsv';
import { EventEntrySearchServiceMockBuilder } from './__mocks__/EventEntrySearchServiceMockBuilder';
import { EventEntrySearchFixture } from '@main/dto/__tests__/EventEntrySearchFixture';
import { PlanAndActualCsvFixture } from '@main/dto/__tests__/PlanAndActualCsvFixture';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { EventDateTimeFixture } from '@shared/data/__tests__/EventEntryFixture';
import { format } from 'date-fns';
import { eventDateTimeToDate } from '@shared/data/EventDateTime';

const planAndActualCsvHeader = {
  eventEntryId: '予実ID',
  eventType: '予実種類',
  start: '開始日時',
  end: '終了日時',
  summary: 'タイトル',
  projectId: 'プロジェクトID',
  projectName: 'プロジェクト名',
  categoryId: 'カテゴリーID',
  categoryName: 'カテゴリー名',
  taskId: 'タスクID',
  taskName: 'タスク名',
  labelIds: 'ラベルID',
  labelNames: 'ラベル名',
  description: '概要',
};

describe('PlanAndActualCsvServiceImpl', () => {
  let service: IPlanAndActualCsvService;
  let eventEntrySearchService: IEventEntrySearchService;
  let csvCreateService: ICsvCreateService<PlanAndActualCsv>;

  beforeEach(() => {
    eventEntrySearchService = new EventEntrySearchServiceMockBuilder().build();
    csvCreateService = new CsvCreateServiceMockBuilder().build();
    service = new PlanAndActualCsvServiceImpl(eventEntrySearchService, csvCreateService);
  });

  describe('createCsv', () => {
    describe('引数を元に関数内のサービスメソッドの入出力データが一連の流れになっている。', () => {
      const eventEntrySearch = EventEntrySearchFixture.default({
        eventEntryId: '1',
        eventType: EVENT_TYPE.PLAN,
        start: EventDateTimeFixture.default({ dateTime: new Date('2024-12-30T10:00:00+0900') }),
        end: EventDateTimeFixture.default({ dateTime: new Date('2024-12-30T11:00:00+0900') }),
        summary: 'test',
      });
      const testCase = [
        {
          paramPlanAndActualCsv: PlanAndActualCsvSettingFixture.default(),
          resultPlanAndActualSearch: [eventEntrySearch],
          resultCsvCreate: 'dummyData',
          expected: {
            paramPlanAndActualCsv: PlanAndActualCsvSettingFixture.default(),
            resultPlanAndActualSearch: PlanAndActualCsvFixture.default({
              eventEntryId: eventEntrySearch.eventEntryId,
              eventType: '予定',
              start: format(eventDateTimeToDate(eventEntrySearch.start), 'yyyy/MM/dd HH:mm'),
              end: format(eventDateTimeToDate(eventEntrySearch.end), 'yyyy/MM/dd HH:mm'),
              summary: eventEntrySearch.summary,
            }),
            resultCsvCreate: 'dummyData',
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        jest.spyOn(eventEntrySearchService, 'searchPlanAndActual').mockResolvedValue([]);
        jest.spyOn(csvCreateService, 'createCsv').mockResolvedValue(t.resultCsvCreate);

        const csv = await service.createCsv(t.paramPlanAndActualCsv);

        expect(eventEntrySearchService.searchPlanAndActual).toHaveBeenCalledWith(
          t.expected.paramPlanAndActualCsv.start,
          t.expected.paramPlanAndActualCsv.end,
          t.expected.paramPlanAndActualCsv.eventType
        );
        expect(csvCreateService.createCsv).toHaveBeenCalledWith([planAndActualCsvHeader]);
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
