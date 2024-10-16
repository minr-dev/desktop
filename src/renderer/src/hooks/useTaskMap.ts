import rendererContainer from '@renderer/inversify.config';
import { ITaskProxy } from '@renderer/services/ITaskProxy';
import { TYPES } from '@renderer/types';
import { Pageable } from '@shared/data/Page';
import { Task } from '@shared/data/Task';
import { useQuery } from 'react-query';
import { CacheKey } from './cacheKey';

const PAGEABLE = new Pageable(0, Number.MAX_SAFE_INTEGER);
const EMPTY_MAP = new Map<string, Task>();

interface UseTaskMapResult {
  taskMap: Map<string, Task>;
  refresh: () => Promise<void>;
  error: unknown;
  isLoading: boolean;
}

/**
 * タスクのマップを取得するフック
 *
 * @param {string} projectId - プロジェクトID、指定がない場合は全体から取得
 * @returns {UseTaskMapResult}
 */
export const useTaskMap = (projectId = ''): UseTaskMapResult => {
  console.log('useTaskMap');
  const { data, error, isLoading, refetch } = useQuery(
    [CacheKey.TASKS, projectId],
    () => fetchTasks(projectId),
    {
      staleTime: 0,
      cacheTime: 0,
    }
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
 * @param {string} projectId - プロジェクトID
 * @returns {Promise<Map<string, Task>>} - タスクのマップオブジェクト
 */
const fetchTasks = async (projectId: string): Promise<Map<string, Task>> => {
  console.log('fetchTasks');
  const proxy = rendererContainer.get<ITaskProxy>(TYPES.TaskProxy);
  const result = await proxy.list(PAGEABLE, projectId);
  const taskMap = new Map<string, Task>();
  result.content.forEach((task) => {
    taskMap.set(task.id, task);
  });
  return taskMap;
};
