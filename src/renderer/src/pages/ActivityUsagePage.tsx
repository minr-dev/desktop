import { ActivityGraph } from '@renderer/components/activityUsage/ActivityGraph';
import rendererContainer from '../inversify.config';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';
import { TYPES } from '@renderer/types';

export const ActivityUsagePage = (): JSX.Element => {
  const loggerFactory = rendererContainer.get<ILoggerFactory>(TYPES.LoggerFactory);
  const logger = loggerFactory.getLogger({
    processType: 'renderer',
    loggerName: 'ActivityUsagePage',
  });

  logger.info('TimelinePage');
  return <ActivityGraph />;
};
