import { CSV_HEADER_TYPE } from '@shared/data/CsvFormat';
import { EventEntryCsv } from '@shared/data/EventEntryCsv';

export interface ICsvCreateService {
  createCsv(csvHeader: CSV_HEADER_TYPE, eventEntryCsv: EventEntryCsv[]): Promise<string>;
}
