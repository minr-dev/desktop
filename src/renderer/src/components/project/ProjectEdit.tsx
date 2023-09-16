import rendererContainer from '../../inversify.config';
import { Alert, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { CRUDFormDialog } from '../crud/CRUDFormDialog';
import { Controller, useForm } from 'react-hook-form';
import { Project } from '@shared/data/Project';
import { TYPES } from '@renderer/types';
import { IProjectProxy } from '@renderer/services/IProjectProxy';
import { ReadOnlyTextField } from '../common/fields/ReadOnlyTextField';
import { UniqueConstraintError } from '@shared/errors/UniqueConstraintError';
import { AppError } from '@shared/errors/AppError';

interface ProjectFormData {
  id: string;
  name: string;
  description: string;
}

interface ProjectEditProps {
  isOpen: boolean;
  projectId: string | null;
  onClose: () => void;
  onSubmit: (project: Project) => void;
}

export const ProjectEdit = ({
  isOpen,
  projectId,
  onClose,
  onSubmit,
}: ProjectEditProps): JSX.Element => {
  console.log('ProjectEdit', isOpen);
  const [isDialogOpen, setDialogOpen] = useState(isOpen);
  const [project, setProject] = useState<Project | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors: formErrors },
    setError,
  } = useForm<ProjectFormData>();

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      console.log('ProjectEdit fetchData', projectId);
      const ProjectProxy = rendererContainer.get<IProjectProxy>(TYPES.ProjectProxy);
      let project: Project | null = null;
      if (projectId !== null) {
        project = await ProjectProxy.get(projectId);
      }
      reset(project ? project : {});
      setProject(project);
    };
    fetchData();
    setDialogOpen(isOpen);
  }, [isOpen, projectId, reset]);

  const handleDialogSubmit = async (data: ProjectFormData): Promise<void> => {
    console.log('ProjectEdit handleDialogSubmit', data);
    // mongodb や nedb の場合、 _id などのエンティティとしては未定義の項目が埋め込まれていることがあり
    // それらの項目を使って更新処理が行われるため、`...Project` で隠れた項目もコピーされるようにする
    const newProject: Project = {
      ...project,
      id: project ? project.id : '',
      name: data.name,
      description: data.description,
      updated: new Date(),
    };
    try {
      await onSubmit(newProject);
      onClose();
      reset();
    } catch (error) {
      console.error('ProjectEdit handleDialogSubmit error', error);
      const errName = AppError.getErrorName(error);
      if (errName === UniqueConstraintError.NAME) {
        setError('name', { type: 'manual', message: 'プロジェクト名は既に登録されています' });
      } else {
        throw error;
      }
    }
  };

  const handleDialogClose = (): void => {
    console.log('ProjectEdit handleDialogClose');
    onClose();
  };

  return (
    <CRUDFormDialog
      isOpen={isDialogOpen}
      title={`プロジェクト${projectId !== null ? '編集' : '追加'}`}
      onSubmit={handleSubmit(handleDialogSubmit)}
      onClose={handleDialogClose}
    >
      {projectId !== null && (
        <Controller
          name="id"
          control={control}
          render={({ field }): React.ReactElement => <ReadOnlyTextField field={field} label="ID" />}
        />
      )}
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
    </CRUDFormDialog>
  );
};
