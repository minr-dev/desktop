import rendererContainer from '@renderer/inversify.config';
import { Page, Pageable } from '@shared/data/Page';
import { ICRUDProxy } from '@renderer/services/ICRUDProxy';
import { Category } from '@shared/data/Category';
import { TYPES } from '@renderer/types';
import { useFetchCRUDData } from './useFetchCRUDData';
import { useCategoryMap } from './useCategoryMap';

interface UseCategoryPageProps {
  pageable: Pageable;
}

interface UseCategoryPageResult {
  page: Page<Category> | null;
  refreshPage: () => Promise<void>;
  isLoading: boolean;
}

/**
 * カテゴリー の全件を取得するためのフック。
 */
export const useCategoryPage: (props: UseCategoryPageProps) => UseCategoryPageResult = ({
  pageable,
}) => {
  const { refresh: refreshMap } = useCategoryMap();
  const crudProxy = rendererContainer.get<ICRUDProxy<Category>>(TYPES.CategoryProxy);
  const { page, refreshPage, isLoading } = useFetchCRUDData<Category>({
    pageable,
    crudProxy,
  });

  const wrapRefreshPage = async (): Promise<void> => {
    await refreshPage();
    await refreshMap();
  };

  return { page, refreshPage: wrapRefreshPage, isLoading };
};
