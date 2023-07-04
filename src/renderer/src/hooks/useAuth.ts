import { useState, useEffect, useMemo } from 'react';
import { UserPreferenceProxyImpl } from '@renderer/services/UserPreferenceProxyImpl';
import { GoogleAuthProxyImpl } from '@renderer/services/GoogleAuthProxyImpl';

type Auth = {
  isAuthenticated: boolean;
  authError: string | null;
  handleAuth: () => Promise<void>;
};

const useAuth = (): Auth => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const userPreferenceProxy = useMemo(() => new UserPreferenceProxyImpl(), []);
  const authProxy = new GoogleAuthProxyImpl();

  useEffect(() => {
    const load: () => Promise<void> = async () => {
      const userPreference = await userPreferenceProxy.getOrCreate();
      setIsAuthenticated(userPreference.accessToken !== '');
    };
    load();
  }, [userPreferenceProxy]);

  const handleAuth = async (): Promise<void> => {
    if (isAuthenticated) {
      userPreferenceProxy.getOrCreate().then((userPreference) => {
        userPreference.accessToken = '';
        userPreferenceProxy.save(userPreference);
        setIsAuthenticated(false);
      });
      return;
    }

    try {
      const accessToken = await authProxy.start();
      userPreferenceProxy.getOrCreate().then((userPreference) => {
        userPreference.accessToken = accessToken;
        userPreferenceProxy.save(userPreference);
        setIsAuthenticated(true);
        setAuthError(null);
      });
    } catch (error) {
      console.error('Error during authentication', error);
      setAuthError('Failed to authenticate with Google');
    }
  };

  return {
    isAuthenticated,
    authError,
    handleAuth,
  };
};

export { useAuth };
