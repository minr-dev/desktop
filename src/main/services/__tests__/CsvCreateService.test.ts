import { CsvCreateService } from '../CsvCreateService';

let csvCreateService: CsvCreateService<{ eventEntryId: string; eventType: string }>;

type CsvData = { eventEntryId: string; eventType: string };

describe('CsvCreateService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    csvCreateService = new CsvCreateService<CsvData>();
  });

  describe('createCsv', () => {
    describe('CSV生成テスト', () => {
      const testCases = [
        {
          description: '予実CSVを出力する',
          paramCsvData: [
            {
              eventEntryId: '123456789',
              eventType: '予定',
            },
            {
              eventEntryId: '987654321',
              eventType: '実績',
            },
          ],
          expected: '123456789,予定\n987654321,実績\n',
        },
      ];
      it.each(testCases)('%s', async (t) => {
        const csvCreate = await csvCreateService.createCsv(t.paramCsvData);
        expect(csvCreate).toEqual(t.expected);
      });
    });
  });
});
