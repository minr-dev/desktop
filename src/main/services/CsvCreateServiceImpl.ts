import { stringify as asyncStringify } from 'csv-stringify';
import { stringify as syncStringify } from 'csv-stringify/sync';
import { injectable } from 'inversify';
import { ICsvCreateService } from './ICsvCreateService';

@injectable()
export class CsvCreateServiceImpl<T> implements ICsvCreateService<T> {
  async createCsv(csvHeader: Record<keyof T, string>, csvData: T[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const csv = asyncStringify(csvData, {
        header: true,
        columns: csvHeader,
        bom: true,
      });

      let result = '';
      csv.on('readable', () => {
        let row;
        while ((row = csv.read()) !== null) {
          result += row;
        }
      });
      csv.on('error', (err) => {
        reject(err);
      });
      csv.on('end', () => {
        resolve(result);
      });
      csvData.forEach((record) => csv.write(record));
      csv.end();
    });
  }

  /**
   * CSV作成で使用する配列を文字列に変換します。
   *
   * memo:
   * csv-stringifyのstringifyで配列の変換をしているのは、
   * 同じライブラリを使用することでエスケープ処理の差異を心配する必要が無い
   * という点からこのような実装になっています。
   *
   * @param array
   * @returns 文字列に変換された配列
   */
  convertArrayToString(array: string[]): string {
    // stringify で配列を引数にするには2次元配列である必要があるため変換を行う。
    const dimensionnalArray = [array];
    const output: string = syncStringify(dimensionnalArray, { header: false, eof: false });
    return output;
  }
}
