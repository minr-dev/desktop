import rendererContainer from '../../inversify.config';
import { Label } from '@shared/data/Label';
import { CRUDList, CRUDColumnData } from '../crud/CRUDList';
import { Chip } from '@mui/material';
import { useState } from 'react';
import { ILabelProxy } from '@renderer/services/ILabelProxy';
import { TYPES } from '@renderer/types';
import { Pageable } from '@shared/data/Page';
import { LabelEdit } from './LabelEdit';
import CircularProgress from '@mui/material/CircularProgress';
import { ICRUDProxy } from '@renderer/services/ICRUDProxy';
import { useFetchCRUDData } from '@renderer/hooks/useFetchCRUDData';

const buildColumnData = (overlaps: Partial<CRUDColumnData<Label>>): CRUDColumnData<Label> => {
  return {
    isKey: false,
    id: 'unknown',
    numeric: false,
    disablePadding: true,
    label: 'unknown',
    ...overlaps,
  };
};

const headCells: readonly CRUDColumnData<Label>[] = [
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
    callback: (data: Label): JSX.Element => {
      return <Chip label={data.color} sx={{ backgroundColor: data.color }} />;
    },
  }),
];

const DEFAULT_ORDER = 'name';
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
  const crudProxy = rendererContainer.get<ICRUDProxy<Label>>(TYPES.LabelProxy);
  const { page, isLoading } = useFetchCRUDData<Label>({ pageable, crudProxy });
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [labelId, setLabelId] = useState<string | null>(null);

  const handleAdd = async (): Promise<void> => {
    console.log('handleAdd');
    setLabelId(null);
    setDialogOpen(true);
  };

  const handleEdit = async (row: Label): Promise<void> => {
    setLabelId(row.id);
    setDialogOpen(true);
  };

  const handleDelete = async (row: Label): Promise<void> => {
    const LabelProxy = rendererContainer.get<ILabelProxy>(TYPES.LabelProxy);
    await LabelProxy.delete(row.id);
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

  const handleDialogSubmit = async (label: Label): Promise<void> => {
    console.log('LabelList handleDialogSubmit', label);
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
      <CRUDList<Label>
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
