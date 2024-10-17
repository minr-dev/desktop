import rendererContainer from '@renderer/inversify.config';
import { Page, Pageable } from '@shared/data/Page';
import { ICRUDProxy } from '@renderer/services/ICRUDProxy';
import { TYPES } from '@renderer/types';
import { useFetchCRUDData } from './useFetchCRUDData';
import { Pattern } from '@shared/data/Pattern';
import { usePatternMap } from './usePatternMap';

interface UsePatternPageProps {
  pageable: Pageable;
}

interface UsePatternPageResult {
  page: Page<Pattern> | null;
  refreshPage: () => Promise<void>;
  isLoading: boolean;
}

/**
 * パターン の全件を取得するためのフック。
 */
export const usePatternPage: (props: UsePatternPageProps) => UsePatternPageResult = ({
  pageable,
}) => {
  const { refresh: refreshMap } = usePatternMap();
  const crudProxy = rendererContainer.get<ICRUDProxy<Pattern>>(TYPES.PatternProxy);
  const { page, refreshPage, isLoading } = useFetchCRUDData<Pattern>({
    pageable,
    crudProxy,
  });

  const wrapRefreshPage = async (): Promise<void> => {
    await refreshPage();
    await refreshMap();
  };

  return { page, refreshPage: wrapRefreshPage, isLoading };
};
