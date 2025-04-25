import rendererContainer from '@renderer/inversify.config';
import { useQuery } from 'react-query';
import { IPlanTemplateProxy } from '@renderer/services/IPlanTemplateProxy';
import { TYPES } from '@renderer/types';
import { Pageable } from '@shared/data/Page';
import { PlanTemplate } from '@shared/data/PlanTemplate';
import { CacheKey } from './cacheKey';
import { getLogger } from '@renderer/utils/LoggerUtil';

const PAGEABLE = new Pageable(0, Number.MAX_SAFE_INTEGER);
const EMPTY_MAP = new Map<string, PlanTemplate>();

interface UsePlanTemplateMapResult {
  planTemplateMap: Map<string, PlanTemplate>;
  refresh: () => Promise<void>;
  error: unknown;
  isLoading: boolean;
}

const logger = getLogger('usePlanTemplateMap');

/**
 * 予定テンプレート の全件を取得してマップにするフック。
 */
export const usePlanTemplateMap: () => UsePlanTemplateMapResult = () => {
  if (logger.isDebugEnabled()) logger.debug('usePlanTemplateMap');
  const { data, error, isLoading, refetch } = useQuery(CacheKey.PLAN_TEMPLATES, fetchPlanTemplates);
  const map = data ?? EMPTY_MAP;

  // 内部で refetch をラップする。
  // これにより refetch の戻り値の型が露出させない。機能的な意味はない。
  const refresh = async (): Promise<void> => {
    await refetch();
  };

  return { planTemplateMap: map, refresh, error, isLoading };
};

const fetchPlanTemplates = async (): Promise<Map<string, PlanTemplate>> => {
  if (logger.isDebugEnabled()) logger.debug('fetchPlanTemplates');
  const proxy = rendererContainer.get<IPlanTemplateProxy>(TYPES.PlanTemplateProxy);
  const result = await proxy.list(PAGEABLE);
  const planTemplateMap = new Map<string, PlanTemplate>();
  result.content.forEach((template) => {
    planTemplateMap.set(template.id, template);
  });
  return planTemplateMap;
};
