import rendererContainer from '@renderer/inversify.config';
import { GitHubProjectV2 } from '@shared/data/GitHubProjectV2';
import { CacheKey } from './cacheKey';
import { useQuery } from 'react-query';
import { TYPES } from '@renderer/types';
import { IGitHubProjectV2Proxy } from '@renderer/services/IGitHubProjectV2Proxy';

interface UseGitHubProjectV2MapResult {
  gitHubProjectV2Map: Map<string, GitHubProjectV2>;
  refresh: () => Promise<void>;
  error: unknown;
  isLoading: boolean;
}

export const useGitHubProjectV2Map: () => UseGitHubProjectV2MapResult = () => {
  const { data, error, isLoading, refetch } = useQuery(
    CacheKey.GITHUBPROJECTV2,
    fetchGitHubProjectV2
  );
  const gitHubProjectV2Map = data ?? new Map<string, GitHubProjectV2>();

  const refresh = async (): Promise<void> => {
    await refetch();
  };

  return { gitHubProjectV2Map, refresh, error, isLoading };
};

const fetchGitHubProjectV2 = async (): Promise<Map<string, GitHubProjectV2>> => {
  const proxy = rendererContainer.get<IGitHubProjectV2Proxy>(TYPES.GitHubProjectV2Proxy);
  const result = await proxy.list();
  const gitHubProjectV2Map = new Map<string, GitHubProjectV2>();
  result.forEach((gitHubProjectV2) => {
    gitHubProjectV2Map.set(gitHubProjectV2.id, gitHubProjectV2);
  });
  return gitHubProjectV2Map;
};
