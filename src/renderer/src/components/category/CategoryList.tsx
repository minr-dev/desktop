import rendererContainer from '../../inversify.config';
import { Category } from '@shared/data/Category';
import { RowData, CrudList, ColumnData } from '../crud/CrudList';
import { Box, TableCell } from '@mui/material';
import { useEffect, useState } from 'react';
import { ICategoryProxy } from '@renderer/services/ICategoryProxy';
import { TYPES } from '@renderer/types';
import { Page, Pageable, PageSortDirection } from '@shared/data/Page';
import { PageSort } from '@shared/data/Page';

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
  const [page, setPage] = useState<Page<Category> | null>(null);

  const fetchData = async (pageable: Pageable): Promise<void> => {
    const categoryProxy = rendererContainer.get<ICategoryProxy>(TYPES.CategoryProxy);
    const newPage = await categoryProxy.list(pageable);
    setPage(newPage);
  };

  useEffect(() => {
    fetchData(pageable);
  }, [pageable]);

  const handleOpen = async (row: RowData): Promise<void> => {
    // TODO ダイアログを開いてキャンセル以外で閉じたら、proxy で更新して、再読み込みする
    setPageable(pageable.replacePageNumber(0));
  };

  const handleDelete = async (row: RowData): Promise<void> => {
    // TODO 削除処理未実装
    setPageable(pageable.replacePageNumber(0));
  };

  const handleChangePageable = async (newPageable: Pageable): Promise<void> => {
    setPageable(newPageable);
  };

  return (
    <CrudList
      title={'カテゴリー'}
      defaultPageable={pageable}
      defaultDense={false}
      isDenseEnabled={false}
      rows={page ? page.content.map((c) => new CategoryRowData(c)) : []}
      headCells={headCells}
      onOpen={handleOpen}
      onDelete={handleDelete}
      onChangePageable={handleChangePageable}
    />
  );
};
