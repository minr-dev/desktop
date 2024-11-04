import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { CsvCreateService } from '@main/services/CsvCreateService';
import type { EventEntryCsv, IEventEnryCsvSearchService } from '@main/services/IEventEntryCsvSearchService';
import type { IEventEntryCsvService } from '@main/services/IEventEntryCsvService';
import { EventEntryCsvSetting } from '@shared/data/EventEntryCsvSetting';

// const logger = getLogger('EventEntryCsvServiceImpl');

@injectable()
export class EventEntryCsvServiceImpl implements IEventEntryCsvService {
  constructor(
    @inject(TYPES.EventEntryCsvSearchService)
    private readonly eventEntryCsvSearchService: IEventEnryCsvSearchService,
    @inject(TYPES.CsvCreateService)
    private readonly csvCreateService: CsvCreateService<EventEntryCsv>
  ) {}

  async createCsv(eventEntryCsvSetting: EventEntryCsvSetting): Promise<string> {
    try {
      const eventEntryCsv = await this.eventEntryCsvSearchService.searchEventEntryCsv(
        eventEntryCsvSetting
      );
      const eventEntryCsvData = await this.csvCreateService.createCsv(eventEntryCsv);
      // if(logger.isDebugEnabled()) logger.debug('EventEntryCSV successfully created:', eventEntryCsvData);
      return eventEntryCsvData;
    } catch (error) {
      console.error('EventEntryCsvServiceImpl error:', error);
      throw error;
    }
  }
}
