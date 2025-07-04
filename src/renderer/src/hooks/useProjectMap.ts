import rendererContainer from '@renderer/inversify.config';
import { Pageable } from '@shared/data/Page';
import { Project } from '@shared/data/Project';
import { TYPES } from '@renderer/types';
import { useQuery } from 'react-query';
import { IProjectProxy } from '@renderer/services/IProjectProxy';
import { CacheKey } from './cacheKey';
import { getLogger } from '@renderer/utils/LoggerUtil';

const PAGEABLE = new Pageable(0, Number.MAX_SAFE_INTEGER);
const EMPTY_MAP = new Map<string, Project>();

interface UseProjectMapResult {
  projectMap: Map<string, Project>;
  refresh: () => Promise<void>;
  error: unknown;
  isLoading: boolean;
}

const logger = getLogger('useProjectMap');

/**
 * プロジェクト の全件を取得してマップにするフック。
 */
export const useProjectMap: () => UseProjectMapResult = () => {
  if (logger.isDebugEnabled()) logger.debug('useProjectMap');
  const { data, error, isLoading, refetch } = useQuery(CacheKey.PROJECTS, fetchProjects);
  const map = data ?? EMPTY_MAP;

  // 内部で refetch をラップする。
  // これにより refetch の戻り値の型が露出させない。機能的な意味はない。
  const refresh = async (): Promise<void> => {
    await refetch();
  };

  return { projectMap: map, refresh, error, isLoading };
};

const fetchProjects = async (): Promise<Map<string, Project>> => {
  if (logger.isDebugEnabled()) logger.debug('fetchProjects');
  const proxy = rendererContainer.get<IProjectProxy>(TYPES.ProjectProxy);
  const result = await proxy.list(PAGEABLE);
  const labelMap = new Map<string, Project>();
  result.content.forEach((label) => {
    labelMap.set(label.id, label);
  });
  return labelMap;
};
