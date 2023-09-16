import rendererContainer from '../../inversify.config';
import { Label } from '@shared/data/Label';
import { RowData, CRUDList, ColumnData } from '../crud/CRUDList';
import { Chip } from '@mui/material';
import { useEffect, useState } from 'react';
import { ILabelProxy } from '@renderer/services/ILabelProxy';
import { TYPES } from '@renderer/types';
import { Page, Pageable } from '@shared/data/Page';
import { LabelEdit } from './LabelEdit';
import CircularProgress from '@mui/material/CircularProgress';

class LabelRowData implements RowData {
  constructor(readonly item: Label) {}

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
    label: 'ラベルID',
  }),
  buildColumnData({
    id: 'name',
    label: 'ラベル名',
  }),
  buildColumnData({
    id: 'description',
    label: '説明',
  }),
  buildColumnData({
    id: 'color',
    label: 'カラー',
    callback: (data: LabelRowData): JSX.Element => {
      return <Chip label={data.item.color} sx={{ backgroundColor: data.item.color }} />;
    },
  }),
];

const DEFAULT_ORDER = 'id';
const DEFAULT_SORT_DIRECTION = 'asc';
const DEFAULT_PAGE_SIZE = 10;

export const LabelList = (): JSX.Element => {
  console.log('LabelList start');
  const [pageable, setPageable] = useState<Pageable>(
    new Pageable(0, DEFAULT_PAGE_SIZE, {
      property: DEFAULT_ORDER,
      direction: DEFAULT_SORT_DIRECTION,
    })
  );
  const [page, setPage] = useState<Page<LabelRowData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [labelId, setLabelId] = useState<string | null>(null);

  const fetchData = async (pageable: Pageable): Promise<void> => {
    setIsLoading(true);
    const LabelProxy = rendererContainer.get<ILabelProxy>(TYPES.LabelProxy);
    const newPage = await LabelProxy.list(pageable);
    const convContent = newPage.content.map((c) => new LabelRowData(c));
    const pageLabelRowData = new Page<LabelRowData>(
      convContent,
      newPage.totalElements,
      newPage.pageable
    );
    setPage(pageLabelRowData);
    setIsLoading(false);
    console.log('LabelList fetchData', pageLabelRowData);
  };

  useEffect(() => {
    fetchData(pageable);
  }, [pageable]);

  const handleAdd = async (): Promise<void> => {
    console.log('handleAdd');
    setLabelId(null);
    setDialogOpen(true);
  };

  const handleEdit = async (row: RowData): Promise<void> => {
    setLabelId(row.item.id);
    setDialogOpen(true);
  };

  const handleDelete = async (row: RowData): Promise<void> => {
    const LabelProxy = rendererContainer.get<ILabelProxy>(TYPES.LabelProxy);
    await LabelProxy.delete(row.item.id);
    setPageable(pageable.replacePageNumber(0));
  };

  const handleBulkDelete = async (uniqueKeys: string[]): Promise<void> => {
    const LabelProxy = rendererContainer.get<ILabelProxy>(TYPES.LabelProxy);
    await LabelProxy.bulkDelete(uniqueKeys);
    setPageable(pageable.replacePageNumber(0));
  };

  const handleChangePageable = async (newPageable: Pageable): Promise<void> => {
    console.log('LabelList handleChangePageable newPageable', newPageable);
    setPageable(newPageable);
  };

  const handleDialogClose = (): void => {
    console.log('LabelList handleDialogClose');
    setDialogOpen(false);
  };

  const handleDialogSubmit = async (Label: Label): Promise<void> => {
    console.log('LabelList handleDialogSubmit', Label);
    const LabelProxy = rendererContainer.get<ILabelProxy>(TYPES.LabelProxy);
    await LabelProxy.save(Label);
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
      <CRUDList
        title={'ラベル'}
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
        <LabelEdit
          isOpen={isDialogOpen}
          labelId={labelId}
          onClose={handleDialogClose}
          onSubmit={handleDialogSubmit}
        />
      )}
    </>
  );
};
