import rendererContainer from '../../inversify.config';
import { Alert, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { CRUDFormDialog } from '../crud/CRUDFormDialog';
import { Controller } from 'react-hook-form';
import { Label } from '@shared/data/Label';
import { TYPES } from '@renderer/types';
import { ILabelProxy } from '@renderer/services/ILabelProxy';
import { ReadOnlyTextField } from '../common/fields/ReadOnlyTextField';
import { UniqueConstraintError } from '@shared/errors/UniqueConstraintError';
import { AppError } from '@shared/errors/AppError';
import { TextColorPickerField } from '../common/fields/TextColorPickerField';
import { getLogger } from '@renderer/utils/LoggerUtil';
import { useFormManager } from '@renderer/hooks/useFormManager';
import { DateUtil } from '@shared/utils/DateUtil';

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
  onSubmit: (label: Label) => void;
}

const logger = getLogger('LabelEdit');

export const LabelEdit = ({ isOpen, labelId, onClose, onSubmit }: LabelEditProps): JSX.Element => {
  logger.info(`LabelEdit: ${isOpen}`);
  const [isDialogOpen, setDialogOpen] = useState(isOpen);
  const [label, setLabel] = useState<Label | null>(null);

  const methods = useFormManager<LabelFormData>({ formId: 'label-edit-form', isVisible: isOpen });
  const {
    control,
    reset,
    formState: { errors: formErrors },
    setError,
    setValue,
  } = methods;

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      if (logger.isDebugEnabled()) logger.debug('LabelEdit fetchData', labelId);
      const LabelProxy = rendererContainer.get<ILabelProxy>(TYPES.LabelProxy);
      let label: Label | null = null;
      if (labelId !== null) {
        label = await LabelProxy.get(labelId);
      }
      reset(label ? label : {});
      setLabel(label);
    };
    fetchData();
    setDialogOpen(isOpen);
  }, [isOpen, labelId, reset]);

  const handleChangeColor = (color: string): void => {
    if (logger.isDebugEnabled()) logger.debug('LabelEdit handleChangeColor', color);
    setValue('color', color);
  };

  const handleDialogSubmit = async (data: LabelFormData): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug('LabelEdit handleDialogSubmit', data);
    const dateUtil = rendererContainer.get<DateUtil>(TYPES.DateUtil);
    // mongodb や nedb の場合、 _id などのエンティティとしては未定義の項目が埋め込まれていることがあり
    // それらの項目を使って更新処理が行われるため、`...Label` で隠れた項目もコピーされるようにする
    const newLabel: Label = {
      ...label,
      ...data,
      id: label ? label.id : '',
      updated: dateUtil.getCurrentDate(),
    };
    try {
      const labelProxy = rendererContainer.get<ILabelProxy>(TYPES.LabelProxy);
      const saved = await labelProxy.save(newLabel);
      await onSubmit(saved);
      onClose();
      reset();
    } catch (error) {
      logger.error('LabelEdit handleDialogSubmit error', error);
      const errName = AppError.getErrorName(error);
      if (errName === UniqueConstraintError.NAME) {
        setError('name', { type: 'manual', message: 'ラベル名は既に登録されています' });
      } else {
        throw error;
      }
    }
  };

  const handleDialogClose = (): void => {
    if (logger.isDebugEnabled()) logger.debug('LabelEdit handleDialogClose');
    onClose();
  };

  return (
    <CRUDFormDialog
      isOpen={isDialogOpen}
      title={`ラベル${labelId !== null ? '編集' : '追加'}`}
      onSubmit={handleDialogSubmit}
      onClose={handleDialogClose}
      methods={methods}
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
        rules={{
          required: '入力してください。',
          validate: (value): string | true => {
            if (!/^#[0-9a-fA-F]{6}$/.test(value)) {
              return '6桁のカラーコードを入力してください';
            }
            return true;
          },
        }}
        render={({ field, fieldState: { error } }): React.ReactElement => (
          <TextColorPickerField
            label="カラー"
            field={field}
            error={!!error}
            helperText={error?.message}
            onChangeComplete={handleChangeColor}
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
