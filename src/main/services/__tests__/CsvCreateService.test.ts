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
    describe('引数の配列数と、出力したCSVのレコード数が一致している。', () => {
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
    describe('引数にしている配列の個々の値と、出力したCSVのフィールドが全て一致している。', () => {
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
    describe('引数に特殊文字が含まれている場合は、エスケープ処理されて出力される。', () => {
      const testCase = [
        {
          description: 'パラメータのデータ内にカンマがある場合のエスケープ処理テスト',
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
          description: 'パラメータのデータ内に改行コードがある場合のエスケープ処理テスト',
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
          description:
            'パラメータのデータ内にダブルクオートが含まれている場合のエスケープ処理テスト',
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
          description: 'パラメータのデータ内に空文字が含まれている場合のエスケープ処理テスト',
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
    describe('引数にしている配列が、カンマで区切られた文字列で出力される。', () => {
      const testCase = [
        {
          description: '引数の配列がカンマで区切られた文字列で出力されているかのテスト',
          paramConvertArrayToString: ['1', '2'],
          expected: {
            resultString: '1,2',
          },
        },
        {
          description: '引数の配列にカンマがある場合のエスケープ処理テスト',
          paramConvertArrayToString: ['1', 'test,'],
          expected: {
            resultString: '1,"test,"',
          },
        },
        {
          description: '引数の配列に改行コードがある場合のエスケープ処理テスト',
          paramConvertArrayToString: ['2', 'test\n'],
          expected: {
            resultString: '2,"test\n"',
          },
        },
        {
          description: '引数の配列にダブルクオートが含まれている場合のエスケープ処理テスト',
          paramConvertArrayToString: ['3', '"test"'],
          expected: {
            resultString: '3,"""test"""',
          },
        },
        {
          description: '引数の配列に空文字が含まれている場合のエスケープ処理テスト',
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
