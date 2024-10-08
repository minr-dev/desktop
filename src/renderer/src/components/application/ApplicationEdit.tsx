import rendererContainer from '../../inversify.config';
import { Alert, Grid, Stack, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { CRUDFormDialog } from '../crud/CRUDFormDialog';
import { Controller, useForm } from 'react-hook-form';
import { Application } from '@shared/data/Application';
import { TYPES } from '@renderer/types';
import { IApplicationProxy } from '@renderer/services/IApplicationProxy';
import { ReadOnlyTextField } from '../common/fields/ReadOnlyTextField';
import { UniqueConstraintError } from '@shared/errors/UniqueConstraintError';
import { AppError } from '@shared/errors/AppError';
import { CategoryDropdownComponent } from '../category/CategoryDropdownComponent';
import { DateUtil } from '@shared/utils/DateUtil';
import { ProjectDropdownComponent } from '../project/ProjectDropdownComponent';
import { LabelMultiSelectComponent } from '../label/LabelMultiSelectComponent';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';

interface ApplicationFormData {
  id: string;
  basename: string;
  relatedProjectId: string;
  relatedCategoryId: string;
  relatedLabelIds: string[];
}

interface ApplicationEditProps {
  isOpen: boolean;
  ApplicationId: string | null;
  onClose: () => void;
  onSubmit: (Application: Application) => void;
}

export const ApplicationEdit = ({
  isOpen,
  ApplicationId: applicationId,
  onClose,
  onSubmit,
}: ApplicationEditProps): JSX.Element => {
  const loggerFactory = rendererContainer.get<ILoggerFactory>(TYPES.LoggerFactory);
  const logger = loggerFactory.getLogger({
    processType: 'renderer',
    loggerName: 'ApplicationEdit',
  });
  logger.info(`ApplicationEdit: ${isOpen}`);
  const [isDialogOpen, setDialogOpen] = useState(isOpen);
  const [application, setApplication] = useState<Application | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors: formErrors },
    setError,
  } = useForm<ApplicationFormData>();

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      if (logger.isDebugEnabled()) logger.debug(`ApplicationEdit fetchData: ${applicationId}`);
      const applicationProxy = rendererContainer.get<IApplicationProxy>(TYPES.ApplicationProxy);
      let application: Application | null = null;
      if (applicationId !== null) {
        application = await applicationProxy.get(applicationId);
      }
      reset(application ? application : {});
      setApplication(application);
    };
    fetchData();
    setDialogOpen(isOpen);
  }, [isOpen, applicationId, reset, logger]);

  const handleDialogSubmit = async (data: ApplicationFormData): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug(`ApplicationEdit handleDialogSubmit: ${data}`);
    const dateUtil = rendererContainer.get<DateUtil>(TYPES.DateUtil);
    // mongodb や nedb の場合、 _id などのエンティティとしては未定義の項目が埋め込まれていることがあり
    // それらの項目を使って更新処理が行われるため、`...Application` で隠れた項目もコピーされるようにする
    const newApplication: Application = {
      ...application,
      ...data,
      id: application ? application.id : '',
      updated: dateUtil.getCurrentDate(),
    };
    try {
      const ApplicationProxy = rendererContainer.get<IApplicationProxy>(TYPES.ApplicationProxy);
      const saved = await ApplicationProxy.save(newApplication);
      await onSubmit(saved);
      onClose();
      reset();
    } catch (error) {
      logger.error(`ApplicationEdit handleDialogSubmit error: ${error}`);
      const errName = AppError.getErrorName(error);
      if (errName === UniqueConstraintError.NAME) {
        setError('basename', {
          type: 'manual',
          message: 'アプリケーション名は既に登録されています',
        });
      } else {
        logger.error(`${error}`);
        throw error;
      }
    }
  };

  const handleDialogClose = (): void => {
    if (logger.isDebugEnabled()) logger.debug('ApplicationEdit handleDialogClose');
    onClose();
  };

  return (
    <CRUDFormDialog
      isOpen={isDialogOpen}
      title={`アプリケーション${applicationId !== null ? '編集' : '追加'}`}
      onSubmit={handleSubmit(handleDialogSubmit)}
      onClose={handleDialogClose}
    >
      <Grid container spacing={2}>
        {applicationId !== null && (
          <Grid item xs={12} key="applicationId">
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
            name="basename"
            control={control}
            rules={{ required: '入力してください。' }}
            render={({ field, fieldState: { error } }): React.ReactElement => (
              <TextField
                {...field}
                label="アプリケーション名"
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
            name={`relatedProjectId`}
            control={control}
            render={({ field: { onChange, value } }): JSX.Element => (
              <ProjectDropdownComponent value={value} onChange={onChange} />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name={`relatedCategoryId`}
            control={control}
            render={({ field: { onChange, value } }): JSX.Element => (
              <CategoryDropdownComponent value={value} onChange={onChange} />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name={`relatedLabelIds`}
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
