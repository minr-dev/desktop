import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import type { ICsvCreateService } from '@main/services/ICsvCreateService';
import type { IEventEnryCsvSearchService } from '@main/services/IEventEntryCsvSearchService';
import type { IEventEntryCsvService } from '@main/services/IEventEntryCsvService';
import { CSV_HEADER_TYPE } from '@shared/data/CsvFormat';
import { EventEntryCsvSetting } from '@shared/data/EventEntryCsvSetting';

// const logger = getLogger('EventEntryCsvServiceImpl');

@injectable()
export class EventEntryCsvServiceImpl implements IEventEntryCsvService {
  constructor(
    @inject(TYPES.EventEntryCsvSearchService)
    private readonly eventEntryCsvSearchService: IEventEnryCsvSearchService,
    @inject(TYPES.CsvCreateService)
    private readonly csvCreateService: ICsvCreateService
  ) {}

  async createCsv(eventEntryCsvSetting: EventEntryCsvSetting): Promise<string> {
    try {
      const eventEntryCsv = await this.eventEntryCsvSearchService.searchEventEntryCsv(
        eventEntryCsvSetting
      );
      const eventEntryCsvData = await this.csvCreateService.createCsv(CSV_HEADER_TYPE.EVENT_ENTRY, eventEntryCsv);
      if (eventEntryCsvData) {
        // if(logger.isDebugEnabled()) logger.debug('EventEntryCSV successfully created:', eventEntryCsvData);
        return eventEntryCsvData;
      }
      return '';
    } catch (error) {
      // logger.error('EventEntryCSV create error:',error);
      return '';
    }
  }
}
