import { differenceInDays, format } from 'date-fns';
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

const planAndActualCsvHeader: Record<keyof PlanAndActualCsv, string> = {
  eventEntryId: '予実ID',
  eventType: '予実種類',
  start: '開始日時',
  end: '終了日時',
  summary: 'タイトル',
  projectId: 'プロジェクトID',
  projectName: 'プロジェクト名',
  categoryId: 'カテゴリーID',
  categoryName: 'カテゴリー名',
  taskId: 'タスクID',
  taskName: 'タスク名',
  labelIds: 'ラベルID',
  labelNames: 'ラベル名',
  description: '概要',
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
    if (differenceInDays(planAndActualCsvSetting.end, planAndActualCsvSetting.start) > 30)
      throw new RangeError(
        `PlanAndActualCsv output range exceeds 1 month. ${planAndActualCsvSetting.start}, ${planAndActualCsvSetting.end}`
      );
    const eventEntrySearchData = await this.eventEntrySearchService.getPlanAndActuals(
      planAndActualCsvSetting.start,
      planAndActualCsvSetting.end,
      planAndActualCsvSetting.eventType
    );
    const planAndActualCsvData = this.createEventEntrySearchCsv(eventEntrySearchData);
    const planAndActualCsv = await this.csvCreateService.createCsv(
      planAndActualCsvHeader,
      planAndActualCsvData
    );
    if (logger.isDebugEnabled())
      logger.debug('PlanAndActualCsv successfully created:', planAndActualCsv);
    return planAndActualCsv;
  }

  private createEventEntrySearchCsv(eventEntrySearchData: EventEntrySearch[]): PlanAndActualCsv[] {
    const planAndActualCsvData: PlanAndActualCsv[] = [];
    for (const eventEntrySearch of eventEntrySearchData) {
      const planAndActualCsvRecord: PlanAndActualCsv = {
        eventEntryId: eventEntrySearch.eventEntryId,
        eventType: EVENT_TYPE_NAME[eventEntrySearch.eventType],
        start: format(eventDateTimeToDate(eventEntrySearch.start), 'yyyy/MM/dd HH:mm'),
        end: format(eventDateTimeToDate(eventEntrySearch.end), 'yyyy/MM/dd HH:mm'),
        summary: eventEntrySearch.summary,
        projectId: eventEntrySearch?.projectId || '',
        projectName: eventEntrySearch?.projectName || '',
        categoryId: eventEntrySearch?.categoryId || '',
        categoryName: eventEntrySearch?.categoryName || '',
        taskId: eventEntrySearch?.taskId || '',
        taskName: eventEntrySearch?.taskName || '',
        labelIds:
          this.csvCreateService.convertArrayToString(eventEntrySearch?.labelIds || []) || '',
        labelNames:
          this.csvCreateService.convertArrayToString(eventEntrySearch?.labelNames || []) || '',
        description: eventEntrySearch.description || '',
      };
      planAndActualCsvData.push(planAndActualCsvRecord);
    }
    return planAndActualCsvData;
  }
}
