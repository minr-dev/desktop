import UserContext from '@renderer/components/UserContext';
import rendererContainer from '../inversify.config';
import { IUserPreferenceProxy } from '@renderer/services/IUserPreferenceProxy';
import { TYPES } from '@renderer/types';
import { UserPreference } from '@shared/dto/UserPreference';
import { useState, useEffect, useContext } from 'react';

interface UserPreferenceResult {
  userPreference: UserPreference | null;
  loading: boolean;
}

export const useUserPreference = (): UserPreferenceResult => {
  const { userDetails } = useContext(UserContext);
  const [userPreference, setUserPreference] = useState<UserPreference | null>(null);
  const [loading, setLoading] = useState(true);

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
        console.error('Failed to load user preference', error);
      }
      setLoading(false);
    };

    fetchUserPreference();
  }, [userDetails]);

  return { userPreference, loading };
};
