import { PomodoroTimer } from '@renderer/components/pomodoroTimer/PomodoroTimer';
import rendererContainer from '../inversify.config';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';
import { TYPES } from '@renderer/types';

export const PomodoroTimerPage = (): JSX.Element => {
  const loggerFactory = rendererContainer.get<ILoggerFactory>(TYPES.LoggerFactory);
  const logger = loggerFactory.getLogger({
    processType: 'renderer',
    loggerName: 'PomodoroTimerPage',
  });

  logger.info('PomodoroTimerPage');
  return <PomodoroTimer />;
};
