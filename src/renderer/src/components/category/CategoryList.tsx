import rendererContainer from '../../inversify.config';
import { Category } from '@shared/data/Category';
import { RowData, CRUDList, ColumnData } from '../crud/CRUDList';
import { CRUDFormDialog } from '../crud/CRUDFormDialog';
import { Box, TableCell } from '@mui/material';
import { useEffect, useState } from 'react';
import { ICategoryProxy } from '@renderer/services/ICategoryProxy';
import { TYPES } from '@renderer/types';
import { Page, Pageable } from '@shared/data/Page';
import { CategoryEdit } from './CategoryEdit';

class CategoryRowData implements RowData {
  constructor(readonly item: Category) {}

  uniqueKey(): string {
    return this.item.id;
  }
}

const buildColumnData = (overlaps: Partial<ColumnData>): ColumnData => {
  return {
    isKey: false,
    id: 'unknown',
    numeric: false,
    disablePadding: true,
    label: 'unknown',
    ...overlaps,
  };
};

const headCells: readonly ColumnData[] = [
  buildColumnData({
    isKey: true,
    id: 'id',
    label: 'カテゴリーID',
  }),
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
    callback: (data: CategoryRowData): JSX.Element => {
      return (
        <TableCell scope="row" padding={'none'}>
          <Box sx={{ backgroundColor: data.item.color }}>{data.item.color}</Box>
        </TableCell>
      );
    },
  }),
];

const DEFAULT_ORDER = 'id';
const DEFAULT_SORT_DIRECTION = 'asc';
const DEFAULT_PAGE_SIZE = 10;

export const CategoryList = (): JSX.Element => {
  const [pageable, setPageable] = useState<Pageable>(
    new Pageable(0, DEFAULT_PAGE_SIZE, {
      property: DEFAULT_ORDER,
      direction: DEFAULT_SORT_DIRECTION,
    })
  );
  const [page, setPage] = useState<Page<CategoryRowData> | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const fetchData = async (pageable: Pageable): Promise<void> => {
    const categoryProxy = rendererContainer.get<ICategoryProxy>(TYPES.CategoryProxy);
    const newPage = await categoryProxy.list(pageable);
    const convContent = newPage.content.map((c) => new CategoryRowData(c));
    const pageCategoryRowData = new Page<CategoryRowData>(
      convContent,
      newPage.totalElements,
      newPage.pageable
    );
    setPage(pageCategoryRowData);
  };

  useEffect(() => {
    fetchData(pageable);
  }, [pageable]);

  const handleAdd = async (): Promise<void> => {
    console.log('handleAdd');
    setCategoryId(null);
    setDialogOpen(true);
  };

  const handleEdit = async (row: RowData): Promise<void> => {
    setCategoryId(row.item.id);
    setDialogOpen(true);
  };

  const handleDelete = async (row: RowData): Promise<void> => {
    const categoryProxy = rendererContainer.get<ICategoryProxy>(TYPES.CategoryProxy);
    await categoryProxy.delete(row.item.id);
    setPageable(pageable.replacePageNumber(0));
  };

  const handleBulkDelete = async (uniqueKeys: string[]): Promise<void> => {
    const categoryProxy = rendererContainer.get<ICategoryProxy>(TYPES.CategoryProxy);
    await categoryProxy.bulkDelete(uniqueKeys);
    setPageable(pageable.replacePageNumber(0));
  };

  const handleChangePageable = async (newPageable: Pageable): Promise<void> => {
    setPageable(newPageable);
  };

  const handleDialogClose = (): void => {
    console.log('CategoryList handleDialogClose');
    setDialogOpen(false);
  };

  const handleDialogSubmit = async (category: Category): Promise<void> => {
    console.log('CategoryList handleDialogSubmit', category);
    const categoryProxy = rendererContainer.get<ICategoryProxy>(TYPES.CategoryProxy);
    await categoryProxy.save(category);
    setPageable(pageable.replacePageNumber(0));
  };

  return (
    <>
      <CRUDList
        title={'カテゴリー'}
        defaultPageable={pageable}
        defaultDense={false}
        isDenseEnabled={false}
        page={page}
        headCells={headCells}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onChangePageable={handleChangePageable}
      />
      <CategoryEdit
        isOpen={isDialogOpen}
        categoryId={categoryId}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
      />
    </>
  );
};
