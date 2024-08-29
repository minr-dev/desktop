import rendererContainer from '@renderer/inversify.config';
import { Page, Pageable } from "@shared/data/Page";
import { Task } from "@shared/data/Task";
import { useTaskMap } from "./useTaskMap";
import { ICRUDProxy } from "@renderer/services/ICRUDProxy";
import { TYPES } from "@renderer/types";
import { useFetchCRUDData } from './useFetchCRUDData';

interface UseTaskPageProps {
  pageable: Pageable;
}

interface UseTaskPageResult {
  page: Page<Task> | null;
  refreshPage: () => Promise<void>;
  isLoading: boolean;
}

/**
 * タスクの全件を取得するためのフック
 * 
 * @param {UseTaskPageProps} props - ページング情報プロパティ
 * @returns {UseTaskPageResult}
 */
export const useTaskPage: (props: UseTaskPageProps) => UseTaskPageResult = ({
  pageable,
}) => {
  const { refresh: refreshMap } = useTaskMap();
  const crudProxy = rendererContainer.get<ICRUDProxy<Task>>(TYPES.TaskProxy);
  const { page, refreshPage, isLoading } = useFetchCRUDData<Task>({
    pageable,
    crudProxy,
  });

  const wrapRefreshPage = async (): Promise<void> => {
    await refreshPage();
    await refreshMap();
  };

  return { page, refreshPage: wrapRefreshPage, isLoading };
}
