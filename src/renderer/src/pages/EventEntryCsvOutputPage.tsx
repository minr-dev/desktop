import { EventEntryCsvOutput } from '@renderer/components/eventEntryCsv/EventEntryCsvOutput';
import { getLogger } from '@renderer/utils/LoggerUtil';

const logger = getLogger('EventEntryCsvOutputPage');

export const EventEntryCsvOutputPage = (): JSX.Element => {
  logger.info('EventEntryCsvOutputPage');
  return <EventEntryCsvOutput />;
};
