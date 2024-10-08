import { useCallback, useEffect, useState } from 'react';
import { Page, Pageable } from '@shared/data/Page';
import { ICRUDProxy } from '@renderer/services/ICRUDProxy';
import rendererContainer from '../inversify.config';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';
import { TYPES } from '@renderer/types';

interface UseFetchCRUDListProps<T> {
  pageable: Pageable;
  crudProxy: ICRUDProxy<T>;
}

interface UseFetchCRUDListResult<T> {
  page: Page<T> | null;
  refreshPage: () => Promise<void>;
  isLoading: boolean;
}

/**
 * CRUD の一覧を取得するためのフック。
 */
export const useFetchCRUDData: <T>(props: UseFetchCRUDListProps<T>) => UseFetchCRUDListResult<T> = <
  T
>(
  props
) => {
  const { pageable, crudProxy } = props;
  const [page, setPage] = useState<Page<T> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loggerFactory = rendererContainer.get<ILoggerFactory>(TYPES.LoggerFactory);
  const logger = loggerFactory.getLogger({
    processType: 'renderer',
    loggerName: 'useFetchCRUDData',
  });

  const refreshPage = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    const newPage = await crudProxy.list(pageable);
    setPage(newPage);
    setIsLoading(false);
    if (logger.isDebugEnabled()) logger.debug(`fetched`);
  }, [crudProxy, pageable, logger]);

  useEffect(() => {
    refreshPage();
  }, [pageable, refreshPage]);

  return { page, refreshPage, isLoading };
};
