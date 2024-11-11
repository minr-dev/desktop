import { ICsvCreateService } from '../ICsvCreateService';
import { IEventEntryCsvSearchService } from '../IEventEntryCsvSearchService';
import { IEventEntryCsvService } from '../IEventEntryCsvService';
import { EventEntryCsvServiceImpl } from '../EventEntryCsvServiceImpl';
import { EventEntryCsvSettingFixture } from '@shared/data/__tests__/EventEntryCsvSettingFixture';
import { CsvCreateServiceMockBuilder } from './__mocks__/CsvCreateServiceMockBuilder';
import { EventEntryCsv } from '../../dto/EventEntryCsv';
import { EventEntryCsvSearchServiceMockBuilder } from './__mocks__/EventEntryCsvSearchServiceMockBuilder';

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
    describe('正常系', () => {
      const testCase = [
        {
          description: '引数のパラメータをテスト',
          eventEntryCsvSetting: EventEntryCsvSettingFixture.default({
            start: new Date('2024-12-01T00:00:00+0900'),
            end: new Date('2024-12-30T23:59:59+0900'),
            eventType: undefined,
          }),
          eventEntryCsv: [
            {
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
            },
          ],
          csvData:
            '予実ID,予実種類,開始日時,終了日時,タイトル,プロジェクトID,プロジェクト名,カテゴリーID,カテゴリー名,タスクID,タスク名,ラベルID,ラベル名,概要\n',
          expected: {
            paramEventEntryCsvSearchService: EventEntryCsvSettingFixture.default({
              start: new Date('2024-12-01T00:00:00+0900'),
              end: new Date('2024-12-30T23:59:59+0900'),
              eventType: undefined,
            }),
            paramCsvCreateService: [
              {
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
              },
            ],
            csvData:
              '予実ID,予実種類,開始日時,終了日時,タイトル,プロジェクトID,プロジェクト名,カテゴリーID,カテゴリー名,タスクID,タスク名,ラベルID,ラベル名,概要\n',
          },
        },
      ];

      it.each(testCase)('%s', async (t) => {
        jest
          .spyOn(eventEntryCsvSearchService, 'searchEventEntryCsv')
          .mockResolvedValue(t.eventEntryCsv);
        jest.spyOn(csvCreateService, 'createCsv').mockResolvedValue(t.csvData);

        const createCsv = await service.createCsv(t.eventEntryCsvSetting);

        expect(eventEntryCsvSearchService.searchEventEntryCsv).toHaveBeenCalledWith(
          t.expected.paramEventEntryCsvSearchService
        );
        expect(csvCreateService.createCsv).toHaveBeenCalledWith(t.expected.paramCsvCreateService);
        expect(createCsv).toEqual(t.expected.csvData);
      });
    });

    describe('異常系', () => {
      const testCase = [
        {
          description: '開始日時が終了日時を超えている',
          eventEntryCsvSetting: EventEntryCsvSettingFixture.default({
            start: new Date('2025-12-01T00:00:00+0900'),
            end: new Date('2024-12-01T00:00:00+0900'),
            eventType: undefined,
          }),
          expectedError:
            'EventEntryCsvSetting start is over end. Mon Dec 01 2025 00:00:00 GMT+0900 (日本標準時), Sun Dec 01 2024 00:00:00 GMT+0900 (日本標準時)',
        },
        {
          description: '出力期間が1カ月を超えている',
          eventEntryCsvSetting: EventEntryCsvSettingFixture.default({
            start: new Date('2024-12-01T00:00:00+0900'),
            end: new Date('2025-01-01T23:59:59+0900'),
            eventType: undefined,
          }),
          expectedError:
            'EventEntryCsv output range exceeds 1 month. Sun Dec 01 2024 00:00:00 GMT+0900 (日本標準時), Wed Jan 01 2025 23:59:59 GMT+0900 (日本標準時)',
        },
      ];

      it.each(testCase)('%s', async (t) => {
        await expect(service.createCsv(t.eventEntryCsvSetting)).rejects.toThrow(t.expectedError);
      });
    });
  });
});
