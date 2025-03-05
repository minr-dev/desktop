import { WorkTimeAggregationGraph } from '@renderer/components/WorkTimeAggregation/WorkTimeAggregationGraph';
import { getLogger } from '@renderer/utils/LoggerUtil';

const logger = getLogger('WorkTimeAggregationGraph');

export const WorkTimeAggregationGraphPage = (): JSX.Element => {
  logger.info('WorkTimeAggregationGraphPage');
  return <WorkTimeAggregationGraph />;
};
