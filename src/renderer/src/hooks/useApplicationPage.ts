import rendererContainer from '@renderer/inversify.config';
import { Page, Pageable } from '@shared/data/Page';
import { ICRUDProxy } from '@renderer/services/ICRUDProxy';
import { Application } from '@shared/data/Application';
import { TYPES } from '@renderer/types';
import { useFetchCRUDData } from './useFetchCRUDData';
import { useApplicationMap } from './useApplicationMap';

interface UseApplicationPageProps {
  pageable: Pageable;
}

interface UseApplicationPageResult {
  page: Page<Application> | null;
  refreshPage: () => Promise<void>;
  isLoading: boolean;
}

/**
 * アプリケーション の全件を取得するためのフック。
 */
export const useApplicationPage: (props: UseApplicationPageProps) => UseApplicationPageResult = ({
  pageable,
}) => {
  const { refresh: refreshMap } = useApplicationMap();
  const crudProxy = rendererContainer.get<ICRUDProxy<Application>>(TYPES.ApplicationProxy);
  const { page, refreshPage, isLoading } = useFetchCRUDData<Application>({
    pageable,
    crudProxy,
  });

  const wrapRefreshPage = async (): Promise<void> => {
    await refreshPage();
    await refreshMap();
  };

  return { page, refreshPage: wrapRefreshPage, isLoading };
};
