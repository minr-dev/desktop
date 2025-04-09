import rendererContainer from '@renderer/inversify.config';
import { GitHubProjectV2 } from '@shared/data/GitHubProjectV2';
import { CacheKey } from './cacheKey';
import { useQuery } from 'react-query';
import { TYPES } from '@renderer/types';
import { IGitHubProjectV2Proxy } from '@renderer/services/IGitHubProjectV2Proxy';

interface UseGitHubProjectMapResult {
  gitHubProjectMap: Map<string, GitHubProjectV2>;
  refresh: () => Promise<void>;
  error: unknown;
  isLoading: boolean;
}

export const useGitHubProjectMap: () => UseGitHubProjectMapResult = () => {
  const { data, error, isLoading, refetch } = useQuery(
    CacheKey.GITHUBPROJECTV2,
    fetchGitHubProjects
  );
  const gitHubProjectMap = data ?? new Map<string, GitHubProjectV2>();

  const refresh = async (): Promise<void> => {
    await refetch();
  };

  return { gitHubProjectMap, refresh, error, isLoading };
};

const fetchGitHubProjects = async (): Promise<Map<string, GitHubProjectV2>> => {
  const proxy = rendererContainer.get<IGitHubProjectV2Proxy>(TYPES.GitHubProjectV2Proxy);
  const result = await proxy.list();
  const gitHubProjectMap = new Map<string, GitHubProjectV2>();
  result.forEach((gitHubProject) => {
    gitHubProjectMap.set(gitHubProject.id, gitHubProject);
  });
  return gitHubProjectMap;
};
