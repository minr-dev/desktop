import { DataSource } from '../DataSource';
import { ILoggerFactory } from '../ILoggerFactory';
import { TestDataSource } from './TestDataSource';

const dbName = 'DataSourceTest.db';
let dataSource: DataSource<{ name: string; age: number }>;
let loggerFactory: ILoggerFactory;

// テスト用のサンプルデータ
type Human = { name: string; age: number };

describe('DataSource', () => {
  /**
   * DataSourceから取得するデータには _id が含まれているため、
   * データの比較の際には expect.objectContaining を用いる。
   * また、sort を指定しなければ順番が保証されないため、
   * expect.arrayContaining で期待される結果が含まれることを確認し、
   * 余計なデータがないことはデータのサイズで確認する。
   */

  beforeEach(() => {
    jest.resetAllMocks();
    dataSource = new TestDataSource<Human>(loggerFactory);
    dataSource.createDb(dbName);
    dataSource.delete(dbName, {});
  });

  describe('insert', () => {
    const testData = [
      {
        description: 'データ1個の挿入',
        insertData: [{ name: 'John', age: 30 }],
      },
    ];
    it.each(testData)('%s', async (testData) => {
      for (const data of testData.insertData) {
        const insertedData = await dataSource.insert(dbName, data);
        // 戻り値の確認
        expect(insertedData).toEqual(expect.objectContaining(data));
      }
      const allData = await dataSource.find(dbName, {});
      // DataSourceの中身の確認
      expect(allData).toEqual(
        expect.arrayContaining(testData.insertData.map((e) => expect.objectContaining(e)))
      );
      expect(allData).toHaveLength(testData.insertData.length);
    });
  });

  describe('find', () => {
    const testData = [
      {
        description: 'クエリなし',
        preconditions: [
          { name: 'Alice', age: 15 },
          { name: 'Bob', age: 20 },
          { name: 'Carol', age: 25 },
        ],
        query: {},
        sort: {},
        expects: [
          { name: 'Alice', age: 15 },
          { name: 'Bob', age: 20 },
          { name: 'Carol', age: 25 },
        ],
      },
      {
        description: '大小関係のクエリ',
        preconditions: [
          { name: 'Alice', age: 15 },
          { name: 'Bob', age: 20 },
          { name: 'Carol', age: 25 },
        ],
        query: { age: { $gte: 20 } },
        sort: {},
        expects: [
          { name: 'Bob', age: 20 },
          { name: 'Carol', age: 25 },
        ],
      },
      {
        description: 'ソートのクエリ',
        preconditions: [
          { name: 'Carol', age: 25 },
          { name: 'Alice', age: 15 },
          { name: 'Bob', age: 20 },
        ],
        query: {},
        sort: { age: 1 },
        expects: [
          { name: 'Alice', age: 15 },
          { name: 'Bob', age: 20 },
          { name: 'Carol', age: 25 },
        ],
      },
    ];
    it.each(testData)('%s', async (testData) => {
      for (const precondition of testData.preconditions) {
        await dataSource.insert(dbName, precondition);
      }
      const retrievedData = await dataSource.find(dbName, testData.query, testData.sort);
      let expectData = testData.expects.map((e) => expect.objectContaining(e));
      if (Object.keys(testData.sort).length === 0) {
        // sort が {} の場合、順番は確認しない
        expectData = expect.arrayContaining(expectData);
      }
      expect(retrievedData).toEqual(expectData);
      expect(retrievedData).toHaveLength(testData.expects.length);
    });
  });

  describe('delete', () => {
    const testData = [
      {
        description: 'すべて削除',
        preconditions: [
          { name: 'Alice', age: 15 },
          { name: 'Bob', age: 20 },
          { name: 'Carol', age: 25 },
        ],
        query: {},
        expects: [],
      },
      {
        description: '1件削除',
        preconditions: [
          { name: 'Alice', age: 15 },
          { name: 'Bob', age: 20 },
          { name: 'Carol', age: 25 },
        ],
        query: { name: 'Alice' },
        expects: [
          { name: 'Bob', age: 20 },
          { name: 'Carol', age: 25 },
        ],
      },
    ];
    it.each(testData)('%s', async (testData) => {
      for (const precondition of testData.preconditions) {
        await dataSource.insert(dbName, precondition);
      }
      await dataSource.delete(dbName, testData.query);
      const allData = await dataSource.find(dbName, {});
      // DataSourceの中身の確認
      expect(allData).toEqual(
        expect.arrayContaining(testData.expects.map((e) => expect.objectContaining(e)))
      );
      expect(allData).toHaveLength(testData.expects.length);
    });
  });

  describe('update', () => {
    const testData = [
      {
        description: '1件更新',
        preconditions: [
          { name: 'Alice', age: 15 },
          { name: 'Bob', age: 20 },
          { name: 'Carol', age: 25 },
        ],
        query: { name: 'Bob' },
        newData: { name: 'John', age: 30 },
        expects: [
          { name: 'Alice', age: 15 },
          { name: 'John', age: 30 },
          { name: 'Carol', age: 25 },
        ],
      },
    ];
    it.each(testData)('%s', async (testData) => {
      for (const precondition of testData.preconditions) {
        await dataSource.insert(dbName, precondition);
      }
      const updatedData = await dataSource.update(dbName, testData.query, testData.newData);

      // 戻り値の確認
      expect(updatedData).toEqual(expect.objectContaining(testData.newData));
      const allData = await dataSource.find(dbName, {});
      // DataSourceの中身の確認
      expect(allData).toEqual(
        expect.arrayContaining(testData.expects.map((e) => expect.objectContaining(e)))
      );
      expect(allData).toHaveLength(testData.expects.length);
    });
  });

  describe('get', () => {
    const testData = [
      {
        description: 'データがある場合',
        preconditions: [{ name: 'John', age: 30 }],
        query: { name: 'John' },
        expect: { name: 'John', age: 30 },
      },
      {
        description: 'データがない場合',
        preconditions: [{ name: 'John', age: 30 }],
        query: { name: 'Alice' },
        expect: null,
      },
    ];
    it.each(testData)('%s', async (testData) => {
      for (const precondition of testData.preconditions) {
        await dataSource.insert(dbName, precondition);
      }
      const retrievedData = await dataSource.get(dbName, testData.query);
      if (testData.expect !== null) {
        expect(retrievedData).toEqual(expect.objectContaining(testData.expect));
      } else {
        expect(retrievedData).toBeNull();
      }
    });
  });

  describe('upsert', () => {
    const testData = { name: 'John Doe', age: 30 };
    it('挿入の場合の呼び出しテスト', async () => {
      const mockInsert = jest.spyOn(dataSource, 'insert');
      const mockUpdate = jest.spyOn(dataSource, 'update');
      await dataSource.upsert(dbName, testData);
      expect(mockInsert).toBeCalledTimes(1);
      expect(mockInsert).lastCalledWith(dbName, testData);
      expect(mockUpdate).toBeCalledTimes(0);
    });
    it('更新の場合の呼び出しテスト', async () => {
      const insertData = await dataSource.insert(dbName, testData);
      const updateData = { ...insertData, age: 35 };
      const mockInsert = jest.spyOn(dataSource, 'insert');
      const mockUpdate = jest.spyOn(dataSource, 'update');
      await dataSource.upsert(dbName, updateData);
      expect(mockInsert).toBeCalledTimes(0);
      expect(mockUpdate).toBeCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith(dbName, expect.anything(), updateData);
    });
  });
  describe('count', () => {
    const testData = [
      { description: '初期状態では0', preconditions: [], expect: 0 },
      {
        description: 'データを挿入すると1増える',
        preconditions: [
          { name: 'Alice', age: 15 },
          { name: 'Bob', age: 20 },
          { name: 'Carol', age: 25 },
        ],
        insertData: { name: 'John', age: 30 },
        countQuery: {},
        expect: 4,
      },
      {
        description: 'データ1件を削除すると1減る',
        preconditions: [
          { name: 'Alice', age: 15 },
          { name: 'Bob', age: 20 },
          { name: 'Carol', age: 25 },
        ],
        deleteQuery: { name: 'Alice' },
        countQuery: {},
        expect: 2,
      },
      {
        description: 'データ1件の更新しても変わらない',
        preconditions: [
          { name: 'Alice', age: 15 },
          { name: 'Bob', age: 20 },
          { name: 'Carol', age: 25 },
        ],
        updateQuery: { name: 'Bob' },
        updateData: { name: 'John', age: 30 },
        countQuery: {},
        expect: 3,
      },
    ];
    it.each(testData)('%s', async (testData) => {
      for (const precondition of testData.preconditions) {
        await dataSource.insert(dbName, precondition);
      }

      if (testData.insertData) {
        await dataSource.insert(dbName, testData.insertData);
      }
      if (testData.deleteQuery) {
        await dataSource.delete(dbName, testData.deleteQuery);
      }
      if (testData.updateQuery && testData.updateData) {
        await dataSource.update(dbName, testData.updateQuery, testData.updateData);
      }

      const count = await dataSource.count(dbName, testData.countQuery);
      expect(count).toBe(testData.expect);
    });
  });
});
