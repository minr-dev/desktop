import rendererContainer from '../../inversify.config';
import { Alert, Grid, Stack, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { CRUDFormDialog } from '../crud/CRUDFormDialog';
import { Controller, useWatch } from 'react-hook-form';
import { TYPES } from '@renderer/types';
import { ReadOnlyTextField } from '../common/fields/ReadOnlyTextField';
import { UniqueConstraintError } from '@shared/errors/UniqueConstraintError';
import { AppError } from '@shared/errors/AppError';
import { CategoryDropdownComponent } from '../category/CategoryDropdownComponent';
import { DateUtil } from '@shared/utils/DateUtil';
import { ProjectDropdownComponent } from '../project/ProjectDropdownComponent';
import { LabelMultiSelectComponent } from '../label/LabelMultiSelectComponent';
import { getLogger } from '@renderer/utils/LoggerUtil';
import { Pattern } from '@shared/data/Pattern';
import { IPatternProxy } from '@renderer/services/IPatternProxy';
import { TaskDropdownComponent } from '../task/TaskDropdownComponent';
import { useFormManager } from '@renderer/hooks/useFormManager';

interface PatternFormData {
  id: string;
  name: string;
  basename: string;
  regularExpression: string;
  projectId: string;
  categoryId: string;
  labelIds: string[];
  taskId: string;
}

interface PatternEditProps {
  isOpen: boolean;
  patternId: string | null;
  onClose: () => void;
  onSubmit: (Pattern: Pattern) => void;
}

const logger = getLogger('PatternEdit');

export const PatternEdit = ({
  isOpen,
  patternId: patternId,
  onClose,
  onSubmit,
}: PatternEditProps): JSX.Element => {
  logger.info('PatternEdit', isOpen);
  const [isDialogOpen, setDialogOpen] = useState(isOpen);
  const [pattern, setPattern] = useState<Pattern | null>(null);
  const methods = useFormManager<PatternFormData>({
    formId: 'pattern-edit-form',
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
      if (logger.isDebugEnabled()) logger.debug('PatternEdit fetchData', patternId);
      const patternProxy = rendererContainer.get<IPatternProxy>(TYPES.PatternProxy);
      let pattern: Pattern | null = null;
      if (patternId !== null) {
        pattern = await patternProxy.get(patternId);
      }
      reset(pattern ? pattern : {});
      setPattern(pattern);
    };
    fetchData();
    setDialogOpen(isOpen);
  }, [isOpen, patternId, reset]);

  const projectId = useWatch({
    control,
    name: `projectId`,
  });

  const handleDialogSubmit = async (data: PatternFormData): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug('PatternEdit handleDialogSubmit', data);
    const dateUtil = rendererContainer.get<DateUtil>(TYPES.DateUtil);
    // mongodb や nedb の場合、 _id などのエンティティとしては未定義の項目が埋め込まれていることがあり
    // それらの項目を使って更新処理が行われるため、`...pattern` で隠れた項目もコピーされるようにする
    const newPattern: Pattern = {
      ...pattern,
      ...data,
      id: pattern ? pattern.id : '',
      updated: dateUtil.getCurrentDate(),
    };
    if (!newPattern.basename && !newPattern.regularExpression) {
      const requiredError = {
        type: 'manual',
        message: 'アプリケーション名か正規表現のいずれかは入力してください。',
      };
      setError('basename', requiredError);
      setError('regularExpression', requiredError);
      return;
    }
    try {
      const patternProxy = rendererContainer.get<IPatternProxy>(TYPES.PatternProxy);
      const saved = await patternProxy.save(newPattern);
      await onSubmit(saved);
      onClose();
      reset();
    } catch (error) {
      logger.error('PatternEdit handleDialogSubmit error', error);
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
    if (logger.isDebugEnabled()) logger.debug('PatternEdit handleDialogClose');
    onClose();
  };

  return (
    <CRUDFormDialog
      isOpen={isDialogOpen}
      title={`パターン${patternId !== null ? '編集' : '追加'}`}
      onSubmit={handleDialogSubmit}
      onClose={handleDialogClose}
      methods={methods}
    >
      <Grid container spacing={2} style={{ paddingTop: '16px' }}>
        {patternId !== null && (
          <Grid item xs={12} key="patternId">
            <Controller
              name="id"
              control={control}
              render={({ field }): React.ReactElement => (
                <ReadOnlyTextField field={field} label="ID" margin="none" />
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
                margin="none"
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="basename"
            control={control}
            render={({ field, fieldState: { error } }): React.ReactElement => (
              <TextField
                {...field}
                value={field.value ?? ''}
                label="アプリケーション名"
                variant="outlined"
                error={!!error}
                helperText={error?.message}
                fullWidth
                margin="none"
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
                margin="none"
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name={`projectId`}
            control={control}
            render={({ field: { onChange, value } }): JSX.Element => (
              <ProjectDropdownComponent
                value={value}
                onChange={(newValue: string): void => {
                  onChange(newValue);
                }}
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
        <Grid item xs={12}>
          <Controller
            name="taskId"
            control={control}
            render={({ field: { onChange, value } }): React.ReactElement => (
              <TaskDropdownComponent value={value} onChange={onChange} projectId={projectId} />
            )}
          />
        </Grid>

        <Grid item xs={12}>
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
      </Grid>
    </CRUDFormDialog>
  );
};
