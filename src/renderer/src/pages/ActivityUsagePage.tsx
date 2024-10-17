import { ActivityGraph } from '@renderer/components/activityUsage/ActivityGraph';
import { getLogger } from '@renderer/utils/LoggerUtil';

const logger = getLogger('ActivityUsagePage');

export const ActivityUsagePage = (): JSX.Element => {
  logger.info('TimelinePage');
  return <ActivityGraph />;
};
