import { CircularProgress } from '@mui/material';
import { useTaskMap } from '@renderer/hooks/useTaskMap';
import { useTaskPage } from '@renderer/hooks/useTaskPage';
import { ITaskProxy } from '@renderer/services/ITaskProxy';
import { TYPES } from '@renderer/types';
import { Pageable } from '@shared/data/Page';
import { Task } from '@shared/data/Task';
import { useState } from 'react';
import rendererContainer from '../../inversify.config';
import { CRUDColumnData, CRUDList } from '../crud/CRUDList';
import { TaskEdit } from './TaskEdit';
import { useProjectMap } from '@renderer/hooks/useProjectMap';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';

const DEFAULT_ORDER = 'name';
const DEFAULT_SORT_DIRECTION = 'asc';
const DEFAULT_PAGE_SIZE = 10;

/**
 * 設定-タスク画面コンポーネント
 *
 * 設定のタスクを表示する。
 *
 * (表示内容)
 * ・追加ボタン
 * ・ラベルリスト
 *     - 選択チェックボックス
 *     - タスク情報
 *     - 編集ボタン
 *     - 削除ボタン
 * ・ページネーション
 *
 * @returns {JSX.Element} - タスク画面コンポーネント
 */
export const TaskList = (): JSX.Element => {
  const loggerFactory = rendererContainer.get<ILoggerFactory>(TYPES.LoggerFactory);
  const logger = loggerFactory.getLogger({ processType: 'renderer', loggerName: 'TaskList' });
  logger.info('TaskList start');
  const [pageable, setPageable] = useState<Pageable>(
    new Pageable(0, DEFAULT_PAGE_SIZE, {
      property: DEFAULT_ORDER,
      direction: DEFAULT_SORT_DIRECTION,
    })
  );
  const { refresh } = useTaskMap();
  const { projectMap } = useProjectMap();
  const { page, isLoading } = useTaskPage({ pageable });
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);

  /**
   * カラムデータ作成
   *
   * @param {Partial<CRUDColumnData<Task>>} overlaps - 追加カラム
   * @returns {CRUDColumnData<Task>}
   */
  const buildColumnData = (overlaps: Partial<CRUDColumnData<Task>>): CRUDColumnData<Task> => {
    return {
      isKey: false,
      id: 'unknown',
      numeric: false,
      disablePadding: true,
      label: 'unknown',
      ...overlaps,
    };
  };

  /**
   * ヘッダーの作成
   */
  const headCells: readonly CRUDColumnData<Task>[] = [
    buildColumnData({
      id: 'name',
      label: 'タスク名',
    }),
    buildColumnData({
      id: 'projectName',
      label: '関連プロジェクト',
      callback: (data: Task): JSX.Element => {
        const project = projectMap.get(data.projectId);
        if (project == null) {
          return <></>;
        }
        return <>{project.name}</>;
      },
    }),
    buildColumnData({
      id: 'description',
      label: '説明',
    }),
  ];

  /**
   * タスク追加ハンドラー
   */
  const handleAdd = async (): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug('handleAdd');
    setTaskId(null);
    setDialogOpen(true);
  };

  /**
   * タスク編集ハンドラー
   */
  const handleEdit = async (row: Task): Promise<void> => {
    setTaskId(row.id);
    setDialogOpen(true);
  };

  /**
   * タスク削除ハンドラー
   *
   * @param {Task} row - タスクオブジェクト
   */
  const handleDelete = async (row: Task): Promise<void> => {
    const TaskProxy = rendererContainer.get<ITaskProxy>(TYPES.TaskProxy);
    await TaskProxy.delete(row.id);
    await refresh();
    setPageable(pageable.replacePageNumber(0));
  };

  /**
   * タスク削除ハンドラー
   *
   * @param {string[]} uniqueKeys - タスクID配列
   */
  const handleBulkDelete = async (uniqueKeys: string[]): Promise<void> => {
    const TaskProxy = rendererContainer.get<ITaskProxy>(TYPES.TaskProxy);
    await TaskProxy.bulkDelete(uniqueKeys);
    await refresh();
    setPageable(pageable.replacePageNumber(0));
  };

  /**
   * ページ変更ハンドラー
   *
   * @param {Pageable} newPageable - 新しいページのオブジェクト
   */
  const handleChangePageable = async (newPageable: Pageable): Promise<void> => {
    if (logger.isDebugEnabled())
      logger.debug(`TaskList handleChangePageable newPageable: ${newPageable}`);
    setPageable(newPageable);
  };

  /**
   * ダイアログのクローズ用ハンドラー
   */
  const handleDialogClose = (): void => {
    if (logger.isDebugEnabled()) logger.debug('TaskList handleDialogClose');
    setDialogOpen(false);
  };

  /**
   * ダイアログの送信用ハンドラー
   *
   * @param {Task} task - タスクオブジェクト
   */
  const handleDialogSubmit = async (task: Task): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug(`TaskList handleDialogSubmit: ${task}`);
    await refresh();
    setPageable(pageable.replacePageNumber(0));
  };

  if (isLoading) {
    if (logger.isDebugEnabled()) logger.debug(`isLoading: ${isLoading}`);
    return <CircularProgress />;
  }

  if (page === null) {
    return <></>;
  }

  return (
    <>
      <CRUDList<Task>
        title={'タスク'}
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
        <TaskEdit
          isOpen={isDialogOpen}
          taskId={taskId}
          onClose={handleDialogClose}
          onSubmit={handleDialogSubmit}
        />
      )}
    </>
  );
};
