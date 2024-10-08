import { useState, useEffect } from 'react';
import rendererContainer from '../inversify.config';
import { IAuthProxy } from '@renderer/services/IAuthProxy';
import { TYPES } from '@renderer/types';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';

type UseGoogleAuthResult = {
  isAuthenticated: boolean | null;
  authError: string | null;
  handleAuth: () => Promise<void>;
  handleRevoke: () => Promise<void>;
};

const useGoogleAuth = (): UseGoogleAuthResult => {
  const loggerFactory = rendererContainer.get<ILoggerFactory>(TYPES.LoggerFactory);
  const logger = loggerFactory.getLogger({ processType: 'renderer', loggerName: 'useGoogleAuth' });
  if (logger.isDebugEnabled()) logger.debug('useGoogleAuth');

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const authProxy = rendererContainer.get<IAuthProxy>(TYPES.GoogleAuthProxy);

  useEffect(() => {
    const load: () => Promise<void> = async () => {
      const accessToken = await authProxy.getAccessToken();

      setIsAuthenticated(accessToken !== null);
    };
    load();
  }, [authProxy, logger]);

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
      logger.error(`Error during authentication: ${error}`);
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
      logger.error(`Error during deauthentication: ${error}`);
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
