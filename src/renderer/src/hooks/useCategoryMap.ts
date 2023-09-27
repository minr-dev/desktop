import rendererContainer from '@renderer/inversify.config';
import { Pageable } from '@shared/data/Page';
import { Category } from '@shared/data/Category';
import { TYPES } from '@renderer/types';
import { useQuery } from 'react-query';
import { ICategoryProxy } from '@renderer/services/ICategoryProxy';
import { CacheKey } from './cacheKey';

const PAGEABLE = new Pageable(0, Number.MAX_SAFE_INTEGER);

interface UseCategoryMapResult {
  categoryMap: Map<string, Category>;
  refresh: () => Promise<void>;
  error: unknown;
  isLoading: boolean;
}

/**
 * カテゴリー の全件を取得してマップにするフック。
 */
export const useCategoryMap: () => UseCategoryMapResult = () => {
  console.log('useCategoryMap');
  const { data, error, isLoading, refetch } = useQuery(CacheKey.CATEGORIES, fetchCategories);
  const categoryMap = data ?? new Map<string, Category>();

  // 内部で refetch をラップする。
  // これにより refetch の戻り値の型が露出させない。機能的な意味はない。
  const refresh = async (): Promise<void> => {
    await refetch();
  };

  return { categoryMap, refresh, error, isLoading };
};

const fetchCategories = async (): Promise<Map<string, Category>> => {
  const proxy = rendererContainer.get<ICategoryProxy>(TYPES.CategoryProxy);
  const result = await proxy.list(PAGEABLE);
  const categoryMap = new Map<string, Category>();
  result.content.forEach((category) => {
    categoryMap.set(category.id, category);
  });
  return categoryMap;
};
