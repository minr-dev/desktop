import rendererContainer from '@renderer/inversify.config';
import { useQuery } from 'react-query';
import { IPlanPatternProxy } from '@renderer/services/IPlanPatternProxy';
import { TYPES } from '@renderer/types';
import { Pageable } from '@shared/data/Page';
import { PlanPattern } from '@shared/data/PlanPattern';
import { CacheKey } from './cacheKey';

const PAGEABLE = new Pageable(0, Number.MAX_SAFE_INTEGER);
const EMPTY_MAP = new Map<string, PlanPattern>();

interface UsePlanPatternMapResult {
  planPatternMap: Map<string, PlanPattern>;
  refresh: () => Promise<void>;
  error: unknown;
  isLoading: boolean;
}

/**
 * 予定パターン の全件を取得してマップにするフック。
 */
export const usePlanPatternMap: () => UsePlanPatternMapResult = () => {
  console.log('usePlanPatternMap');
  const { data, error, isLoading, refetch } = useQuery(CacheKey.PATTERN, fetchPlanPatterns);
  const map = data ?? EMPTY_MAP;

  // 内部で refetch をラップする。
  // これにより refetch の戻り値の型が露出させない。機能的な意味はない。
  const refresh = async (): Promise<void> => {
    await refetch();
  };

  return { planPatternMap: map, refresh, error, isLoading };
};

const fetchPlanPatterns = async (): Promise<Map<string, PlanPattern>> => {
  console.log('fetchPlanPatterns');
  const proxy = rendererContainer.get<IPlanPatternProxy>(TYPES.PlanPatternProxy);
  const result = await proxy.list(PAGEABLE);
  const planPatternMap = new Map<string, PlanPattern>();
  result.content.forEach((pattern) => {
    planPatternMap.set(pattern.id, pattern);
  });
  return planPatternMap;
};
