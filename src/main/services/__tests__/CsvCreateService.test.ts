import { getLogger } from '@main/utils/LoggerUtil';
import { CsvCreateServiceImpl } from '../CsvCreateServiceImpl';

const logger = getLogger('CsvCreateServiceImpl');

type CsvData = { eventEntryId: string; eventType: string; labels: string };

let csvCreateService: CsvCreateServiceImpl<CsvData>;

describe('CsvCreateServiceImpl', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    csvCreateService = new CsvCreateServiceImpl<CsvData>();
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
              labels: 'label1,label2',
            },
            {
              eventEntryId: '987654321',
              eventType: '実績',
              labels: 'label1',
            },
          ],
          expected: '123456789,予定,"label1,label2"\n987654321,実績,label1\n',
        },
      ];
      it.each(testCases)('%s', async (t) => {
        const csvCreate = await csvCreateService.createCsv(t.paramCsvData);
        logger.debug('csvCreate:', csvCreate, 'expected:', t.expected);
        expect(csvCreate).toEqual(t.expected);
      });
    });
  });
});
