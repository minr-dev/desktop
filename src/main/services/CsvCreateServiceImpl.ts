import { stringify } from 'csv-stringify';
import { injectable } from 'inversify';
import { ICsvCreateService } from '@main/services/ICsvCreateService';
import { CSV_HEADER_TYPE } from '@shared/data/CsvFormat';
import { EventEntryCsv } from '@shared/data/EventEntryCsv';

@injectable()
export class CsvCreateServiceImpl implements ICsvCreateService {
  async createCsv(csvHeader: CSV_HEADER_TYPE, eventEntryCsv: EventEntryCsv[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const csv = stringify(eventEntryCsv, {
        header: true,
        columns: csvHeader,
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
      eventEntryCsv.forEach((record) => csv.write(record));
      csv.end();
    });
  }
}
