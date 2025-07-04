import rendererContainer from '@renderer/inversify.config';
import { ITaskProxy } from '@renderer/services/ITaskProxy';
import { TYPES } from '@renderer/types';
import { Pageable } from '@shared/data/Page';
import { Task } from '@shared/data/Task';
import { useQuery } from 'react-query';
import { CacheKey } from './cacheKey';
import { getLogger } from '@renderer/utils/LoggerUtil';

const PAGEABLE = new Pageable(0, Number.MAX_SAFE_INTEGER);
const EMPTY_MAP = new Map<string, Task>();

interface UseTaskMapResult {
  taskMap: Map<string, Task>;
  refresh: () => Promise<void>;
  error: unknown;
  isLoading: boolean;
}

const logger = getLogger('useTaskMap');

/**
 * タスクのマップを取得するフック
 *
 * @returns {UseTaskMapResult}
 */
export const useTaskMap = (): UseTaskMapResult => {
  if (logger.isDebugEnabled()) logger.debug('useTaskMap');
  const { data, error, isLoading, refetch } = useQuery([CacheKey.TASKS], () => fetchTasks(), {});
  const map = data ?? EMPTY_MAP;

  // 内部で refetch をラップする。
  // これにより refetch の戻り値の型が露出させない。機能的な意味はない。
  const refresh = async (): Promise<void> => {
    await refetch();
  };

  return { taskMap: map, refresh, error, isLoading };
};

/**
 * プロジェクトIDでフィルタリングしたタスクのマップを取得するフック
 *
 * @param {string} projectId - プロジェクトID
 * @returns {UseTaskMapResult}
 */
export const useTaskMapFilteredByProject = (projectId: string): UseTaskMapResult => {
  if (logger.isDebugEnabled()) logger.debug('useTaskMapFilteredByProject');
  const { data, error, isLoading, refetch } = useQuery(
    [CacheKey.TASKS, projectId],
    () => fetchTasks(true, projectId),
    {}
  );
  const map = data ?? EMPTY_MAP;

  // 内部で refetch をラップする。
  // これにより refetch の戻り値の型が露出させない。機能的な意味はない。
  const refresh = async (): Promise<void> => {
    await refetch();
  };

  return { taskMap: map, refresh, error, isLoading };
};

/**
 * タスクを取得
 *
 * @param {boolean} isFilterByProject - プロジェクトIDによるフィルターの有無
 * @param {string} projectId - プロジェクトID
 * @returns {Promise<Map<string, Task>>} - タスクのマップオブジェクト
 */
const fetchTasks = async (
  isFilterByProject = false,
  projectId = ''
): Promise<Map<string, Task>> => {
  if (logger.isDebugEnabled()) logger.debug('fetchTasks');
  const proxy = rendererContainer.get<ITaskProxy>(TYPES.TaskProxy);
  const result = await proxy.list(PAGEABLE, isFilterByProject, projectId);
  const taskMap = new Map<string, Task>();
  result.content.forEach((task) => {
    taskMap.set(task.id, task);
  });
  return taskMap;
};
