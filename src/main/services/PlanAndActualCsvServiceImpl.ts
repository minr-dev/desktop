import { differenceInMonths, format } from 'date-fns';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { EventEntrySearch } from '@main/dto/EventEntrySearch';
import { PlanAndActualCsv } from '@main/dto/PlanAndActualCsv';
import type { ICsvCreateService } from '@main/services//ICsvCreateService';
import type { IEventEntrySearchService } from '@main/services/IEventEntrySearchService';
import type { IPlanAndActualCsvService } from '@main/services/IPlanAndActualCsvService';
import { PlanAndActualCsvSetting } from '@shared/data/PlanAndActualCsvSetting';
import { getLogger } from '@main/utils/LoggerUtil';
import { eventDateTimeToDate } from '@shared/data/EventDateTime';

const logger = getLogger('PlanAndActualCsvServiceImpl');

const EVENT_TYPE_NAME: Record<string, string> = {
  PLAN: '予定',
  ACTUAL: '実績',
  SHARED: '共有',
};

@injectable()
export class PlanAndActualCsvServiceImpl implements IPlanAndActualCsvService {
  constructor(
    @inject(TYPES.EventEntrySearchService)
    private readonly eventEntrySearchService: IEventEntrySearchService,
    @inject(TYPES.PlanAndActualCsvCreateService)
    private readonly csvCreateService: ICsvCreateService<PlanAndActualCsv>
  ) {}

  async createCsv(planAndActualCsvSetting: PlanAndActualCsvSetting): Promise<string> {
    if (planAndActualCsvSetting.end.getTime() <= planAndActualCsvSetting.start.getTime())
      throw new RangeError(
        `PlanAndActualCsvSetting start is over end. ${planAndActualCsvSetting.start}, ${planAndActualCsvSetting.end}`
      );
    if (differenceInMonths(planAndActualCsvSetting.end, planAndActualCsvSetting.start) >= 1)
      throw new RangeError(
        `PlanAndActualCsv output range exceeds 1 month. ${planAndActualCsvSetting.start}, ${planAndActualCsvSetting.end}`
      );
    const eventEntrySearchData = await this.eventEntrySearchService.searchPlanAndActual(
      planAndActualCsvSetting.start,
      planAndActualCsvSetting.end,
      planAndActualCsvSetting.eventType
    );
    const planAndActualCsvData = this.createEventEntrySearchCsv(eventEntrySearchData);
    const planAndActualCsv = await this.csvCreateService.createCsv(planAndActualCsvData);
    if (logger.isDebugEnabled())
      logger.debug('PlanAndActualCsv successfully created:', planAndActualCsv);
    return planAndActualCsv;
  }

  private createEventEntrySearchCsv(eventEntrySearchData: EventEntrySearch[]): PlanAndActualCsv[] {
    const planAndActualCsvData: PlanAndActualCsv[] = [];
    for (const eventEntrySearch of eventEntrySearchData) {
      const planAndActualCsvRecord: PlanAndActualCsv = {
        予実ID: eventEntrySearch.eventEntryId,
        予実種類: EVENT_TYPE_NAME[eventEntrySearch.eventType],
        開始日時: format(eventDateTimeToDate(eventEntrySearch.start), 'yyyy/MM/dd HH:mm'),
        終了日時: format(eventDateTimeToDate(eventEntrySearch.end), 'yyyy/MM/dd HH:mm'),
        タイトル: eventEntrySearch.summary,
        プロジェクトID: eventEntrySearch?.projectId || '',
        プロジェクト名: eventEntrySearch?.projectName || '',
        カテゴリーID: eventEntrySearch?.categoryId || '',
        カテゴリー名: eventEntrySearch?.categoryName || '',
        タスクID: eventEntrySearch?.taskId || '',
        タスク名: eventEntrySearch?.taskName || '',
        ラベルID:
          this.csvCreateService.convertArrayToString(eventEntrySearch?.labelIds || []) || '',
        ラベル名:
          this.csvCreateService.convertArrayToString(eventEntrySearch?.labelNames || []) || '',
        概要: eventEntrySearch.description || '',
      };
      planAndActualCsvData.push(planAndActualCsvRecord);
    }
    return planAndActualCsvData;
  }
}
