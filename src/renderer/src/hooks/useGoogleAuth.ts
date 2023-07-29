import { useState, useEffect, useMemo } from 'react';
import { GoogleAuthProxyImpl } from '@renderer/services/GoogleAuthProxyImpl';

type UseGoogleAuthResult = {
  isAuthenticated: boolean | null;
  authError: string | null;
  handleAuth: () => Promise<void>;
  handleRevoke: () => Promise<void>;
};

const useGoogleAuth = (): UseGoogleAuthResult => {
  console.log('useGoogleAuth');

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const authProxy = useMemo(() => new GoogleAuthProxyImpl(), []);

  useEffect(() => {
    const load: () => Promise<void> = async () => {
      const accessToken = await authProxy.getAccessToken();
      console.debug('accessToken', accessToken);

      setIsAuthenticated(accessToken !== null);
    };
    load();
  }, [authProxy]);

  const handleAuth = async (): Promise<void> => {
    try {
      if (isAuthenticated) {
        setIsAuthenticated(null);
        await authProxy.revoke();
      } else {
        setIsAuthenticated(null);
      }
      await authProxy.authenticate();
      setIsAuthenticated(true);
      setAuthError(null);
    } catch (error) {
      console.error('Error during authentication', error);
      setIsAuthenticated(false);
      setAuthError('Failed to authenticate with Google');
    }
  };
  const handleRevoke = async (): Promise<void> => {
    try {
      setIsAuthenticated(null);
      await authProxy.revoke();
      setAuthError(null);
      setIsAuthenticated(false);
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
