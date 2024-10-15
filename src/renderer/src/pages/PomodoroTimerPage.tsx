import { PomodoroTimer } from '@renderer/components/pomodoroTimer/PomodoroTimer';
import rendererContainer from '../inversify.config';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';

const loggerFactory = rendererContainer.get<ILoggerFactory>('LoggerFactory');
const logger = loggerFactory.getLogger('PomodoroTimerPage');

export const PomodoroTimerPage = (): JSX.Element => {
  logger.info('PomodoroTimerPage');
  return <PomodoroTimer />;
};
