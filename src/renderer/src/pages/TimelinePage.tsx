import TimeTable from '@renderer/components/timeTable/TimeTable';
import { getLogger } from '@renderer/utils/LoggerUtil';

const logger = getLogger('TimelinePage');

export const TimelinePage = (): JSX.Element => {
  logger.info('TimelinePage');
  return <TimeTable />;
};
