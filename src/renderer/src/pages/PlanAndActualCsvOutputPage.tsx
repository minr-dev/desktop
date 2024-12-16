import { PlanAndActualCsvOutput } from '@renderer/components/planAndActualCsv/PlanAndActualCsvOutput';
import { getLogger } from '@renderer/utils/LoggerUtil';

const logger = getLogger('PlanAndActualCsvOutputPage');

export const PlanAndActualCsvOutputPage = (): JSX.Element => {
  logger.info('PlanAndActualCsvOutputPage');
  return <PlanAndActualCsvOutput />;
};
