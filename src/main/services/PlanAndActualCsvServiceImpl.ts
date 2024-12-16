import { differenceInMonths } from 'date-fns';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { PlanAndActualCsv } from '@main/dto/PlanAndActualCsv';
import type { ICsvCreateService } from '@main/services//ICsvCreateService';
import type { IPlanAndActualCsvSearchService } from '@main/services/IPlanAndActualCsvSearchService';
import type { IPlanAndActualCsvService } from '@main/services/IPlanAndActualCsvService';
import { PlanAndActualCsvSetting } from '@shared/data/PlanAndActualCsvSetting';
import { getLogger } from '@main/utils/LoggerUtil';

const logger = getLogger('PlanAndActualCsvServiceImpl');

@injectable()
export class PlanAndActualCsvServiceImpl implements IPlanAndActualCsvService {
  constructor(
    @inject(TYPES.PlanAndActualCsvSearchService)
    private readonly planAndActualCsvSearchService: IPlanAndActualCsvSearchService,
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
    const planAndActualCsv = await this.planAndActualCsvSearchService.searchPlanAndActualCsv(
      planAndActualCsvSetting
    );
    const planAndActualCsvData = await this.csvCreateService.createCsv(planAndActualCsv);
    if (logger.isDebugEnabled())
      logger.debug('PlanAndActualCsv successfully created:', planAndActualCsvData);
    return planAndActualCsvData;
  }
}
