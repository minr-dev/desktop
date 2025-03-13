import rendererContainer from '../../inversify.config';
import { getLogger } from '@renderer/utils/LoggerUtil';
import { Pageable } from '@shared/data/Page';
import { useState } from 'react';
import { CRUDColumnData, CRUDList } from '../crud/CRUDList';
import { PlanPattern } from '@shared/data/PlanPattern';
import { PlanPatternEdit } from './PlanPatternEdit';
import { usePlanPatternPage } from '@renderer/hooks/usePlanPatternPage';
import { useCategoryMap } from '@renderer/hooks/useCategoryMap';
import { useLabelMap } from '@renderer/hooks/useLabelMap';
import { Chip, CircularProgress } from '@mui/material';
import { Label } from '@shared/data/Label';
import { IPlanPatternProxy } from '@renderer/services/IPlanPatternProxy';
import { TYPES } from '@renderer/types';
import { usePlanPatternMap } from '@renderer/hooks/usePlanPatternMap';

const logger = getLogger('PlanPatternList');

const DEFAULT_ORDER = 'name';
const DEFAULT_SORT_DIRECTION = 'asc';
const DEFAULT_PAGE_SIZE = 10;

export const PlanPatternList = (): JSX.Element => {
  logger.info('PlanPatternList start');
  const [pageable, setPageable] = useState<Pageable>(
    new Pageable(0, DEFAULT_PAGE_SIZE, {
      property: DEFAULT_ORDER,
      direction: DEFAULT_SORT_DIRECTION,
    })
  );
  const { page, isLoading } = usePlanPatternPage({ pageable });
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [patternId, setPatternId] = useState<string | null>(null);

  const { refresh } = usePlanPatternMap();
  const { categoryMap } = useCategoryMap();
  const { labelMap } = useLabelMap();

  const buildColumnData = (
    overlaps: Partial<CRUDColumnData<PlanPattern>>
  ): CRUDColumnData<PlanPattern> => {
    return {
      isKey: false,
      id: 'unknown',
      numeric: false,
      disablePadding: true,
      label: 'unknown',
      ...overlaps,
    };
  };

  const headCells: readonly CRUDColumnData<PlanPattern>[] = [
    buildColumnData({
      id: 'name',
      label: 'パターン名',
    }),
    buildColumnData({
      id: 'regularExpression',
      label: '正規表現',
    }),
    buildColumnData({
      id: 'categoryId',
      label: '関連カテゴリー',
      callback: (data: PlanPattern): JSX.Element => {
        const category = data.categoryId ? categoryMap.get(data.categoryId) : null;
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
      callback: (data: PlanPattern): JSX.Element => {
        const labels =
          data.labelIds
            ?.map((labelId) => labelMap.get(labelId))
            ?.filter((label): label is Label => label != null) ?? [];
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
    if (logger.isDebugEnabled()) logger.debug('handleAdd');
    setPatternId(null);
    setDialogOpen(true);
  };

  const handleEdit = async (row: PlanPattern): Promise<void> => {
    setPatternId(row.id);
    setDialogOpen(true);
  };

  /**
   * パターン削除
   *
   * @param row
   */
  const handleDelete = async (row: PlanPattern): Promise<void> => {
    const planPatternProxy = rendererContainer.get<IPlanPatternProxy>(TYPES.PlanPatternProxy);
    await planPatternProxy.delete(row.id);
    // データの最新化
    await refresh();
    setPageable(pageable.replacePageNumber(0));
  };

  /**
   * 選択したチェックボックスのパターン削除
   *
   * @param uniqueKeys
   */
  const handleBulkDelete = async (uniqueKeys: string[]): Promise<void> => {
    const planPatternProxy = rendererContainer.get<IPlanPatternProxy>(TYPES.PlanPatternProxy);
    await planPatternProxy.bulkDelete(uniqueKeys);
    // データの最新化
    await refresh();
    setPageable(pageable.replacePageNumber(0));
  };

  const handleChangePageable = async (newPageable: Pageable): Promise<void> => {
    if (logger.isDebugEnabled())
      logger.debug('PlanPatternList handleChangePageable newPageable', newPageable);
    setPageable(newPageable);
  };

  /**
   * ダイアログのクローズ
   */
  const handleDialogClose = (): void => {
    if (logger.isDebugEnabled()) logger.debug('PlanPatternList handleDialogClose');
    setDialogOpen(false);
  };

  /**
   * パターン追加・編集の送信
   *
   * @param planPattern
   */
  const handleDialogSubmit = async (planPattern: PlanPattern): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug('PlanPatternList handleDialogSubmit', planPattern);
    // データの最新化
    await refresh();
    setPageable(pageable.replacePageNumber(0));
  };

  if (isLoading) {
    if (logger.isDebugEnabled()) logger.debug('isLoading', isLoading);
    return <CircularProgress />;
  }

  if (page === null) {
    return <></>;
  }

  return (
    <>
      <CRUDList<PlanPattern>
        title={'予定パターン'}
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
        <PlanPatternEdit
          isOpen={isDialogOpen}
          patternId={patternId}
          onClose={handleDialogClose}
          onSubmit={handleDialogSubmit}
        />
      )}
    </>
  );
};
