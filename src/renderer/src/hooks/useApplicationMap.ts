import rendererContainer from '@renderer/inversify.config';
import { Pageable } from '@shared/data/Page';
import { Application } from '@shared/data/Application';
import { TYPES } from '@renderer/types';
import { useQuery } from 'react-query';
import { IApplicationProxy } from '@renderer/services/IApplicationProxy';
import { CacheKey } from './cacheKey';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';

const PAGEABLE = new Pageable(0, Number.MAX_SAFE_INTEGER);
const EMPTY_MAP = new Map<string, Application>();

interface UseApplicationMapResult {
  applicationMap: Map<string, Application>;
  refresh: () => Promise<void>;
  error: unknown;
  isLoading: boolean;
}

/**
 * アプリケーション の全件を取得してマップにするフック。
 */
export const useApplicationMap: () => UseApplicationMapResult = () => {
  const loggerFactory = rendererContainer.get<ILoggerFactory>(TYPES.LoggerFactory);
  const logger = loggerFactory.getLogger({
    processType: 'renderer',
    loggerName: 'useApplicationMap',
  });
  logger.info('useApplicationMap');
  const { data, error, isLoading, refetch } = useQuery(CacheKey.PROJECTS, fetchApplications);
  const map = data ?? EMPTY_MAP;

  // 内部で refetch をラップする。
  // これにより refetch の戻り値の型が露出させない。機能的な意味はない。
  const refresh = async (): Promise<void> => {
    await refetch();
  };

  return { applicationMap: map, refresh, error, isLoading };
};

const fetchApplications = async (): Promise<Map<string, Application>> => {
  const loggerFactory = rendererContainer.get<ILoggerFactory>(TYPES.LoggerFactory);
  const logger = loggerFactory.getLogger({
    processType: 'renderer',
    loggerName: 'fetchApplications',
  });
  logger.info('fetchApplications');
  const proxy = rendererContainer.get<IApplicationProxy>(TYPES.ApplicationProxy);
  const result = await proxy.list(PAGEABLE);
  const labelMap = new Map<string, Application>();
  result.content.forEach((label) => {
    labelMap.set(label.id, label);
  });
  return labelMap;
};
