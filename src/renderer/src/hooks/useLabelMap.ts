import rendererContainer from '@renderer/inversify.config';
import { Pageable } from '@shared/data/Page';
import { Label } from '@shared/data/Label';
import { TYPES } from '@renderer/types';
import { useQuery } from 'react-query';
import { ILabelProxy } from '@renderer/services/ILabelProxy';
import { CacheKey } from './cacheKey';
import { getLogger } from '@renderer/utils/LoggerUtil';

const PAGEABLE = new Pageable(0, Number.MAX_SAFE_INTEGER);

interface UseLabelMapResult {
  labelMap: Map<string, Label>;
  refresh: () => Promise<void>;
  error: unknown;
  isLoading: boolean;
}

const logger = getLogger('useLabelMap');

/**
 * ラベル の全件を取得してマップにするフック。
 */
export const useLabelMap: () => UseLabelMapResult = () => {
  if (logger.isDebugEnabled()) logger.debug('useLabelMap');
  const { data, error, isLoading, refetch } = useQuery(CacheKey.LABELS, fetchLabels);
  const labelMap = data ?? new Map<string, Label>();

  // 内部で refetch をラップする。
  // これにより refetch の戻り値の型が露出させない。機能的な意味はない。
  const refresh = async (): Promise<void> => {
    await refetch();
  };

  return { labelMap, refresh, error, isLoading };
};

const fetchLabels = async (): Promise<Map<string, Label>> => {
  const proxy = rendererContainer.get<ILabelProxy>(TYPES.LabelProxy);
  const result = await proxy.list(PAGEABLE);
  const labelMap = new Map<string, Label>();
  result.content.forEach((label) => {
    labelMap.set(label.id, label);
  });
  return labelMap;
};
