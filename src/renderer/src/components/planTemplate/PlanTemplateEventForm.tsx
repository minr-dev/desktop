import rendererContainer from '../../inversify.config';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Controller, FormProvider, SubmitHandler, useWatch } from 'react-hook-form';
import {
  TextField,
  Grid,
  Dialog,
  DialogActions,
  Button,
  DialogContent,
  DialogTitle,
  Box,
  FormLabel,
  Paper,
} from '@mui/material';
import { PlanTemplateEvent } from '@shared/data/PlanTemplateEvent';
import { addHours, addMinutes, differenceInMinutes, Time } from '@shared/data/Time';
import { ProjectDropdownComponent } from '../project/ProjectDropdownComponent';
import { CategoryDropdownComponent } from '../category/CategoryDropdownComponent';
import { LabelMultiSelectComponent } from '../label/LabelMultiSelectComponent';
import { IPlanTemplateEventProxy } from '@renderer/services/IPlanTemplateEventProxy';
import { TYPES } from '@renderer/types';
import { AppError } from '@shared/errors/AppError';
import AppContext from '../AppContext';
import { styled } from '@mui/system';
import { TaskDropdownComponent } from '../task/TaskDropdownComponent';
import { NotificationSettingsFormControl } from '../common/form/NotificationSettingsFormControl';
import { getLogger } from '@renderer/utils/LoggerUtil';
import { useFormManager } from '@renderer/hooks/useFormManager';
import { TimePickerField } from '../common/fields/TimePickerField';
import { isValid } from '@shared/data/Time';
import { FORM_MODE, FORM_MODE_ITEMS } from '../timeTable/EventEntryForm';

const CustomDialogContent = styled(DialogContent)`
  transition: width 0.5s ease;
`;

const CustomDialog = styled(Dialog)`
  & .MuiDialog-paper {
    transition: transform 0.5s ease, width 0.5s ease;
  }
`;

interface PlanTemplateEventFormProps {
  isOpen: boolean;
  mode: FORM_MODE;
  templateId: string;
  startTime: Time;
  event?: PlanTemplateEvent;
  onSubmit: (eventEntry: PlanTemplateEvent) => Promise<void>;
  onClose: () => Promise<void>;
  onDelete: (deletedId: string) => Promise<void>;
}

const logger = getLogger('PlanTemplateEventForm');

/**
 * イベントの追加編集用のコンポーネント。
 *
 * TODO:
 * - プロジェクトのプルダウンの pageSize よりもデータが多いときにどうするかは要検討。
 * - 同じくソートの仕様も要検討。
 *
 * @param {PlanTemplateEventFormProps} props - コンポーネントのプロパティ。
 * @returns {JSX.Element} レンダリング結果。
 */
const PlanTemplateEventForm = (
  {
    isOpen,
    mode,
    templateId,
    startTime = { hours: 0, minutes: 0 },
    event,
    onSubmit,
    onClose,
    onDelete,
  }: PlanTemplateEventFormProps,
  ref
): JSX.Element => {
  logger.info('PlanTemplateEventForm', isOpen, event);

  const methods = useFormManager<PlanTemplateEvent>({
    formId: 'plan-template-event-form',
    isVisible: isOpen,
  });
  const { handleSubmit, control, setValue, reset } = methods;

  useEffect(() => {
    if (mode === FORM_MODE.EDIT) {
      reset(event);
    } else {
      // 新規のときは、開始時間と終了時間をクリックした
      // 時間帯の1時間で初期化する
      reset({
        start: startTime,
        end: addHours(startTime, 1),
      });
    }
  }, [mode, event, reset, startTime]);

  const { userDetails } = useContext(AppContext);

  const start = useWatch({
    control,
    name: 'start',
  });

  const projectId = useWatch({
    control,
    name: 'projectId',
  });

  const initialInterval = useMemo(() => {
    if (mode === FORM_MODE.EDIT && event) {
      return differenceInMinutes(event.end, event.start);
    }
    return 60;
  }, [event, mode]);

  useEffect(() => {
    if (start) {
      const newEndTime = addMinutes(start, initialInterval);
      setValue('end', newEndTime);
    }
  }, [initialInterval, start, mode, setValue]);

  const [dialogStyle, setDialogStyle] = useState({});

  useEffect(() => {
    setDialogStyle({
      maxWidth: 600,
      transition: 'width 0.5s ease, transform 0.5s ease',
    });
  }, []);

  const handleFormSubmit: SubmitHandler<PlanTemplateEvent> = async (data) => {
    if (logger.isDebugEnabled()) logger.debug('EventForm handleFormSubmit called with:', data);
    if (!userDetails) {
      throw new Error('userDetails is null');
    }
    const inputData = { ...data };
    try {
      const planTemplateEventProxy = rendererContainer.get<IPlanTemplateEventProxy>(
        TYPES.PlanTemplateEventProxy
      );
      const baseTemplateEvent =
        mode === FORM_MODE.NEW
          ? await planTemplateEventProxy.create(
              userDetails.userId,
              templateId,
              inputData.summary,
              inputData.start,
              inputData.end
            )
          : undefined;
      const merged = { ...baseTemplateEvent, ...inputData };
      await onSubmit(merged);
    } catch (err) {
      logger.error(err);
      throw err;
    }
  };

  const handleClosePlanTemplateEventForm = async (): Promise<void> => {
    await onClose();
  };

  const handleDeletePlanTemplateEvent = async (): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug('handleDelete');
    if (!event) {
      throw new AppError('eventEntry is null');
    }
    const deletedId = event.id;
    if (logger.isDebugEnabled()) logger.debug('deletedId', deletedId);
    await onDelete(deletedId);
  };

  return (
    <FormProvider {...methods}>
      <CustomDialog
        ref={ref}
        open={isOpen}
        onClose={handleClosePlanTemplateEventForm}
        PaperProps={{
          component: 'form',
          onSubmit: handleSubmit(handleFormSubmit),
          style: {
            ...dialogStyle,
            transition: 'width 0.5s ease, transform 0.5s ease',
          },
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            {((): string => {
              const selectedFormModeLabel =
                FORM_MODE_ITEMS.find((item) => item.id === mode)?.name || '';
              return `予定の${selectedFormModeLabel}`;
            })()}
          </Box>
        </DialogTitle>
        <CustomDialogContent>
          <Paper variant="outlined">
            <Grid container spacing={2} padding={2}>
              <Grid item xs={12}>
                <Controller
                  name={`summary`}
                  control={control}
                  defaultValue={''}
                  rules={{
                    required: '入力してください',
                  }}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }): React.ReactElement => (
                    <>
                      <TextField
                        onChange={onChange}
                        value={value}
                        label="タイトル"
                        error={!!error}
                        helperText={error?.message}
                        variant="outlined"
                        fullWidth
                      />
                    </>
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="start"
                  control={control}
                  rules={{
                    required: '入力してください',
                    validate: (value): string | true => {
                      if (!value || !isValid(value)) {
                        return '日時を入力してください';
                      }
                      return true;
                    },
                  }}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }): React.ReactElement => (
                    <TimePickerField
                      label="開始時間"
                      value={value}
                      onChange={onChange}
                      ampm={false}
                      format="HH:mm"
                      slotProps={{
                        textField: {
                          error: !!error,
                          helperText: error ? error.message : '',
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="end"
                  control={control}
                  rules={{
                    required: '入力してください',
                    validate: (value): string | true => {
                      if (!value || !isValid(value)) {
                        return '日時を入力してください';
                      }
                      // if (start && value <= start) {
                      //   return '終了日時は開始日時よりも後の日時にしてください';
                      // }
                      return true;
                    },
                  }}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }): React.ReactElement => (
                    <TimePickerField
                      label="終了時間"
                      value={value}
                      onChange={onChange}
                      ampm={false}
                      format="HH:mm"
                      slotProps={{
                        textField: {
                          error: !!error,
                          helperText: error ? error.message : '',
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name={`projectId`}
                  control={control}
                  render={({ field: { onChange, value } }): JSX.Element => (
                    <ProjectDropdownComponent value={value} onChange={onChange} />
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
                  name={`taskId`}
                  control={control}
                  render={({ field: { onChange, value } }): JSX.Element => (
                    <TaskDropdownComponent
                      value={value}
                      onChange={onChange}
                      projectId={projectId || ''}
                    />
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
                  name={`description`}
                  control={control}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }): React.ReactElement => (
                    <>
                      <TextField
                        onChange={onChange}
                        value={value}
                        label="概要"
                        multiline
                        rows={5}
                        error={!!error}
                        helperText={error?.message}
                        variant="outlined"
                        fullWidth
                      />
                    </>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <FormLabel component="legend">リマインダーの設定</FormLabel>
                <NotificationSettingsFormControl
                  name={`notificationSetting`}
                  min={0}
                  control={control}
                  notificationTimeOffsetProps={{ label: '通知タイミング(秒前)' }}
                />
              </Grid>
            </Grid>
          </Paper>
        </CustomDialogContent>
        <DialogActions>
          {mode !== FORM_MODE.NEW && ( // 新規モード以外で表示のときのみ削除を表示
            <Button onClick={handleDeletePlanTemplateEvent} color="secondary" variant="contained">
              削除
            </Button>
          )}
          <Button type="submit" color="primary" variant="contained">
            保存
          </Button>
          <Button onClick={handleClosePlanTemplateEventForm} color="secondary" variant="contained">
            キャンセル
          </Button>
        </DialogActions>
      </CustomDialog>
    </FormProvider>
  );
};

export default React.forwardRef(PlanTemplateEventForm);
