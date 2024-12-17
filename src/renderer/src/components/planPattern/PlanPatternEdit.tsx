import rendererContainer from '../../inversify.config';
import { IPlanPatternProxy } from '@renderer/services/IPlanPatternProxy';
import { TYPES } from '@renderer/types';
import { getLogger } from '@renderer/utils/LoggerUtil';
import { PlanPattern } from '@shared/data/PlanPattern';
import { AppError } from '@shared/errors/AppError';
import { UniqueConstraintError } from '@shared/errors/UniqueConstraintError';
import { DateUtil } from '@shared/utils/DateUtil';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { CRUDFormDialog } from '../crud/CRUDFormDialog';
import { Alert, Grid, Stack, TextField } from '@mui/material';
import { ReadOnlyTextField } from '../common/fields/ReadOnlyTextField';
import { CategoryDropdownComponent } from '../category/CategoryDropdownComponent';
import { LabelMultiSelectComponent } from '../label/LabelMultiSelectComponent';

interface PlanPatternFormData {
  id: string;
  name: string;
  regularExpression: string;
  categoryId: string;
  labelIds: string[];
}

interface PlanPatternEditProps {
  isOpen: boolean;
  patternId: string | null;
  onClose: () => void;
  onSubmit: (PlanPattern: PlanPattern) => void;
}

const logger = getLogger('PlanPatternEdit');

export const PlanPatternEdit = ({
  isOpen,
  patternId: patternId,
  onClose,
  onSubmit,
}: PlanPatternEditProps): JSX.Element => {
  logger.info('PlanPatternEdit', isOpen);
  const [isDialogOpen, setDialogOpen] = useState(isOpen);
  const [planPattern, setPlanPattern] = useState<PlanPattern | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors: formErrors },
    setError,
  } = useForm<PlanPatternFormData>();

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      if (logger.isDebugEnabled()) logger.debug('PlanPatternEdit fetchData', patternId);
      const patternProxy = rendererContainer.get<IPlanPatternProxy>(TYPES.PlanPatternProxy);
      let pattern: PlanPattern | null = null;
      if (patternId !== null) {
        pattern = await patternProxy.get(patternId);
      }
      reset(pattern ? pattern : {});
      setPlanPattern(pattern);
    };
    fetchData();
    setDialogOpen(isOpen);
  }, [isOpen, patternId, reset]);

  const handleDialogSubmit = async (data: PlanPatternFormData): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug('PlanPatternEdit handleDialogSubmit', data);
    const dateUtil = rendererContainer.get<DateUtil>(TYPES.DateUtil);
    // mongodb や nedb の場合、 _id などのエンティティとしては未定義の項目が埋め込まれていることがあり
    // それらの項目を使って更新処理が行われるため、`...pattern` で隠れた項目もコピーされるようにする
    const newPlanPattern: PlanPattern = {
      ...planPattern,
      ...data,
      id: planPattern ? planPattern.id : '',
      updated: dateUtil.getCurrentDate(),
    };
    try {
      const planPatternProxy = rendererContainer.get<IPlanPatternProxy>(TYPES.PlanPatternProxy);
      const saved = await planPatternProxy.save(newPlanPattern);
      await onSubmit(saved);
      onClose();
      reset();
    } catch (error) {
      logger.error('PlanPatternEdit handleDialogSubmit error', error);
      const errName = AppError.getErrorName(error);
      if (errName === UniqueConstraintError.NAME) {
        setError('name', {
          type: 'manual',
          message: 'パターン名は既に登録されています',
        });
      } else {
        throw error;
      }
    }
  };

  const handleDialogClose = (): void => {
    if (logger.isDebugEnabled()) logger.debug('PlanPatternEdit handleDialogClose');
    onClose();
  };

  return (
    <CRUDFormDialog
      isOpen={isDialogOpen}
      title={`予定パターン${patternId !== null ? '編集' : '追加'}`}
      onSubmit={handleSubmit(handleDialogSubmit)}
      onClose={handleDialogClose}
    >
      <Grid container spacing={2}>
        {patternId !== null && (
          <Grid item xs={12} key="patternId">
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
                value={field.value ?? ''}
                label="パターン名"
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
            name="regularExpression"
            control={control}
            render={({ field, fieldState: { error } }): React.ReactElement => (
              <TextField
                {...field}
                value={field.value ?? ''}
                label="正規表現"
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
            name={`categoryId`}
            control={control}
            render={({ field: { onChange, value } }): JSX.Element => (
              <CategoryDropdownComponent value={value} onChange={onChange} />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name={`labelIds`}
            control={control}
            render={({ field }): JSX.Element => (
              <LabelMultiSelectComponent
                field={field}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </Grid>
        <Stack>
          {Object.entries(formErrors).length > 0 && (
            <Alert severity="error">入力エラーを修正してください</Alert>
          )}
        </Stack>
      </Grid>
    </CRUDFormDialog>
  );
};
