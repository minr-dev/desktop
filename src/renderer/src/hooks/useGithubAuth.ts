import { useState, useEffect } from 'react';
import rendererContainer from '../inversify.config';
import { TYPES } from '@renderer/types';
import { IAuthProxy } from '@renderer/services/IAuthProxy';

type UseGithubAuthResult = {
  isAuthenticated: boolean | null;
  authError: string | null;
  handleAuth: () => Promise<void>;
  handleRevoke: () => Promise<void>;
};

const useGithubAuth = (): UseGithubAuthResult => {
  console.log('useGithubAuth');

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const authProxy = rendererContainer.get<IAuthProxy>(TYPES.GithubAuthProxy);

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
      setAuthError('Failed to authenticate with Github');
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
      setAuthError('Failed to deauthenticate with Github');
    }
  };

  return {
    isAuthenticated,
    authError,
    handleAuth,
    handleRevoke,
  };
};

export { useGithubAuth };
