import { useState, useEffect, useMemo } from 'react';
import { GoogleAuthProxyImpl } from '@renderer/services/GoogleAuthProxyImpl';

type Auth = {
  isAuthenticated: boolean;
  authError: string | null;
  handleAuth: () => Promise<void>;
};

const useAuth = (): Auth => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const authProxy = useMemo(() => new GoogleAuthProxyImpl(), []);

  useEffect(() => {
    const load: () => Promise<void> = async () => {
      const accessToken = await authProxy.getAccessToken();
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

  return {
    isAuthenticated,
    authError,
    handleAuth,
  };
};

export { useAuth };
