import { ActivityGraph } from '@renderer/components/activityUsage/ActivityGraph';
import rendererContainer from '../inversify.config';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';

const loggerFactory = rendererContainer.get<ILoggerFactory>('LoggerFactory');
const logger = loggerFactory.getLogger('ActivityUsagePage');

export const ActivityUsagePage = (): JSX.Element => {
  logger.info('TimelinePage');
  return <ActivityGraph />;
};
