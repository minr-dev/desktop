import TimeTable from '@renderer/components/timeTable/TimeTable';
import rendererContainer from '../inversify.config';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';

const loggerFactory = rendererContainer.get<ILoggerFactory>('LoggerFactory');
const logger = loggerFactory.getLogger('TimelinePage');

export const TimelinePage = (): JSX.Element => {
  logger.info('TimelinePage');
  return <TimeTable />;
};
