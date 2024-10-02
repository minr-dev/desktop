import { ActivityColorFixture } from '@shared/data/__tests__/ActivityColorFixture';
import { ActivityColor } from '@shared/data/ActivityColor';
import { ActivityColorServiceImpl, COLOR_PALETTE } from '../ActivityColorServiceImpl';
import { TestDataSource } from './TestDataSource';
import { assert } from 'console';
import { DateUtil } from '@shared/utils/DateUtil';
import { ILoggerFactory } from '../ILoggerFactory';
import { LoggerFactoryMockBuilder } from './__mocks__/LoggerFactoryMockBuilder';

describe('ActivityColorServiceImpl', () => {
  let service: ActivityColorServiceImpl;
  let dataSource: TestDataSource<ActivityColor>;
  let dateUtil: DateUtil;
  let loggerFactory: ILoggerFactory;

  beforeEach(async () => {
    jest.resetAllMocks();
    loggerFactory = new LoggerFactoryMockBuilder().withGetLogger().withGetLogger().build();
    dataSource = new TestDataSource<ActivityColor>(loggerFactory);
    dateUtil = new DateUtil();
    service = new ActivityColorServiceImpl(dataSource, dateUtil, loggerFactory);
    await dataSource.delete(service.tableName, {});
    const n = await dataSource.count(service.tableName, {});
    assert(n === 0);
  });

  describe('generateColor', () => {
    const testData = [
      {
        description: '1件の登録がある状態で generateColor を呼び出すと、次の色を返す',
        preconditions: [
          ActivityColorFixture.default({
            appColor: COLOR_PALETTE[0],
          }),
        ],
        expected: COLOR_PALETTE[1],
      },
      {
        description: '2件の登録がある状態で generateColor を呼び出すと、次の色を返す',
        preconditions: [
          ActivityColorFixture.default({
            id: '1',
            appPath: 'c:\\program files\\test\\test1.exe',
            appColor: COLOR_PALETTE[0],
          }),
          ActivityColorFixture.default({
            id: '2',
            appPath: 'c:\\program files\\test\\test2.exe',
            appColor: COLOR_PALETTE[1],
          }),
        ],
        expected: COLOR_PALETTE[2],
      },
    ];
    it.each(testData)('%s', async (testData) => {
      for (const precondition of testData.preconditions) {
        await service.save(precondition);
      }
      const actual = await service.generateColor();
      const expected = testData.expected;
      expect(actual).toEqual(expected);
    });
  });

  describe('get', () => {
    const defaultData = ActivityColorFixture.default();
    const testData = [
      {
        description: '登録がある状態で get を呼び出すと、データが返ってくる',
        preconditions: [defaultData],
        params: {
          appPath: defaultData.appPath,
        },
        expected: {
          found: true,
          result: ActivityColorFixture.default(),
        },
      },
      {
        description: '登録がない状態で get を呼び出すと、undefined が返ってくる',
        preconditions: [],
        params: {
          appPath: defaultData.appPath,
        },
        expected: {
          found: false,
          result: null,
        },
      },
    ];
    it.each(testData)('%s', async (testData) => {
      for (const precondition of testData.preconditions) {
        await service.save(precondition);
      }
      const actual = await service.get(testData.params.appPath);
      expect(actual ? true : false).toEqual(testData.expected.found);
      if (!testData.expected.found) {
        expect(actual).toEqual(testData.expected.result);
      } else {
        if (!testData.expected.result || !actual) {
          throw new Error('expected.result is null');
        }
        const expected = testData.expected.result;
        expect(actual.id).toEqual(expected.id);
        expect(actual.appColor).toEqual(expected.appColor);
        expect(actual.appPath).toEqual(expected.appPath);
        expect(actual.updated.getTime()).toBeGreaterThan(expected.updated.getTime());
      }
    });
  });
});
