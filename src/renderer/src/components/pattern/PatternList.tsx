import rendererContainer from '../../inversify.config';
import { CRUDList, CRUDColumnData } from '../crud/CRUDList';
import { useState } from 'react';
import { TYPES } from '@renderer/types';
import { Pageable } from '@shared/data/Page';
import { PatternEdit } from './PatternEdit';
import CircularProgress from '@mui/material/CircularProgress';
import { usePatternPage } from '@renderer/hooks/usePatternPage';
import { useCategoryMap } from '@renderer/hooks/useCategoryMap';
import { Chip } from '@mui/material';
import { useProjectMap } from '@renderer/hooks/useProjectMap';
import { useLabelMap } from '@renderer/hooks/useLabelMap';
import { usePatternMap } from '@renderer/hooks/usePatternMap';
import { Label } from '@shared/data/Label';
import { Pattern } from '@shared/data/Pattern';
import { IPatternProxy } from '@renderer/services/IPatternProxy';
import { useTaskMap } from '@renderer/hooks/useTaskMap';
import { getLogger } from '@renderer/utils/LoggerUtil';

const DEFAULT_ORDER = 'basename';
const DEFAULT_SORT_DIRECTION = 'asc';
const DEFAULT_PAGE_SIZE = 10;

const logger = getLogger('PatternList');

export const PatternList = (): JSX.Element => {
  logger.info('PatternList start');
  const [pageable, setPageable] = useState<Pageable>(
    new Pageable(0, DEFAULT_PAGE_SIZE, {
      property: DEFAULT_ORDER,
      direction: DEFAULT_SORT_DIRECTION,
    })
  );
  const { page, isLoading } = usePatternPage({ pageable });
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [patternId, setPatternId] = useState<string | null>(null);

  const { refresh } = usePatternMap();
  const { projectMap } = useProjectMap();
  const { categoryMap } = useCategoryMap();
  const { labelMap } = useLabelMap();
  const { taskMap } = useTaskMap();

  const buildColumnData = (overlaps: Partial<CRUDColumnData<Pattern>>): CRUDColumnData<Pattern> => {
    return {
      isKey: false,
      id: 'unknown',
      numeric: false,
      disablePadding: true,
      label: 'unknown',
      ...overlaps,
    };
  };

  const headCells: readonly CRUDColumnData<Pattern>[] = [
    buildColumnData({
      id: 'name',
      label: 'パターン名',
    }),
    buildColumnData({
      id: 'basename',
      label: 'アプリケーション名',
    }),
    buildColumnData({
      id: 'regularExpression',
      label: '正規表現',
    }),
    buildColumnData({
      id: 'projectId',
      label: '関連プロジェクト',
      callback: (data: Pattern): JSX.Element => {
        const project = data.projectId ? projectMap.get(data.projectId) : null;
        if (project == null) {
          return <></>;
        }
        return <Chip key={project.id} label={project.name} />;
      },
    }),
    buildColumnData({
      id: 'categoryId',
      label: '関連カテゴリー',
      callback: (data: Pattern): JSX.Element => {
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
      callback: (data: Pattern): JSX.Element => {
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
    buildColumnData({
      id: 'taskId',
      label: '関連タスク',
      callback: (data: Pattern): JSX.Element => {
        const task = data.taskId ? taskMap.get(data.taskId) : null;
        if (task == null) {
          return <></>;
        }
        return <Chip key={task.id} label={task.name} />;
      },
    }),
  ];

  const handleAdd = async (): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug('handleAdd');
    setPatternId(null);
    setDialogOpen(true);
  };

  const handleEdit = async (row: Pattern): Promise<void> => {
    setPatternId(row.id);
    setDialogOpen(true);
  };

  /**
   * パターン削除
   *
   * @param row
   */
  const handleDelete = async (row: Pattern): Promise<void> => {
    const patternProxy = rendererContainer.get<IPatternProxy>(TYPES.PatternProxy);
    await patternProxy.delete(row.id);
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
    const patternProxy = rendererContainer.get<IPatternProxy>(TYPES.PatternProxy);
    await patternProxy.bulkDelete(uniqueKeys);
    // データの最新化
    await refresh();
    setPageable(pageable.replacePageNumber(0));
  };

  const handleChangePageable = async (newPageable: Pageable): Promise<void> => {
    if (logger.isDebugEnabled())
      logger.debug('PatternList handleChangePageable newPageable', newPageable);
    setPageable(newPageable);
  };

  /**
   * ダイアログのクローズ
   */
  const handleDialogClose = (): void => {
    if (logger.isDebugEnabled()) logger.debug('PatternList handleDialogClose');
    setDialogOpen(false);
  };

  /**
   * パターン追加・編集の送信
   *
   * @param pattern
   */
  const handleDialogSubmit = async (pattern: Pattern): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug('PatternList handleDialogSubmit', pattern);
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
      <CRUDList<Pattern>
        title={'アクティビティパターン'}
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
        <PatternEdit
          isOpen={isDialogOpen}
          patternId={patternId}
          onClose={handleDialogClose}
          onSubmit={handleDialogSubmit}
        />
      )}
    </>
  );
};
