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
import { useLabelMap } from '@renderer/hooks/useLabelMap';
import { useLabelPage } from '@renderer/hooks/useLabelPage';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';

/**
 * カラムデータ作成
 *
 * @param overlaps: Partial<CRUDColumnData<Label>>
 * @returns CRUDColumnData<Label>
 */
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

/**
 * ヘッダーの作成
 */
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

const loggerFactory = rendererContainer.get<ILoggerFactory>('LoggerFactory');
const logger = loggerFactory.getLogger('LabelList');

/**
 * 設定-ラベル画面コンポーネント
 *
 * 設定のラベルを表示する。
 *
 * (表示内容)
 * ・追加ボタン
 * ・ラベルリスト
 *     - 選択チェックボックス
 *     - ラベル情報
 *     - 編集ボタン
 *     - 削除ボタン
 * ・ページネーション
 *
 * @returns レンダリング結果
 */
export const LabelList = (): JSX.Element => {
  logger.info('LabelList start');
  const [pageable, setPageable] = useState<Pageable>(
    new Pageable(0, DEFAULT_PAGE_SIZE, {
      property: DEFAULT_ORDER,
      direction: DEFAULT_SORT_DIRECTION,
    })
  );
  const { refresh } = useLabelMap();
  const { page, isLoading } = useLabelPage({ pageable });
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [labelId, setLabelId] = useState<string | null>(null);

  const handleAdd = async (): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug('handleAdd');
    setLabelId(null);
    setDialogOpen(true);
  };

  const handleEdit = async (row: Label): Promise<void> => {
    setLabelId(row.id);
    setDialogOpen(true);
  };

  /**
   * ラベル削除
   *
   * @param row
   */
  const handleDelete = async (row: Label): Promise<void> => {
    const LabelProxy = rendererContainer.get<ILabelProxy>(TYPES.LabelProxy);
    await LabelProxy.delete(row.id);
    // データの最新化
    await refresh();
    setPageable(pageable.replacePageNumber(0));
  };

  /**
   * 選択したチェックボックスのラベル削除
   *
   * @param uniqueKeys
   */
  const handleBulkDelete = async (uniqueKeys: string[]): Promise<void> => {
    const LabelProxy = rendererContainer.get<ILabelProxy>(TYPES.LabelProxy);
    await LabelProxy.bulkDelete(uniqueKeys);
    // データの最新化
    await refresh();
    setPageable(pageable.replacePageNumber(0));
  };

  const handleChangePageable = async (newPageable: Pageable): Promise<void> => {
    if (logger.isDebugEnabled())
      logger.debug(`LabelList handleChangePageable newPageable: ${newPageable}`);
    setPageable(newPageable);
  };

  /**
   * ダイアログのクローズ
   */
  const handleDialogClose = (): void => {
    if (logger.isDebugEnabled()) logger.debug('LabelList handleDialogClose');
    setDialogOpen(false);
  };

  /**
   * ラベル追加・編集の送信
   *
   * @param label
   */
  const handleDialogSubmit = async (label: Label): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug(`LabelList handleDialogSubmit: ${label}`);
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
