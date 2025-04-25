import rendererContainer from '../../inversify.config';
import { Alert, Grid, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { CRUDFormDialog } from '../crud/CRUDFormDialog';
import { Controller } from 'react-hook-form';
import { Project } from '@shared/data/Project';
import { TYPES } from '@renderer/types';
import { IProjectProxy } from '@renderer/services/IProjectProxy';
import { ReadOnlyTextField } from '../common/fields/ReadOnlyTextField';
import { UniqueConstraintError } from '@shared/errors/UniqueConstraintError';
import { AppError } from '@shared/errors/AppError';
import { getLogger } from '@renderer/utils/LoggerUtil';
import { useFormManager } from '@renderer/hooks/useFormManager';
import { DateUtil } from '@shared/utils/DateUtil';
import { GitHubProjectDropdownComponent } from '../github/GitHubProjectDropdownComponent';

interface ProjectFormData {
  id: string;
  name: string;
  gitHubProjectV2Id: string;
  description: string;
}

interface ProjectEditProps {
  isOpen: boolean;
  projectId: string | null;
  onClose: () => void;
  onSubmit: (project: Project) => void;
}

const logger = getLogger('ProjectEdit');

export const ProjectEdit = ({
  isOpen,
  projectId,
  onClose,
  onSubmit,
}: ProjectEditProps): JSX.Element => {
  logger.info('ProjectEdit', isOpen);
  const [isDialogOpen, setDialogOpen] = useState(isOpen);
  const [project, setProject] = useState<Project | null>(null);

  const methods = useFormManager<ProjectFormData>({
    formId: 'project-edit-form',
    isVisible: isOpen,
  });
  const {
    control,
    reset,
    formState: { errors: formErrors },
    setError,
  } = methods;

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      if (logger.isDebugEnabled()) logger.debug('ProjectEdit fetchData', projectId);
      const projectProxy = rendererContainer.get<IProjectProxy>(TYPES.ProjectProxy);
      let project: Project | null = null;
      if (projectId !== null) {
        project = await projectProxy.get(projectId);
      }
      reset(project ? project : {});
      setProject(project);
    };
    fetchData();
    setDialogOpen(isOpen);
  }, [isOpen, projectId, reset]);

  const handleDialogSubmit = async (data: ProjectFormData): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug('ProjectEdit handleDialogSubmit', data, event);
    const dateUtil = rendererContainer.get<DateUtil>(TYPES.DateUtil);
    // mongodb や nedb の場合、 _id などのエンティティとしては未定義の項目が埋め込まれていることがあり
    // それらの項目を使って更新処理が行われるため、`...Project` で隠れた項目もコピーされるようにする
    const newProject: Project = {
      ...project,
      id: project ? project.id : '',
      name: data.name,
      gitHubProjectV2Id: data.gitHubProjectV2Id,
      description: data.description,
      updated: dateUtil.getCurrentDate(),
    };
    try {
      const projectProxy = rendererContainer.get<IProjectProxy>(TYPES.ProjectProxy);
      const saved = await projectProxy.save(newProject);
      await onSubmit(saved);
      onClose();
      reset();
    } catch (error) {
      logger.error('ProjectEdit handleDialogSubmit error', error);
      const errName = AppError.getErrorName(error);
      if (errName === UniqueConstraintError.NAME) {
        setError('name', { type: 'manual', message: 'プロジェクト名は既に登録されています' });
      } else {
        throw error;
      }
    }
  };

  const handleDialogClose = (): void => {
    if (logger.isDebugEnabled()) logger.debug('ProjectEdit handleDialogClose');
    onClose();
  };

  return (
    <CRUDFormDialog
      isOpen={isDialogOpen}
      title={`プロジェクト${projectId !== null ? '編集' : '追加'}`}
      onSubmit={handleDialogSubmit}
      onClose={handleDialogClose}
      methods={methods}
    >
      <Grid container spacing={2}>
        {projectId !== null && (
          <Grid item xs={12}>
            <Controller
              name="id"
              control={control}
              render={({ field }): React.ReactElement => (
                <ReadOnlyTextField field={field} label="ID" />
              )}
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <Controller
            name="name"
            control={control}
            rules={{ required: '入力してください。' }}
            render={({ field, fieldState: { error } }): React.ReactElement => (
              <TextField
                {...field}
                label="プロジェクト名"
                variant="outlined"
                error={!!error}
                helperText={error?.message}
                fullWidth
                margin="normal"
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="gitHubProjectV2Id"
            control={control}
            render={({ field: { onChange, value } }): JSX.Element => (
              <GitHubProjectDropdownComponent value={value} onChange={onChange} />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="description"
            control={control}
            rules={{ required: '入力してください。' }}
            render={({ field, fieldState: { error } }): React.ReactElement => (
              <TextField
                {...field}
                label="説明"
                variant="outlined"
                error={!!error}
                helperText={error?.message}
                fullWidth
                margin="normal"
              />
            )}
          />
        </Grid>
        <Stack>
          {Object.entries(formErrors).length > 0 && (
            <Alert severity="error">入力エラーを修正してください</Alert>
          )}
          {/* デバッグのときにエラーを表示する */}
          {/* {process.env.NODE_ENV !== 'production' &&
            Object.entries(formErrors).map(([fieldName, error]) => (
              <Alert key={fieldName} severity="error">
                {fieldName}: {error.message}
              </Alert>
            ))} */}
        </Stack>
      </Grid>
    </CRUDFormDialog>
  );
};
