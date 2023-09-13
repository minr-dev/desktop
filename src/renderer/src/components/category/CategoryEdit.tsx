import rendererContainer from '../../inversify.config';
import { Alert, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { CRUDFormDialog } from '../crud/CRUDFormDialog';
import { Controller, useForm } from 'react-hook-form';
import { Category } from '@shared/data/Category';
import { TYPES } from '@renderer/types';
import { ICategoryProxy } from '@renderer/services/ICategoryProxy';

interface CategoryFormData {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface CategoryEditProps {
  isOpen: boolean;
  categoryId: string | null;
  onClose: () => void;
  onSubmit: (category: Category) => void;
}

export const CategoryEdit = ({
  isOpen,
  categoryId,
  onClose,
  onSubmit,
}: CategoryEditProps): JSX.Element => {
  console.log('CategoryEdit', isOpen);
  const [isDialogOpen, setDialogOpen] = useState(isOpen);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors: formErrors },
  } = useForm<CategoryFormData>();
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const categoryProxy = rendererContainer.get<ICategoryProxy>(TYPES.CategoryProxy);
      let category;
      if (categoryId === null) {
        category = {};
        reset();
      } else {
        category = await categoryProxy.get(categoryId);
      }
      setCategory(category);
    };
    fetchData();
    setDialogOpen(isOpen);
  }, [isOpen, categoryId, reset]);

  const handleDialogSubmit = (data: CategoryFormData): void => {
    console.log('CategoryEdit handleDialogSubmit', data);
    const category: Category = {
      id: data.id,
      name: data.name,
      description: data.description,
      color: data.color,
      updated: new Date(),
    };
    onSubmit(category);
    onClose();
    reset();
  };

  const handleDialogClose = (): void => {
    console.log('CategoryEdit handleDialogClose');
    onClose();
  };

  return (
    <CRUDFormDialog
      isOpen={isDialogOpen}
      onSubmit={handleSubmit(handleDialogSubmit)}
      onClose={handleDialogClose}
    >
      <Controller
        name="id"
        control={control}
        defaultValue={category?.id || ''}
        rules={{ required: '入力してください。' }}
        render={({ field, fieldState: { error } }): React.ReactElement => (
          <TextField
            {...field}
            label="ID"
            variant="outlined"
            error={!!error}
            helperText={error?.message}
            fullWidth
            margin="normal"
          />
        )}
      />
      <Controller
        name="name"
        control={control}
        defaultValue={category?.name || ''}
        rules={{ required: '入力してください。' }}
        render={({ field, fieldState: { error } }): React.ReactElement => (
          <TextField
            {...field}
            label="カテゴリー名"
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
        defaultValue={category?.description || ''}
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
      <Controller
        name="color"
        control={control}
        defaultValue={category?.color || ''}
        rules={{ required: '入力してください。' }}
        render={({ field, fieldState: { error } }): React.ReactElement => (
          <TextField
            {...field}
            label="カラー"
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
        {process.env.NODE_ENV !== 'production' &&
          Object.entries(formErrors).map(([fieldName, error]) => (
            <Alert key={fieldName} severity="error">
              {fieldName}: {error.message}
            </Alert>
          ))}
      </Stack>
    </CRUDFormDialog>
  );
};
