import rendererContainer from '../../inversify.config';
import { Alert, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { CRUDFormDialog } from '../crud/CRUDFormDialog';
import { Controller, useForm } from 'react-hook-form';
import { Label } from '@shared/data/Label';
import { TYPES } from '@renderer/types';
import { ILabelProxy } from '@renderer/services/ILabelProxy';
import { ReadOnlyTextField } from '../common/fields/ReadOnlyTextField';
import { UniqueConstraintError } from '@shared/errors/UniqueConstraintError';
import { AppError } from '@shared/errors/AppError';
import { TextColorPickerField } from '../common/fields/TextColorPickerField';

interface LabelFormData {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface LabelEditProps {
  isOpen: boolean;
  labelId: string | null;
  onClose: () => void;
  onSubmit: (Label: Label) => void;
}

export const LabelEdit = ({ isOpen, labelId, onClose, onSubmit }: LabelEditProps): JSX.Element => {
  console.log('LabelEdit', isOpen);
  const [isDialogOpen, setDialogOpen] = useState(isOpen);
  const [label, setLabel] = useState<Label | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors: formErrors },
    setError,
    setValue,
  } = useForm<LabelFormData>();

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      console.log('LabelEdit fetchData', labelId);
      const LabelProxy = rendererContainer.get<ILabelProxy>(TYPES.LabelProxy);
      let Label: Label | null = null;
      if (labelId !== null) {
        Label = await LabelProxy.get(labelId);
      }
      reset(Label ? Label : {});
      setLabel(Label);
    };
    fetchData();
    setDialogOpen(isOpen);
  }, [isOpen, labelId, reset]);

  const handleChangeColor = (color: string): void => {
    console.log('LabelEdit handleChangeColor', color);
    setValue('color', color);
  };

  const handleDialogSubmit = async (data: LabelFormData): Promise<void> => {
    console.log('LabelEdit handleDialogSubmit', data);
    // mongodb や nedb の場合、 _id などのエンティティとしては未定義の項目が埋め込まれていることがあり
    // それらの項目を使って更新処理が行われるため、`...Label` で隠れた項目もコピーされるようにする
    const newLabel: Label = {
      ...label,
      id: label ? label.id : '',
      name: data.name,
      description: data.description,
      color: data.color,
      updated: new Date(),
    };
    try {
      await onSubmit(newLabel);
      onClose();
      reset();
    } catch (error) {
      console.error('LabelEdit handleDialogSubmit error', error);
      const errName = AppError.getErrorName(error);
      if (errName === UniqueConstraintError.NAME) {
        setError('name', { type: 'manual', message: 'ラベル名は既に登録されています' });
      } else {
        throw error;
      }
    }
  };

  const handleDialogClose = (): void => {
    console.log('LabelEdit handleDialogClose');
    onClose();
  };

  return (
    <CRUDFormDialog
      isOpen={isDialogOpen}
      title={`ラベル${labelId !== null ? '編集' : '追加'}`}
      onSubmit={handleSubmit(handleDialogSubmit)}
      onClose={handleDialogClose}
    >
      {labelId !== null && (
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
            label="ラベル名"
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
        render={({ field }): React.ReactElement => (
          <TextColorPickerField label="カラー" field={field} onChangeComplete={handleChangeColor} />
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
