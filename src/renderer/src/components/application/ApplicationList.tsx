import rendererContainer from '../../inversify.config';
import { Application } from '@shared/data/Application';
import { CRUDList, CRUDColumnData } from '../crud/CRUDList';
import { useState } from 'react';
import { IApplicationProxy } from '@renderer/services/IApplicationProxy';
import { TYPES } from '@renderer/types';
import { Pageable } from '@shared/data/Page';
import { ApplicationEdit } from './ApplicationEdit';
import CircularProgress from '@mui/material/CircularProgress';
import { useApplicationPage } from '@renderer/hooks/useApplicationPage';
import { useCategoryMap } from '@renderer/hooks/useCategoryMap';
import { Chip } from '@mui/material';
import { useProjectMap } from '@renderer/hooks/useProjectMap';
import { useLabelMap } from '@renderer/hooks/useLabelMap';
import { useApplicationMap } from '@renderer/hooks/useApplicationMap';

const DEFAULT_ORDER = 'basename';
const DEFAULT_SORT_DIRECTION = 'asc';
const DEFAULT_PAGE_SIZE = 10;

export const ApplicationList = (): JSX.Element => {
  console.log('ApplicationList start');
  const [pageable, setPageable] = useState<Pageable>(
    new Pageable(0, DEFAULT_PAGE_SIZE, {
      property: DEFAULT_ORDER,
      direction: DEFAULT_SORT_DIRECTION,
    })
  );
  const { page, isLoading } = useApplicationPage({ pageable });
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [ApplicationId, setApplicationId] = useState<string | null>(null);

  const { refresh } = useApplicationMap();
  const { projectMap } = useProjectMap();
  const { categoryMap } = useCategoryMap();
  const { labelMap } = useLabelMap();

  const buildColumnData = (
    overlaps: Partial<CRUDColumnData<Application>>
  ): CRUDColumnData<Application> => {
    return {
      isKey: false,
      id: 'unknown',
      numeric: false,
      disablePadding: true,
      label: 'unknown',
      ...overlaps,
    };
  };

  const headCells: readonly CRUDColumnData<Application>[] = [
    buildColumnData({
      id: 'basename',
      label: 'アプリケーション名',
    }),
    buildColumnData({
      id: 'relatedProjectId',
      label: '関連プロジェクト',
      callback: (data: Application): JSX.Element => {
        const project = projectMap.get(data.relatedProjectId);
        if (project == null) {
          return <></>;
        }
        return <Chip key={project.id} label={project.name} />;
      },
    }),
    buildColumnData({
      id: 'relatedCategoryId',
      label: '関連カテゴリー',
      callback: (data: Application): JSX.Element => {
        const category = categoryMap.get(data.relatedCategoryId);
        if (category == null) {
          return <></>;
        }
        return (
          <Chip
            key={category.id}
            label={category.name}
            style={{
              backgroundColor: category.color,
            }}
          />
        );
      },
    }),
    buildColumnData({
      id: 'relatedLabelIds',
      label: '関連ラベル',
      callback: (data: Application): JSX.Element => {
        const labels =
          data.relatedLabelIds
            ?.map((labelId) => labelMap.get(labelId))
            ?.filter((label) => label != null) ?? [];
        return (
          <>
            {labels.map((label) => (
              <Chip
                key={label.id}
                label={label.name}
                style={{
                  backgroundColor: label.color,
                }}
              />
            ))}
          </>
        );
      },
    }),
  ];

  const handleAdd = async (): Promise<void> => {
    console.log('handleAdd');
    setApplicationId(null);
    setDialogOpen(true);
  };

  const handleEdit = async (row: Application): Promise<void> => {
    setApplicationId(row.id);
    setDialogOpen(true);
  };

  /**
   * アプリケーション削除
   *
   * @param row
   */
  const handleDelete = async (row: Application): Promise<void> => {
    const ApplicationProxy = rendererContainer.get<IApplicationProxy>(TYPES.ApplicationProxy);
    await ApplicationProxy.delete(row.id);
    // データの最新化
    await refresh();
    setPageable(pageable.replacePageNumber(0));
  };

  /**
   * 選択したチェックボックスのアプリケーション削除
   *
   * @param uniqueKeys
   */
  const handleBulkDelete = async (uniqueKeys: string[]): Promise<void> => {
    const ApplicationProxy = rendererContainer.get<IApplicationProxy>(TYPES.ApplicationProxy);
    await ApplicationProxy.bulkDelete(uniqueKeys);
    // データの最新化
    await refresh();
    setPageable(pageable.replacePageNumber(0));
  };

  const handleChangePageable = async (newPageable: Pageable): Promise<void> => {
    console.log('ApplicationList handleChangePageable newPageable', newPageable);
    setPageable(newPageable);
  };

  /**
   * ダイアログのクローズ
   */
  const handleDialogClose = (): void => {
    console.log('ApplicationList handleDialogClose');
    setDialogOpen(false);
  };

  /**
   * アプリケーション追加・編集の送信
   *
   * @param Application
   */
  const handleDialogSubmit = async (Application: Application): Promise<void> => {
    console.log('ApplicationList handleDialogSubmit', Application);
    // データの最新化
    await refresh();
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
      <CRUDList<Application>
        title={'アプリケーション'}
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
        <ApplicationEdit
          isOpen={isDialogOpen}
          ApplicationId={ApplicationId}
          onClose={handleDialogClose}
          onSubmit={handleDialogSubmit}
        />
      )}
    </>
  );
};
