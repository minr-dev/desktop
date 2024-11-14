import { getLogger } from '@main/utils/LoggerUtil';
import { CsvCreateServiceImpl } from '../CsvCreateServiceImpl';

const logger = getLogger('CsvCreateServiceImpl');

type CsvData = { dummy1: string; dummy2: string };

let csvCreateService: CsvCreateServiceImpl<CsvData>;

describe('CsvCreateServiceImpl', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    csvCreateService = new CsvCreateServiceImpl<CsvData>();
  });

  describe('createCsv', () => {
    describe('引数の配列の要素数と、出力したCSVのレコード数が一致している。', () => {
      const testCase = [
        {
          paramCsvCreate: [
            {
              dummy1: '1',
              dummy2: 'test1',
            },
          ],
          expected: {
            resultCsvRecordNum: 1,
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        const csv = await csvCreateService.createCsv(t.paramCsvCreate);
        const records = csv.trim().split('\n');
        expect(records.length).toEqual(t.expected.resultCsvRecordNum);
      });
    });
    describe('引数の配列の要素のフィールドと、出力したCSVのフィールドが全て一致している。', () => {
      const testCase = [
        {
          paramCsvCreate: [
            {
              dummy1: '1',
              dummy2: 'test1',
            },
          ],
          expected: {
            resultCsvField: ['1', 'test1'],
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        const csv = await csvCreateService.createCsv(t.paramCsvCreate);
        const records = csv.trim().split('\n');
        records.forEach((record) => {
          const elements = record.split(',');
          expect(elements[0]).toEqual(t.expected.resultCsvField[0]);
          expect(elements[1]).toEqual(t.expected.resultCsvField[1]);
        });
      });
    });
    describe('引数にした配列の要素内に特殊文字が含まれている場合は、エスケープ処理されて出力される。', () => {
      const testCase = [
        {
          paramCsvCreate: [
            {
              dummy1: '1',
              dummy2: 'test1,test2',
            },
          ],
          expected: {
            resultCsv: '1,"test1,test2"\n',
          },
        },
        {
          paramCsvCreate: [
            {
              dummy1: '2',
              dummy2: 'test1\ntest2',
            },
          ],
          expected: {
            resultCsv: '2,"test1\ntest2"\n',
          },
        },
        {
          paramCsvCreate: [
            {
              dummy1: '3',
              dummy2: 'test1"test2"',
            },
          ],
          expected: {
            resultCsv: '3,"test1""test2"""\n',
          },
        },
        {
          paramCsvCreate: [
            {
              dummy1: '4',
              dummy2: '',
            },
          ],
          expected: {
            resultCsv: '4,\n',
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        const csv = await csvCreateService.createCsv(t.paramCsvCreate);
        if (logger.isDebugEnabled()) logger.debug('escape csv:', csv);
        expect(csv).toEqual(t.expected.resultCsv);
      });
    });
  });

  describe('convertArrayToString', () => {
    describe('引数の配列の要素と、出力された文字列のカンマで区切られた要素が全て一致している。', () => {
      const testCase = [
        {
          paramConvertArrayToString: ['1', '2'],
          expected: {
            resultString: '1,2',
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        const convertString = csvCreateService.convertArrayToString(t.paramConvertArrayToString);
        if (logger.isDebugEnabled()) logger.debug('convertString:', convertString);
        expect(convertString).toEqual(t.expected.resultString);
      });
    });
    describe('引数にした配列の要素内に特殊文字が含まれている場合は、エスケープ処理されて出力される。', () => {
      const testCase = [
        {
          paramConvertArrayToString: ['1', 'test,'],
          expected: {
            resultString: '1,"test,"',
          },
        },
        {
          paramConvertArrayToString: ['2', '"test"'],
          expected: {
            resultString: '2,"""test"""',
          },
        },
        {
          paramConvertArrayToString: ['3', 'test\n'],
          expected: {
            resultString: '3,"test\n"',
          },
        },
        {
          paramConvertArrayToString: ['4', '', 'test'],
          expected: {
            resultString: '4,,test',
          },
        },
      ];
      it.each(testCase)('%s', async (t) => {
        const convertString = csvCreateService.convertArrayToString(t.paramConvertArrayToString);
        if (logger.isDebugEnabled()) logger.debug('convertString:', convertString);
        expect(convertString).toEqual(t.expected.resultString);
      });
    });
  });
});
