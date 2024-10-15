import React from 'react';

import rendererContainer from '@renderer/inversify.config';
import { TYPES } from '@renderer/types';
import { IActivityUsageProxy } from '@renderer/services/IActivityUsageProxy';
import { ActivityUsage } from '@shared/data/ActivityUsage';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';

interface UseActivityUsageResult {
  activityUsage: ActivityUsage[];
  refreshActivityUsage: () => void;
}

const loggerFactory = rendererContainer.get<ILoggerFactory>('LoggerFactory');
const logger = loggerFactory.getLogger('useActivityUsage');

const useActivityUsage = (start?: Date, end?: Date): UseActivityUsageResult => {
  const [activityUsage, setActivityUsage] = React.useState<ActivityUsage[]>([]);

  // 初期取得(再取得)
  const refreshActivityUsage = React.useCallback(async (): Promise<void> => {
    try {
      if (!start || !end) {
        return;
      }

      const activityUsageProxy = rendererContainer.get<IActivityUsageProxy>(
        TYPES.ActicityUsageProxy
      );
      const activityUsage = await activityUsageProxy.get(start, end);
      setActivityUsage(activityUsage);
    } catch (error) {
      logger.error(`Failed to load user preference: ${error}`);
    }
  }, [start, end, logger]);

  React.useEffect(() => {
    refreshActivityUsage();
  }, [refreshActivityUsage]);

  return {
    activityUsage,
    refreshActivityUsage,
  };
};

export { useActivityUsage };
