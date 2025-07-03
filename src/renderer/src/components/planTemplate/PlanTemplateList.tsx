import rendererContainer from '../../inversify.config';
import { getLogger } from '@renderer/utils/LoggerUtil';
import { Pageable } from '@shared/data/Page';
import { useState } from 'react';
import { CRUDColumnData, CRUDList } from '../crud/CRUDList';
import { PlanTemplate } from '@shared/data/PlanTemplate';
import { PlanTemplateEdit } from './PlanTemplateEdit';
import { usePlanTemplatePage } from '@renderer/hooks/usePlanTemplatePage';
import { CircularProgress } from '@mui/material';
import { IPlanTemplateProxy } from '@renderer/services/IPlanTemplateProxy';
import { TYPES } from '@renderer/types';
import { usePlanTemplateMap } from '@renderer/hooks/usePlanTemplateMap';
import { PlanTemplateEvent } from '@shared/data/PlanTemplateEvent';

const logger = getLogger('PlanTemplateList');

const DEFAULT_ORDER = 'name';
const DEFAULT_SORT_DIRECTION = 'asc';
const DEFAULT_PAGE_SIZE = 10;

export const PlanTemplateList = (): JSX.Element => {
  logger.info('PlanTemplateList start');
  const [pageable, setPageable] = useState<Pageable>(
    new Pageable(0, DEFAULT_PAGE_SIZE, {
      property: DEFAULT_ORDER,
      direction: DEFAULT_SORT_DIRECTION,
    })
  );
  const { page, isLoading } = usePlanTemplatePage({ pageable });
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [templateId, setTemplateId] = useState<string | null>(null);

  const { refresh } = usePlanTemplateMap();

  const buildColumnData = (
    overlaps: Partial<CRUDColumnData<PlanTemplate>>
  ): CRUDColumnData<PlanTemplate> => {
    return {
      isKey: false,
      id: 'unknown',
      numeric: false,
      disablePadding: true,
      label: 'unknown',
      ...overlaps,
    };
  };

  const headCells: readonly CRUDColumnData<PlanTemplate>[] = [
    buildColumnData({
      id: 'name',
      label: 'テンプレート名',
    }),
  ];

  const handleAdd = async (): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug('handleAdd');
    setTemplateId(null);
    setDialogOpen(true);
  };

  const handleEdit = async (row: PlanTemplate): Promise<void> => {
    setTemplateId(row.id);
    setDialogOpen(true);
  };

  /**
   * 予定テンプレート削除
   *
   * @param row
   */
  const handleDelete = async (row: PlanTemplate): Promise<void> => {
    const planTemplateProxy = rendererContainer.get<IPlanTemplateProxy>(TYPES.PlanTemplateProxy);
    await planTemplateProxy.delete(row.id);
    // データの最新化
    await refresh();
    setPageable(pageable.replacePageNumber(0));
  };

  /**
   * 選択したチェックボックスの予定テンプレート削除
   *
   * @param uniqueKeys
   */
  const handleBulkDelete = async (uniqueKeys: string[]): Promise<void> => {
    const planTemplateProxy = rendererContainer.get<IPlanTemplateProxy>(TYPES.PlanTemplateProxy);
    await planTemplateProxy.bulkDelete(uniqueKeys);
    // データの最新化
    await refresh();
    setPageable(pageable.replacePageNumber(0));
  };

  const handleChangePageable = async (newPageable: Pageable): Promise<void> => {
    if (logger.isDebugEnabled())
      logger.debug('PlanTemplateList handleChangePageable newPageable', newPageable);
    setPageable(newPageable);
  };

  /**
   * ダイアログのクローズ
   */
  const handleDialogClose = (): void => {
    if (logger.isDebugEnabled()) logger.debug('PlanTemplateList handleDialogClose');
    setDialogOpen(false);
  };

  /**
   * 予定テンプレート追加・編集の送信
   *
   * @param template
   */
  const handleDialogSubmit = async (
    template: PlanTemplate,
    events: PlanTemplateEvent[]
  ): Promise<void> => {
    if (logger.isDebugEnabled())
      logger.debug('PlanTemplateList handleDialogSubmit', template, events);
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
      <CRUDList<PlanTemplate>
        title={'予定テンプレート'}
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
        <PlanTemplateEdit
          isOpen={isDialogOpen}
          templateId={templateId}
          onClose={handleDialogClose}
          onSubmit={handleDialogSubmit}
        />
      )}
    </>
  );
};
