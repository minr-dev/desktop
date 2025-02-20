import { stringify as asyncStringify } from 'csv-stringify';
import { stringify as syncStringify } from 'csv-stringify/sync';
import { injectable } from 'inversify';
import { ICsvCreateService } from './ICsvCreateService';

@injectable()
export class CsvCreateServiceImpl<T> implements ICsvCreateService<T> {
  async createCsv(csvData: T[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const csv = asyncStringify(csvData, {
        header: true,
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

  convertArrayToString(datas: string[]): string {
    // stringify で配列を引数にするには2次元配列である必要があるため変換を行う。
    const dataArray = [datas];
    const output: string = syncStringify(dataArray, { header: false, eof: false });
    return output;
  }
}
