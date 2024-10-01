import TimeTable from '@renderer/components/timeTable/TimeTable';
import rendererContainer from '../inversify.config';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';
import { TYPES } from '@renderer/types';

export const TimelinePage = (): JSX.Element => {
  const loggerFactory = rendererContainer.get<ILoggerFactory>(TYPES.LoggerFactory);
  const logger = loggerFactory.getLogger({ processType: 'renderer', loggerName: 'TimelinePage' });

  logger.info('TimelinePage');
  return <TimeTable />;
};
