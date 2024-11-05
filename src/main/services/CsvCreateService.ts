import { stringify } from 'csv-stringify';
import { injectable } from 'inversify';

@injectable()
export class CsvCreateService<T> {
  async createCsv(csvSouceData: T[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const csv = stringify(csvSouceData, {
        header: false,
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
      csvSouceData.forEach((record) => csv.write(record));
      csv.end();
    });
  }
}
