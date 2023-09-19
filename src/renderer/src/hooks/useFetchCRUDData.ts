import { useEffect, useState } from 'react';
import { Page, Pageable } from '@shared/data/Page';
import { ICRUDProxy } from '@renderer/services/ICRUDProxy';

interface UseFetchCRUDListProps<T> {
  pageNumber: number;
  pageSize: number;
  crudProxy: ICRUDProxy<T>;
}

interface UseFetchCRUDListResult<T> {
  page: Page<T> | null;
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
  const { pageNumber, pageSize, crudProxy } = props;
  const [page, setPage] = useState<Page<T> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const pageable = new Pageable(pageNumber, pageSize);
      setIsLoading(true);
      const newPage = await crudProxy.list(pageable);
      setPage(newPage);
      setIsLoading(false);
      console.log('fetched');
    };

    fetchData();
  }, [pageNumber, pageSize, crudProxy]);

  return { page, isLoading };
};
