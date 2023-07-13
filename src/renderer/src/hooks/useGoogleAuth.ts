import { useState, useEffect, useMemo } from 'react';
import { GoogleAuthProxyImpl } from '@renderer/services/GoogleAuthProxyImpl';

type Auth = {
  isAuthenticated: boolean;
  authError: string | null;
  handleAuth: () => Promise<void>;
  handleRevoke: () => Promise<void>;
};

const useGoogleAuth = (): Auth => {
  console.log('useGoogleAuth');

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const authProxy = useMemo(() => new GoogleAuthProxyImpl(), []);

  useEffect(() => {
    const load: () => Promise<void> = async () => {
      const accessToken = await authProxy.getAccessToken();
      console.log('accessToken', accessToken);

      setIsAuthenticated(accessToken !== null);
    };
    load();
  }, [authProxy]);

  const handleAuth = async (): Promise<void> => {
    if (isAuthenticated) {
      setIsAuthenticated(false);
    }
    try {
      await authProxy.authenticate();
      setIsAuthenticated(true);
      setAuthError(null);
    } catch (error) {
      console.error('Error during authentication', error);
      setAuthError('Failed to authenticate with Google');
    }
  };
  const handleRevoke = async (): Promise<void> => {
    try {
      await authProxy.revoke();
      setIsAuthenticated(false);
      setAuthError(null);
    } catch (error) {
      console.error('Error during deauthentication', error);
      setAuthError('Failed to deauthenticate with Google');
    }
  };

  return {
    isAuthenticated,
    authError,
    handleAuth,
    handleRevoke,
  };
};

export { useGoogleAuth };
