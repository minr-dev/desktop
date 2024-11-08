import { PomodoroTimer } from '@renderer/components/pomodoroTimer/PomodoroTimer';
import { getLogger } from '@renderer/utils/LoggerUtil';

const logger = getLogger('PomodoroTimerPage');

export const PomodoroTimerPage = (): JSX.Element => {
  logger.info('PomodoroTimerPage');
  return <PomodoroTimer />;
};
