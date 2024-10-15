import rendererContainer from '../../inversify.config';
import { Project } from '@shared/data/Project';
import { CRUDList, CRUDColumnData } from '../crud/CRUDList';
import { useState } from 'react';
import { IProjectProxy } from '@renderer/services/IProjectProxy';
import { TYPES } from '@renderer/types';
import { Pageable } from '@shared/data/Page';
import { ProjectEdit } from './ProjectEdit';
import CircularProgress from '@mui/material/CircularProgress';
import { useProjectMap } from '@renderer/hooks/useProjectMap';
import { useProjectPage } from '@renderer/hooks/useProjectPage';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';

/**
 * カラムデータ作成
 *
 * @param overlaps: Partial<CRUDColumnData<Project>>
 * @returns CRUDColumnData<Project>
 */
const buildColumnData = (overlaps: Partial<CRUDColumnData<Project>>): CRUDColumnData<Project> => {
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
const headCells: readonly CRUDColumnData<Project>[] = [
  buildColumnData({
    id: 'name',
    label: 'プロジェクト名',
  }),
  buildColumnData({
    id: 'description',
    label: '説明',
  }),
];

const DEFAULT_ORDER = 'name';
const DEFAULT_SORT_DIRECTION = 'asc';
const DEFAULT_PAGE_SIZE = 10;

const loggerFactory = rendererContainer.get<ILoggerFactory>('LoggerFactory');
const logger = loggerFactory.getLogger('ProjectList');

/**
 * 設定-プロジェクト画面コンポーネント
 *
 * 設定のプロジェクトを表示する。
 *
 * (表示内容)
 * ・追加ボタン
 * ・ラベルリスト
 *     - 選択チェックボックス
 *     - プロジェクト情報
 *     - 編集ボタン
 *     - 削除ボタン
 * ・ページネーション
 *
 * @returns レンダリング結果
 */
export const ProjectList = (): JSX.Element => {
  logger.info('ProjectList start');
  const [pageable, setPageable] = useState<Pageable>(
    new Pageable(0, DEFAULT_PAGE_SIZE, {
      property: DEFAULT_ORDER,
      direction: DEFAULT_SORT_DIRECTION,
    })
  );
  const { refresh } = useProjectMap();
  const { page, isLoading } = useProjectPage({ pageable });
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);

  const handleAdd = async (): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug('handleAdd');
    setProjectId(null);
    setDialogOpen(true);
  };

  const handleEdit = async (row: Project): Promise<void> => {
    setProjectId(row.id);
    setDialogOpen(true);
  };

  /**
   * プロジェクト削除
   *
   * @param row
   */
  const handleDelete = async (row: Project): Promise<void> => {
    const ProjectProxy = rendererContainer.get<IProjectProxy>(TYPES.ProjectProxy);
    await ProjectProxy.delete(row.id);
    // データの最新化
    await refresh();
    setPageable(pageable.replacePageNumber(0));
  };

  /**
   * 選択したチェックボックスのプロジェクト削除
   *
   * @param uniqueKeys
   */
  const handleBulkDelete = async (uniqueKeys: string[]): Promise<void> => {
    const ProjectProxy = rendererContainer.get<IProjectProxy>(TYPES.ProjectProxy);
    await ProjectProxy.bulkDelete(uniqueKeys);
    // データの最新化
    await refresh();
    setPageable(pageable.replacePageNumber(0));
  };

  const handleChangePageable = async (newPageable: Pageable): Promise<void> => {
    if (logger.isDebugEnabled())
      logger.debug(`ProjectList handleChangePageable newPageable: ${newPageable}`);
    setPageable(newPageable);
  };

  /**
   * ダイアログのクローズ
   */
  const handleDialogClose = (): void => {
    if (logger.isDebugEnabled()) logger.debug('ProjectList handleDialogClose');
    setDialogOpen(false);
  };

  /**
   * プロジェクト追加・編集の送信
   *
   * @param project
   */
  const handleDialogSubmit = async (project: Project): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug(`ProjectList handleDialogSubmit: ${project}`);
    // データの最新化
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
      <CRUDList<Project>
        title={'プロジェクト'}
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
        <ProjectEdit
          isOpen={isDialogOpen}
          projectId={projectId}
          onClose={handleDialogClose}
          onSubmit={handleDialogSubmit}
        />
      )}
    </>
  );
};
