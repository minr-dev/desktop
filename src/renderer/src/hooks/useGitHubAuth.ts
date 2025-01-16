import { useState, useEffect } from 'react';
import rendererContainer from '../inversify.config';
import { TYPES } from '@renderer/types';
import { IDeviceFlowAuthProxy } from '@renderer/services/IDeviceFlowAuthProxy';
import { IpcChannel } from '@shared/constants';
import { getLogger } from '@renderer/utils/LoggerUtil';

type UseGitHubAuthResult = {
  isAuthenticated: boolean | null;
  authError: string | null;
  userCode: string | null;
  isOpenUserCodeWindow: boolean;
  handleAuth: () => Promise<void>;
  handleShowUserCodeInputWindow: () => Promise<void>;
  handleRevoke: () => Promise<void>;
};

const logger = getLogger('useGitHubAuth');

const useGitHubAuth = (): UseGitHubAuthResult => {
  if (logger.isDebugEnabled()) logger.debug('useGitHubAuth');

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userCode, setUserCode] = useState<string | null>(null);
  const [isOpenUserCodeWindow, setUserCodeWindowOpen] = useState<boolean>(false);
  const authProxy = rendererContainer.get<IDeviceFlowAuthProxy>(TYPES.GitHubAuthProxy);

  useEffect(() => {
    const load: () => Promise<void> = async () => {
      const accessToken = await authProxy.getAccessToken();

      setIsAuthenticated(accessToken !== null);
    };
    load();
  }, [authProxy]);

  useEffect(() => {
    // ハンドラ
    const handler = (_event, userCode: string): void => {
      if (logger.isDebugEnabled()) logger.debug('recv GITHUB_USER_CODE_NOTIFY');
      setUserCode(userCode);
    };
    // コンポーネントがマウントされたときに IPC のハンドラを設定
    const unsubscribe = window.electron.ipcRenderer.on(IpcChannel.GITHUB_USER_CODE_NOTIFY, handler);
    // コンポーネントがアンマウントされたときに解除
    return () => {
      unsubscribe();
    };
  });

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
      setUserCode(null);
    } catch (error) {
      logger.error('Error during authentication', error);
      setIsAuthenticated(false);
      setUserCode(null);
      setAuthError('Failed to authenticate with GitHub');
    }
  };
  const handleShowUserCodeInputWindow = async (): Promise<void> => {
    setUserCodeWindowOpen(true);
    try {
      await authProxy.showUserCodeInputWindow();
    } catch (error) {
      logger.error('Error during user code input', error);
    }
    setUserCodeWindowOpen(false);
  };
  const handleRevoke = async (): Promise<void> => {
    try {
      setIsAuthenticated(null);
      await authProxy.revoke();
      setAuthError(null);
      setIsAuthenticated(false);
    } catch (error) {
      logger.error('Error during deauthentication', error);
      setAuthError('Failed to deauthenticate with GitHub');
    }
  };

  return {
    isAuthenticated,
    authError,
    userCode,
    isOpenUserCodeWindow,
    handleAuth,
    handleShowUserCodeInputWindow,
    handleRevoke,
  };
};

export { useGitHubAuth as useGitHubAuth };
