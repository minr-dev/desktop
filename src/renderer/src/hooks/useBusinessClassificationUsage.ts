import React from "react";
import rendererContainer from '@renderer/inversify.config';
import { BusinessClassificationUsage } from "@shared/data/BusinessClassificationUsage";
import { EVENT_TYPE } from "@shared/data/EventEntry";
import { getLogger } from "@renderer/utils/LoggerUtil";
import { TYPES } from "@renderer/types";
import { IBusinessClassificationUsageProxy } from "@renderer/services/IBusinessClassificationUsageProxy";

interface UseBusinessClassificationUsage {
  businessClassificationUsage: BusinessClassificationUsage[];
  refreshBusinessClassificationUsage: () => void;
}

const logger = getLogger('useBusinessClassificationUsage');

const useBusinessClassificationUsage = (start?: Date, end?: Date, eventType?: EVENT_TYPE | undefined): UseBusinessClassificationUsage => {
  const [businessClassificationUsage, setBusinessClassificationUsage] = React.useState<BusinessClassificationUsage[]>([]);

  const refreshBusinessClassificationUsage = React.useCallback(async (): Promise<void> => {
    try {
      if (!start || !end || !eventType) {
        return;
      }

      const businessClassificationUsageProxy = rendererContainer.get<IBusinessClassificationUsageProxy>(
        TYPES.BusinessClassificationUsageProxy
      );
      const businessClassificationUsage = await businessClassificationUsageProxy.get(start, end, eventType);
      setBusinessClassificationUsage(businessClassificationUsage);
    } catch (error) {
      logger.error('Failed to load user preference', error);
    }
  }, [start, end, eventType]);

  React.useEffect(() => {
    refreshBusinessClassificationUsage();
  }, [refreshBusinessClassificationUsage]);

  return {
    businessClassificationUsage,
    refreshBusinessClassificationUsage,
  };
};
  
export { useBusinessClassificationUsage };
