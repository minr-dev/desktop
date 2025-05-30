import rendererContainer from '@renderer/inversify.config';
import { ICRUDProxy } from '@renderer/services/ICRUDProxy';
import { TYPES } from '@renderer/types';
import { Page, Pageable } from '@shared/data/Page';
import { PlanTemplate } from '@shared/data/PlanTemplate';
import { useFetchCRUDData } from './useFetchCRUDData';
import { usePlanTemplateMap } from './usePlanTemplateMap';

interface UsePlanTemplatePageProps {
  pageable: Pageable;
}

interface UsePlanTemplatePageResult {
  page: Page<PlanTemplate> | null;
  refreshPage: () => Promise<void>;
  isLoading: boolean;
}

/**
 * 予定テンプレート の全件を取得するためのフック。
 */
export const usePlanTemplatePage: (
  props: UsePlanTemplatePageProps
) => UsePlanTemplatePageResult = ({ pageable }) => {
  const { refresh: refreshMap } = usePlanTemplateMap();
  const crudProxy = rendererContainer.get<ICRUDProxy<PlanTemplate>>(TYPES.PlanTemplateProxy);
  const { page, refreshPage, isLoading } = useFetchCRUDData<PlanTemplate>({
    pageable,
    crudProxy,
  });

  const wrapRefreshPage = async (): Promise<void> => {
    await refreshPage();
    await refreshMap();
  };

  return { page, refreshPage: wrapRefreshPage, isLoading };
};
