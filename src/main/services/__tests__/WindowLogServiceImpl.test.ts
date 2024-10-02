import { TestDataSource } from './TestDataSource';
import { DataSource } from '../DataSource';
import { WindowLogFixture } from '@shared/data/__tests__/WindowLogFixture';
import { assert } from 'console';
import { WindowLogServiceImpl } from '../WindowLogServiceImpl';
import { WindowLog } from '@shared/data/WindowLog';
import { DateUtil } from '@shared/utils/DateUtil';
import { ILoggerFactory } from '../ILoggerFactory';
import { LoggerFactoryMockBuilder } from './__mocks__/LoggerFactoryMockBuilder';

describe('WindowLogServiceEntryImpl', () => {
  let service: WindowLogServiceImpl;
  let dataSource: DataSource<WindowLog>;
  let dateUtil: DateUtil;
  let loggerFactory: ILoggerFactory;

  beforeEach(async () => {
    jest.resetAllMocks();
    loggerFactory = new LoggerFactoryMockBuilder().build();
    dataSource = new TestDataSource<WindowLog>(loggerFactory);
    dateUtil = new DateUtil();
    service = new WindowLogServiceImpl(dataSource, dateUtil);
    dataSource.delete(service.tableName, {});
    const count = await dataSource.count(service.tableName, {});
    assert(count === 0);
  });

  describe('list', () => {
    const start = new Date('2023-07-01T06:00:00+0900');
    const end = new Date('2023-07-02T06:00:00+0900');
    const testData = [
      {
        description: '取得期間より前に非アクティブになったウィンドウ',
        preconditions: [
          WindowLogFixture.default({
            id: '1',
            basename: 'test.exe',
            windowTitle: 'test title',
            activated: new Date('2023-07-01T03:00:00+0900'),
            deactivated: new Date('2023-07-01T05:00:00+0900'),
          }),
        ],
        expected: {
          count: 0,
          winlogs: [],
        },
      },
      {
        description: '取得期間の開始日時のタイミングでアクティブだったウィンドウ',
        preconditions: [
          WindowLogFixture.default({
            id: '1',
            basename: 'test.exe',
            windowTitle: 'test title',
            activated: new Date('2023-07-01T05:00:00+0900'),
            deactivated: new Date('2023-07-01T07:00:00+0900'),
          }),
        ],
        expected: {
          count: 1,
          winlogs: [
            WindowLogFixture.default({
              id: '1',
              basename: 'test.exe',
              windowTitle: 'test title',
              activated: new Date('2023-07-01T05:00:00+0900'),
              deactivated: new Date('2023-07-01T07:00:00+0900'),
            }),
          ],
        },
      },
      {
        description: 'アクティブだった期間が取得期間内に収まっているウィンドウ',
        preconditions: [
          WindowLogFixture.default({
            id: '1',
            basename: 'test.exe',
            windowTitle: 'test title',
            activated: new Date('2023-07-01T10:00:00+0900'),
            deactivated: new Date('2023-07-01T12:00:00+0900'),
          }),
        ],
        expected: {
          count: 1,
          winlogs: [
            WindowLogFixture.default({
              id: '1',
              basename: 'test.exe',
              windowTitle: 'test title',
              activated: new Date('2023-07-01T10:00:00+0900'),
              deactivated: new Date('2023-07-01T12:00:00+0900'),
            }),
          ],
        },
      },
      {
        description: '取得期間の終了日時にアクティブだったイベント',
        preconditions: [
          WindowLogFixture.default({
            id: '1',
            basename: 'test.exe',
            windowTitle: 'test title',
            activated: new Date('2023-07-02T05:00:00+0900'),
            deactivated: new Date('2023-07-02T07:00:00+0900'),
          }),
        ],
        expected: {
          count: 1,
          winlogs: [
            WindowLogFixture.default({
              id: '1',
              basename: 'test.exe',
              windowTitle: 'test title',
              activated: new Date('2023-07-02T05:00:00+0900'),
              deactivated: new Date('2023-07-02T07:00:00+0900'),
            }),
          ],
        },
      },
      {
        description: '取得期間後にアクティブになったウィンドウ',
        preconditions: [
          WindowLogFixture.default({
            id: '1',
            basename: 'test.exe',
            windowTitle: 'test title',
            activated: new Date('2023-07-02T10:00:00+0900'),
            deactivated: new Date('2023-07-02T12:00:00+0900'),
          }),
        ],
        expected: {
          count: 0,
          winlogs: [],
        },
      },
      {
        description: 'ウィンドウが複数ある場合',
        preconditions: [
          WindowLogFixture.default({
            id: '1',
            basename: 'test1.exe',
            windowTitle: 'test title 1',
            activated: new Date('2023-07-02T10:00:00+0900'),
            deactivated: new Date('2023-07-02T12:00:00+0900'),
          }),
          WindowLogFixture.default({
            id: '2',
            basename: 'test2.exe',
            windowTitle: 'test title 2',
            activated: new Date('2023-07-02T05:00:00+0900'),
            deactivated: new Date('2023-07-02T07:00:00+0900'),
          }),
          WindowLogFixture.default({
            id: '3',
            basename: 'test3.exe',
            windowTitle: 'test title 3',
            activated: new Date('2023-07-01T10:00:00+0900'),
            deactivated: new Date('2023-07-01T12:00:00+0900'),
          }),
          WindowLogFixture.default({
            id: '4',
            basename: 'test4.exe',
            windowTitle: 'test title 4',
            activated: new Date('2023-07-01T05:00:00+0900'),
            deactivated: new Date('2023-07-01T07:00:00+0900'),
          }),
          WindowLogFixture.default({
            id: '5',
            basename: 'test5.exe',
            windowTitle: 'test title 5',
            activated: new Date('2023-07-01T03:00:00+0900'),
            deactivated: new Date('2023-07-01T05:00:00+0900'),
          }),
        ],
        expected: {
          count: 3,
          winlogs: [
            WindowLogFixture.default({
              id: '4',
              basename: 'test4.exe',
              windowTitle: 'test title 4',
              activated: new Date('2023-07-01T05:00:00+0900'),
              deactivated: new Date('2023-07-01T07:00:00+0900'),
            }),
            WindowLogFixture.default({
              id: '3',
              basename: 'test3.exe',
              windowTitle: 'test title 3',
              activated: new Date('2023-07-01T10:00:00+0900'),
              deactivated: new Date('2023-07-01T12:00:00+0900'),
            }),
            WindowLogFixture.default({
              id: '2',
              basename: 'test2.exe',
              windowTitle: 'test title 2',
              activated: new Date('2023-07-02T05:00:00+0900'),
              deactivated: new Date('2023-07-02T07:00:00+0900'),
            }),
          ],
        },
      },
    ];
    it.each(testData)('%s', async (testData) => {
      for (const precondition of testData.preconditions) {
        await service.save(precondition);
      }
      const winlogs = await service.list(start, end);
      const expected = testData.expected;
      expect(winlogs).toHaveLength(expected.count);
      for (let i = 0; i < winlogs.length; i++) {
        expect(winlogs[i].id).toEqual(expected.winlogs[i].id);
        expect(winlogs[i].basename).toEqual(expected.winlogs[i].basename);
        expect(winlogs[i].pid).toEqual(expected.winlogs[i].pid);
        expect(winlogs[i].windowTitle).toEqual(expected.winlogs[i].windowTitle);
        expect(winlogs[i].path).toEqual(expected.winlogs[i].path);
        expect(winlogs[i].activated).toEqual(expected.winlogs[i].activated);
        expect(winlogs[i].deactivated).toEqual(expected.winlogs[i].deactivated);
      }
    });
  });
});
