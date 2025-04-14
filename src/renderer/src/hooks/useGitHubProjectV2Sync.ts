import { TYPES } from '@renderer/types';
import rendererContainer from '../inversify.config';
import { IDeviceFlowAuthProxy } from '@renderer/services/IDeviceFlowAuthProxy';
import { useEffect, useState } from 'react';
import { IGitHubProjectV2SyncProxy } from '@renderer/services/IGitHubProjectV2SyncProxy';

type UseGitHubProjectV2Sync = {
  syncGitHubProjectV2: () => Promise<void>;
  syncOrganization: () => Promise<void>;
};

const useGitHubProjectV2Sync = (): UseGitHubProjectV2Sync => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const authProxy = rendererContainer.get<IDeviceFlowAuthProxy>(TYPES.GitHubAuthProxy);
  const gitHubProjectV2SyncProxy = rendererContainer.get<IGitHubProjectV2SyncProxy>(
    TYPES.GitHubProjectV2SyncProxy
  );

  useEffect(() => {
    const load: () => Promise<void> = async () => {
      const accessToken = await authProxy.getAccessToken();

      setIsAuthenticated(accessToken !== null);
    };
    load();
    // コンポーネントがアンマウントされたときにトークンリクエストのポーリングを止める
    return () => {
      authProxy.abortPolling();
    };
  }, [authProxy]);

  const syncGitHubProjectV2 = async (): Promise<void> => {
    if (isAuthenticated) {
      await gitHubProjectV2SyncProxy.syncGitHubProjectV2();
    }
  };

  const syncOrganization = async (): Promise<void> => {
    if (isAuthenticated) {
      await gitHubProjectV2SyncProxy.syncOrganization();
    }
  };

  return {
    syncGitHubProjectV2,
    syncOrganization,
  };
};

export { useGitHubProjectV2Sync };
