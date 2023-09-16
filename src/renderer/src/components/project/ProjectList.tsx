import rendererContainer from '../../inversify.config';
import { Project } from '@shared/data/Project';
import { RowData, CRUDList, ColumnData } from '../crud/CRUDList';
import { useEffect, useState } from 'react';
import { IProjectProxy } from '@renderer/services/IProjectProxy';
import { TYPES } from '@renderer/types';
import { Page, Pageable } from '@shared/data/Page';
import { ProjectEdit } from './ProjectEdit';
import CircularProgress from '@mui/material/CircularProgress';

class ProjectRowData implements RowData {
  constructor(readonly item: Project) {}

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
    label: 'プロジェクトID',
  }),
  buildColumnData({
    id: 'name',
    label: 'プロジェクト名',
  }),
  buildColumnData({
    id: 'description',
    label: '説明',
  }),
];

const DEFAULT_ORDER = 'id';
const DEFAULT_SORT_DIRECTION = 'asc';
const DEFAULT_PAGE_SIZE = 10;

export const ProjectList = (): JSX.Element => {
  console.log('ProjectList start');
  const [pageable, setPageable] = useState<Pageable>(
    new Pageable(0, DEFAULT_PAGE_SIZE, {
      property: DEFAULT_ORDER,
      direction: DEFAULT_SORT_DIRECTION,
    })
  );
  const [page, setPage] = useState<Page<ProjectRowData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);

  const fetchData = async (pageable: Pageable): Promise<void> => {
    setIsLoading(true);
    const ProjectProxy = rendererContainer.get<IProjectProxy>(TYPES.ProjectProxy);
    const newPage = await ProjectProxy.list(pageable);
    const convContent = newPage.content.map((c) => new ProjectRowData(c));
    const pageProjectRowData = new Page<ProjectRowData>(
      convContent,
      newPage.totalElements,
      newPage.pageable
    );
    setPage(pageProjectRowData);
    setIsLoading(false);
    console.log('ProjectList fetchData', pageProjectRowData);
  };

  useEffect(() => {
    fetchData(pageable);
  }, [pageable]);

  const handleAdd = async (): Promise<void> => {
    console.log('handleAdd');
    setProjectId(null);
    setDialogOpen(true);
  };

  const handleEdit = async (row: RowData): Promise<void> => {
    setProjectId(row.item.id);
    setDialogOpen(true);
  };

  const handleDelete = async (row: RowData): Promise<void> => {
    const ProjectProxy = rendererContainer.get<IProjectProxy>(TYPES.ProjectProxy);
    await ProjectProxy.delete(row.item.id);
    setPageable(pageable.replacePageNumber(0));
  };

  const handleBulkDelete = async (uniqueKeys: string[]): Promise<void> => {
    const ProjectProxy = rendererContainer.get<IProjectProxy>(TYPES.ProjectProxy);
    await ProjectProxy.bulkDelete(uniqueKeys);
    setPageable(pageable.replacePageNumber(0));
  };

  const handleChangePageable = async (newPageable: Pageable): Promise<void> => {
    console.log('ProjectList handleChangePageable newPageable', newPageable);
    setPageable(newPageable);
  };

  const handleDialogClose = (): void => {
    console.log('ProjectList handleDialogClose');
    setDialogOpen(false);
  };

  const handleDialogSubmit = async (project: Project): Promise<void> => {
    console.log('ProjectList handleDialogSubmit', project);
    const ProjectProxy = rendererContainer.get<IProjectProxy>(TYPES.ProjectProxy);
    await ProjectProxy.save(project);
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
