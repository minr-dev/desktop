import { differenceInMonths } from 'date-fns';
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
    if (eventEntryCsvSetting.end.getTime() <= eventEntryCsvSetting.start.getTime())
      throw new RangeError(`EventEntryCsvSetting start is over end. ${eventEntryCsvSetting.start}, ${eventEntryCsvSetting.end}`);
    if (differenceInMonths(eventEntryCsvSetting.end, eventEntryCsvSetting.start) > 1)
      throw new RangeError(`EventEntryCsv output range exceeds 1 month. ${eventEntryCsvSetting.start}, ${eventEntryCsvSetting.end}`);
    const eventEntryCsv = await this.eventEntryCsvSearchService.searchEventEntryCsv(
      eventEntryCsvSetting
    );
    const eventEntryCsvData = await this.csvCreateService.createCsv(eventEntryCsv);
    // if(logger.isDebugEnabled()) logger.debug('EventEntryCSV successfully created:', eventEntryCsvData);
    return eventEntryCsvData;
  }
}
