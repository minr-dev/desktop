import { EventEntryCsvFixture } from "@shared/data/__tests__/EventEntryCsvFixture";
import { CsvCreateServiceImpl } from "../CsvCreateServiceImpl";
import { ICsvCreateService } from "../ICsvCreateService";
import { CSV_HEADER_TYPE } from "@shared/data/CsvFormat";

describe('CsvCreateServiceImpl', () => {
  let service: ICsvCreateService;

  beforeEach(() => {
    service = new CsvCreateServiceImpl();
  });

  describe('createCsv', () => {
    describe('CSV生成テスト', () => {
      const testCases = [
        {
          description: '予実CSVを出力する',
          paramCsvHeader: CSV_HEADER_TYPE.EVENT_ENTRY,
          paramEventEntryCsv: [
            EventEntryCsvFixture.default({
              eventEntryId: '123456789',
              eventType: '予定',
              start: '2024/01/01 00:00',
              end: '2024/01/01 01:00',
              summary: 'テスト予定',
              projectId: 'project-test',
              projectName: 'プロジェクト',
              categoryId: 'category-test',
              categoryName: 'カテゴリ',
              taskId: 'task-test',
              taskName: 'タスク',
              labelIds: 'label-test1,label-test2',
              labelNames: 'ラベル1,ラベル2',
              description: '予定概要',
            }),
            EventEntryCsvFixture.default({
              eventEntryId: '987654321',
              eventType: '実績',
              start: '2024/01/01 00:00',
              end: '2024/01/01 01:00',
              summary: 'テスト実績',
              projectId: '',
              projectName: '',
              categoryId: '',
              categoryName: '',
              taskId: '',
              taskName: '',
              labelIds: '',
              labelNames: '',
              description: '実績概要',
            }),
          ],
          expected: '予実ID,予実種類,開始日時,終了日時,タイトル,プロジェクトID,プロジェクト名,カテゴリーID,カテゴリー名,タスクID,タスク名,ラベルID,ラベル名,概要\n123456789,予定,2024/01/01 00:00,2024/01/01 01:00,テスト予定,project-test,プロジェクト,category-test,カテゴリ,task-test,タスク,"label-test1,label-test2","ラベル1,ラベル2",予定概要\n987654321,実績,2024/01/01 00:00,2024/01/01 01:00,テスト実績,,,,,,,,,実績概要\n',
        },
      ];
      it.each(testCases)('%s', async (t) => {
        const csvCreate = await service.createCsv(t.paramCsvHeader, t.paramEventEntryCsv);

        console.log('csvData:', csvCreate);
        expect(csvCreate).toEqual(t.expected);
      });
    });
  });
});