import AppContext from '@renderer/components/AppContext';
import rendererContainer from '../inversify.config';
import { IUserPreferenceProxy } from '@renderer/services/IUserPreferenceProxy';
import { TYPES } from '@renderer/types';
import { UserPreference } from '@shared/data/UserPreference';
import { useState, useEffect, useContext } from 'react';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';

interface UserPreferenceResult {
  userPreference: UserPreference | null;
  loading: boolean;
}

export const useUserPreference = (): UserPreferenceResult => {
  const { userDetails } = useContext(AppContext);
  const [userPreference, setUserPreference] = useState<UserPreference | null>(null);
  const [loading, setLoading] = useState(true);

  const loggerFactory = rendererContainer.get<ILoggerFactory>(TYPES.LoggerFactory);
  const logger = loggerFactory.getLogger({
    processType: 'renderer',
    loggerName: 'useUserPreference',
  });

  useEffect(() => {
    if (!userDetails) {
      return;
    }

    const fetchUserPreference = async (): Promise<void> => {
      try {
        const userPreferenceProxy = rendererContainer.get<IUserPreferenceProxy>(
          TYPES.UserPreferenceProxy
        );
        const preference = await userPreferenceProxy.getOrCreate(userDetails.userId);
        setUserPreference(preference);
      } catch (error) {
        logger.error(`Failed to load user preference: ${error}`);
      }
      setLoading(false);
    };

    fetchUserPreference();
  }, [userDetails, logger]);

  return { userPreference, loading };
};
