import rendererContainer from '@renderer/inversify.config';
import { Page, Pageable } from '@shared/data/Page';
import { ICRUDProxy } from '@renderer/services/ICRUDProxy';
import { Label } from '@shared/data/Label';
import { TYPES } from '@renderer/types';
import { useFetchCRUDData } from './useFetchCRUDData';
import { useLabelMap } from './useLabelMap';

interface UseLabelPageProps {
  pageable: Pageable;
}

interface UseLabelPageResult {
  page: Page<Label> | null;
  refreshPage: () => Promise<void>;
  isLoading: boolean;
}

/**
 * ラベル の全件を取得するためのフック。
 */
export const useLabelPage: (props: UseLabelPageProps) => UseLabelPageResult = ({ pageable }) => {
  const { refresh: refreshMap } = useLabelMap();
  const crudProxy = rendererContainer.get<ICRUDProxy<Label>>(TYPES.LabelProxy);
  const { page, refreshPage, isLoading } = useFetchCRUDData<Label>({
    pageable,
    crudProxy,
  });

  const wrapRefreshPage = async (): Promise<void> => {
    await refreshPage();
    await refreshMap();
  };

  return { page, refreshPage: wrapRefreshPage, isLoading };
};
