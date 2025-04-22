import { TYPES } from '@renderer/types';
import rendererContainer from '../inversify.config';
import { IDeviceFlowAuthProxy } from '@renderer/services/IDeviceFlowAuthProxy';
import { useCallback, useEffect, useState } from 'react';
import { IGitHubProjectV2SyncProxy } from '@renderer/services/IGitHubProjectV2SyncProxy';

type UseGitHubProjectV2Sync = {
  isAuthenticated: boolean | null;
  syncGitHubProjectV2: () => Promise<void>;
  syncOrganization: () => Promise<void>;
  syncGitHubProjectV2Item: (projectId: string) => Promise<void>;
};

const useGitHubProjectV2Sync = (): UseGitHubProjectV2Sync => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const authProxy = rendererContainer.get<IDeviceFlowAuthProxy>(TYPES.GitHubAuthProxy);
  const gitHubProjectV2SyncProxy = rendererContainer.get<IGitHubProjectV2SyncProxy>(
    TYPES.GitHubProjectV2SyncProxy
  );

  useEffect(() => {
    // memo: GitHub連携が行われているか判定するために、アクセストークンを取得する。
    const load: () => Promise<void> = async () => {
      const accessToken = await authProxy.getAccessToken();
      setIsAuthenticated(accessToken !== null);
    };
    load();
  }, [authProxy]);

  const syncGitHubProjectV2 = useCallback(async (): Promise<void> => {
    if (isAuthenticated) {
      await gitHubProjectV2SyncProxy.syncGitHubProjectV2();
    }
  }, [gitHubProjectV2SyncProxy, isAuthenticated]);

  const syncOrganization = useCallback(async (): Promise<void> => {
    if (isAuthenticated) {
      await gitHubProjectV2SyncProxy.syncOrganization();
    }
  }, [gitHubProjectV2SyncProxy, isAuthenticated]);

  const syncGitHubProjectV2Item = useCallback(
    async (projectId: string): Promise<void> => {
      if (isAuthenticated) {
        await gitHubProjectV2SyncProxy.syncGitHubProjectV2Item(projectId);
      }
    },
    [gitHubProjectV2SyncProxy, isAuthenticated]
  );

  return {
    isAuthenticated,
    syncGitHubProjectV2,
    syncOrganization,
    syncGitHubProjectV2Item,
  };
};

export { useGitHubProjectV2Sync };
