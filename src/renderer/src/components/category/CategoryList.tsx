import rendererContainer from '../../inversify.config';
import { Category } from '@shared/data/Category';
import { CRUDList, CRUDColumnData } from '../crud/CRUDList';
import { Chip } from '@mui/material';
import { useState } from 'react';
import { ICategoryProxy } from '@renderer/services/ICategoryProxy';
import { TYPES } from '@renderer/types';
import { Pageable } from '@shared/data/Page';
import { CategoryEdit } from './CategoryEdit';
import CircularProgress from '@mui/material/CircularProgress';
import { ICRUDProxy } from '@renderer/services/ICRUDProxy';
import { useFetchCRUDData } from '@renderer/hooks/useFetchCRUDData';

const buildColumnData = (overlaps: Partial<CRUDColumnData<Category>>): CRUDColumnData<Category> => {
  return {
    isKey: false,
    id: 'unknown',
    numeric: false,
    disablePadding: true,
    label: 'unknown',
    ...overlaps,
  };
};

const headCells: readonly CRUDColumnData<Category>[] = [
  buildColumnData({
    id: 'name',
    label: 'カテゴリー名',
  }),
  buildColumnData({
    id: 'description',
    label: '説明',
  }),
  buildColumnData({
    id: 'color',
    label: 'カラー',
    callback: (data: Category): JSX.Element => {
      return <Chip label={data.color} sx={{ backgroundColor: data.color }} />;
    },
  }),
];

const DEFAULT_ORDER = 'name';
const DEFAULT_SORT_DIRECTION = 'asc';
const DEFAULT_PAGE_SIZE = 10;

export const CategoryList = (): JSX.Element => {
  console.log('CategoryList start');
  const [pageable, setPageable] = useState<Pageable>(
    new Pageable(0, DEFAULT_PAGE_SIZE, {
      property: DEFAULT_ORDER,
      direction: DEFAULT_SORT_DIRECTION,
    })
  );
  const crudProxy = rendererContainer.get<ICRUDProxy<Category>>(TYPES.CategoryProxy);
  const { page, isLoading } = useFetchCRUDData<Category>({ pageable, crudProxy });
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const handleAdd = async (): Promise<void> => {
    console.log('handleAdd');
    setCategoryId(null);
    setDialogOpen(true);
  };

  const handleEdit = async (row: Category): Promise<void> => {
    setCategoryId(row.id);
    setDialogOpen(true);
  };

  const handleDelete = async (row: Category): Promise<void> => {
    const categoryProxy = rendererContainer.get<ICategoryProxy>(TYPES.CategoryProxy);
    await categoryProxy.delete(row.id);
    setPageable(pageable.replacePageNumber(0));
  };

  const handleBulkDelete = async (uniqueKeys: string[]): Promise<void> => {
    const categoryProxy = rendererContainer.get<ICategoryProxy>(TYPES.CategoryProxy);
    await categoryProxy.bulkDelete(uniqueKeys);
    setPageable(pageable.replacePageNumber(0));
  };

  const handleChangePageable = async (newPageable: Pageable): Promise<void> => {
    console.log('CategoryList handleChangePageable newPageable', newPageable);
    setPageable(newPageable);
  };

  const handleDialogClose = (): void => {
    console.log('CategoryList handleDialogClose');
    setDialogOpen(false);
  };

  const handleDialogSubmit = async (category: Category): Promise<void> => {
    console.log('CategoryList handleDialogSubmit', category);
    setPageable(pageable.replacePageNumber(0));
  };

  if (isLoading) {
    console.log('isLoading', isLoading);
    return <CircularProgress />;
  }

  if (page === null) {
    return <></>;
  }

  return (
    <>
      <CRUDList<Category>
        title={'カテゴリー'}
        page={page}
        dense={false}
        isDenseEnabled={false}
        headCells={headCells}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onChangePageable={handleChangePageable}
      />
      {isDialogOpen && (
        <CategoryEdit
          isOpen={isDialogOpen}
          categoryId={categoryId}
          onClose={handleDialogClose}
          onSubmit={handleDialogSubmit}
        />
      )}
    </>
  );
};
