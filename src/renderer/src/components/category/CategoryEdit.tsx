import rendererContainer from '../../inversify.config';
import { Alert, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { CRUDFormDialog } from '../crud/CRUDFormDialog';
import { Controller, useForm } from 'react-hook-form';
import { Category } from '@shared/data/Category';
import { TYPES } from '@renderer/types';
import { ICategoryProxy } from '@renderer/services/ICategoryProxy';
import { ReadOnlyTextField } from '../common/fields/ReadOnlyTextField';
import { UniqueConstraintError } from '@shared/errors/UniqueConstraintError';
import { AppError } from '@shared/errors/AppError';

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
  const [category, setCategory] = useState<Category | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors: formErrors },
    setError,
  } = useForm<CategoryFormData>();

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      console.log('CategoryEdit fetchData', categoryId);
      const categoryProxy = rendererContainer.get<ICategoryProxy>(TYPES.CategoryProxy);
      let category: Category | null = null;
      if (categoryId !== null) {
        category = await categoryProxy.get(categoryId);
      }
      reset(category ? category : {});
      setCategory(category);
    };
    fetchData();
    setDialogOpen(isOpen);
  }, [isOpen, categoryId, reset]);

  const handleDialogSubmit = async (data: CategoryFormData): Promise<void> => {
    console.log('CategoryEdit handleDialogSubmit', data);
    // mongodb や nedb の場合、 _id などのエンティティとしては未定義の項目が埋め込まれていることがあり
    // それらの項目を使って更新処理が行われるため、`...category` で隠れた項目もコピーされるようにする
    const newCategory: Category = {
      ...category,
      id: category ? category.id : '',
      name: data.name,
      description: data.description,
      color: data.color,
      updated: new Date(),
    };
    try {
      await onSubmit(newCategory);
      onClose();
      reset();
    } catch (error) {
      console.error('CategoryEdit handleDialogSubmit error', error);
      const errName = AppError.getErrorName(error);
      if (errName === UniqueConstraintError.NAME) {
        setError('name', { type: 'manual', message: 'カテゴリー名は既に登録されています' });
      } else {
        throw error;
      }
    }
  };

  const handleDialogClose = (): void => {
    console.log('CategoryEdit handleDialogClose');
    onClose();
  };

  return (
    <CRUDFormDialog
      isOpen={isDialogOpen}
      title={`カテゴリー${categoryId !== null ? '編集' : '追加'}`}
      onSubmit={handleSubmit(handleDialogSubmit)}
      onClose={handleDialogClose}
    >
      {categoryId !== null && (
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
