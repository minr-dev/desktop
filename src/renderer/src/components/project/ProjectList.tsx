import rendererContainer from '../../inversify.config';
import { Project } from '@shared/data/Project';
import { CRUDList, CRUDColumnData } from '../crud/CRUDList';
import { useState } from 'react';
import { IProjectProxy } from '@renderer/services/IProjectProxy';
import { TYPES } from '@renderer/types';
import { Pageable } from '@shared/data/Page';
import { ProjectEdit } from './ProjectEdit';
import CircularProgress from '@mui/material/CircularProgress';
import { useProjectPage } from '@renderer/hooks/useProjectPage';

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

export const ProjectList = (): JSX.Element => {
  console.log('ProjectList start');
  const [pageable, setPageable] = useState<Pageable>(
    new Pageable(0, DEFAULT_PAGE_SIZE, {
      property: DEFAULT_ORDER,
      direction: DEFAULT_SORT_DIRECTION,
    })
  );
  const { page, isLoading } = useProjectPage({ pageable });
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);

  const handleAdd = async (): Promise<void> => {
    console.log('handleAdd');
    setProjectId(null);
    setDialogOpen(true);
  };

  const handleEdit = async (row: Project): Promise<void> => {
    setProjectId(row.id);
    setDialogOpen(true);
  };

  const handleDelete = async (row: Project): Promise<void> => {
    const ProjectProxy = rendererContainer.get<IProjectProxy>(TYPES.ProjectProxy);
    await ProjectProxy.delete(row.id);
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
