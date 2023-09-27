import rendererContainer from '@renderer/inversify.config';
import { Page, Pageable } from '@shared/data/Page';
import { ICRUDProxy } from '@renderer/services/ICRUDProxy';
import { Project } from '@shared/data/Project';
import { TYPES } from '@renderer/types';
import { useFetchCRUDData } from './useFetchCRUDData';
import { useProjectMap } from './useProjectMap';

interface UseProjectPageProps {
  pageable: Pageable;
}

interface UseProjectPageResult {
  page: Page<Project> | null;
  refreshPage: () => Promise<void>;
  isLoading: boolean;
}

/**
 * ラベル の全件を取得するためのフック。
 */
export const useProjectPage: (props: UseProjectPageProps) => UseProjectPageResult = ({
  pageable,
}) => {
  const { refresh: refreshMap } = useProjectMap();
  const crudProxy = rendererContainer.get<ICRUDProxy<Project>>(TYPES.ProjectProxy);
  const { page, refreshPage, isLoading } = useFetchCRUDData<Project>({
    pageable,
    crudProxy,
  });

  const wrapRefreshPage = async (): Promise<void> => {
    await refreshPage();
    await refreshMap();
  };

  return { page, refreshPage: wrapRefreshPage, isLoading };
};
