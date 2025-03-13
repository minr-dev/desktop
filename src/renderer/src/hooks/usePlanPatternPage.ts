import rendererContainer from '@renderer/inversify.config';
import { ICRUDProxy } from '@renderer/services/ICRUDProxy';
import { TYPES } from '@renderer/types';
import { Page, Pageable } from '@shared/data/Page';
import { PlanPattern } from '@shared/data/PlanPattern';
import { useFetchCRUDData } from './useFetchCRUDData';
import { usePlanPatternMap } from './usePlanPatternMap';

interface UsePlanPatternPageProps {
  pageable: Pageable;
}

interface UsePlanPatternPageResult {
  page: Page<PlanPattern> | null;
  refreshPage: () => Promise<void>;
  isLoading: boolean;
}

/**
 * パターン の全件を取得するためのフック。
 */
export const usePlanPatternPage: (props: UsePlanPatternPageProps) => UsePlanPatternPageResult = ({
  pageable,
}) => {
  const { refresh: refreshMap } = usePlanPatternMap();
  const crudProxy = rendererContainer.get<ICRUDProxy<PlanPattern>>(TYPES.PlanPatternProxy);
  const { page, refreshPage, isLoading } = useFetchCRUDData<PlanPattern>({
    pageable,
    crudProxy,
  });

  const wrapRefreshPage = async (): Promise<void> => {
    await refreshPage();
    await refreshMap();
  };

  return { page, refreshPage: wrapRefreshPage, isLoading };
};
