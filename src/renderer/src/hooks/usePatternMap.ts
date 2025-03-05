import rendererContainer from '@renderer/inversify.config';
import { Pageable } from '@shared/data/Page';
import { TYPES } from '@renderer/types';
import { useQuery } from 'react-query';
import { CacheKey } from './cacheKey';
import { IPatternProxy } from '@renderer/services/IPatternProxy';
import { Pattern } from '@shared/data/Pattern';
import { getLogger } from '@renderer/utils/LoggerUtil';

const PAGEABLE = new Pageable(0, Number.MAX_SAFE_INTEGER);
const EMPTY_MAP = new Map<string, Pattern>();

interface UsePatternMapResult {
  patternMap: Map<string, Pattern>;
  refresh: () => Promise<void>;
  error: unknown;
  isLoading: boolean;
}

const logger = getLogger('usePatternMap');

/**
 * パターン の全件を取得してマップにするフック。
 */
export const usePatternMap: () => UsePatternMapResult = () => {
  if (logger.isDebugEnabled()) logger.debug('usePatternMap');
  const { data, error, isLoading, refetch } = useQuery(CacheKey.PATTERN, fetchPatterns);
  const map = data ?? EMPTY_MAP;

  // 内部で refetch をラップする。
  // これにより refetch の戻り値の型が露出させない。機能的な意味はない。
  const refresh = async (): Promise<void> => {
    await refetch();
  };

  return { patternMap: map, refresh, error, isLoading };
};

const fetchPatterns = async (): Promise<Map<string, Pattern>> => {
  if (logger.isDebugEnabled()) logger.debug('fetchPatterns');
  const proxy = rendererContainer.get<IPatternProxy>(TYPES.PatternProxy);
  const result = await proxy.list(PAGEABLE);
  const patternMap = new Map<string, Pattern>();
  result.content.forEach((pattern) => {
    patternMap.set(pattern.id, pattern);
  });
  return patternMap;
};
