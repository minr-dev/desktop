import rendererContainer from '../../inversify.config';
import React, { useContext, useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  TextField,
  Paper,
  Grid,
  Dialog,
  DialogActions,
  Button,
  DialogContent,
  DialogTitle,
  Box,
} from '@mui/material';
import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { addHours, addMinutes, differenceInMinutes, startOfDay } from 'date-fns';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { eventDateTimeToDate } from '@shared/data/EventDateTime';
import { ProjectDropdownComponent } from '../project/ProjectDropdownComponent';
import { CategoryDropdownComponent } from '../category/CategoryDropdownComponent';
import { LabelMultiSelectComponent } from '../label/LabelMultiSelectComponent';
import { FormContainer } from '../common/form/FormContainer';
import { IEventEntryProxy } from '@renderer/services/IEventEntryProxy';
import { TYPES } from '@renderer/types';
import { AppError } from '@shared/errors/AppError';
import AppContext from '../AppContext';
import { styled } from '@mui/system';
import { ActivityTimeline } from './ActivityTimeline';

export const FORM_MODE = {
  NEW: 'NEW',
  EDIT: 'EDIT',
} as const;
export type FORM_MODE = (typeof FORM_MODE)[keyof typeof FORM_MODE];
export const FORM_MODE_ITEMS: { id: FORM_MODE; name: string }[] = [
  { id: FORM_MODE.NEW, name: '追加' },
  { id: FORM_MODE.EDIT, name: '編集' },
];

const CustomDialogContent = styled(DialogContent)`
  transition: width 0.5s ease;
`;

const CustomDialog = styled(Dialog)`
  & .MuiDialog-paper {
    transition: transform 0.5s ease, width 0.5s ease;
  }
`;

interface EventEntryFormProps {
  isOpen: boolean;
  mode: FORM_MODE;
  eventType: EVENT_TYPE;
  targetDate?: Date;
  startHour: number;
  eventEntry?: EventEntry;
  onSubmit: (eventEntry: EventEntry) => Promise<void>;
  onClose: () => Promise<void>;
  onDelete: () => Promise<void>;
}

/**
 * イベントの追加編集用のコンポーネント。
 *
 * TODO:
 * - プロジェクトのプルダウンの pageSize よりもデータが多いときにどうするかは要検討。
 * - 同じくソートの仕様も要検討。
 *
 * @param {ProjectDropdownComponentProps} props - コンポーネントのプロパティ。
 * @returns {JSX.Element} レンダリング結果。
 */
const EventEntryForm = ({
  isOpen,
  mode,
  eventType,
  targetDate,
  startHour = 0,
  eventEntry,
  onSubmit,
  onClose,
  onDelete,
}: EventEntryFormProps): JSX.Element => {
  console.log('EventEntryForm', isOpen, eventEntry);
  const defaultValues = { ...eventEntry };
  const targetDateTime = targetDate?.getTime();
  if (targetDate && mode === FORM_MODE.NEW) {
    defaultValues.start = {
      dateTime: addHours(startOfDay(targetDate), startHour),
    };
    defaultValues.end = {
      dateTime: addHours(eventDateTimeToDate(defaultValues.start), 1),
    };
  }
  console.log('defaultValues', defaultValues);

  const {
    handleSubmit,
    control,
    setValue,
    reset,
    // formState: { errors },
  } = useForm<EventEntry>();

  useEffect(() => {
    if (mode === FORM_MODE.EDIT) {
      reset(eventEntry);
    } else if (targetDateTime) {
      // 新規のときは、開始時間と終了時間をクリックした
      // 時間帯の1時間で初期化する
      const targetDate = new Date(targetDateTime);
      const startTime = addHours(startOfDay(targetDate), startHour);
      reset({
        start: {
          dateTime: startTime,
        },
        end: {
          dateTime: addHours(startTime, 1),
        },
      });
    }
  }, [mode, eventEntry, reset, targetDateTime, startHour]);

  const { userDetails } = useContext(AppContext);

  const start = useWatch({
    control,
    name: 'start.dateTime',
  });

  const end = useWatch({
    control,
    name: 'end.dateTime',
  });

  // 開始時間を設定したら、変更前と同じ間隔で終了時間を自動修正する
  // 初期の開始時間と終了時間の間隔を分で計算
  if (!defaultValues.start || !defaultValues.end) {
    throw new Error('EventForm: defaultValues.start or defaultValues.end is undefined');
  }
  const initialInterval = differenceInMinutes(
    eventDateTimeToDate(defaultValues.end),
    eventDateTimeToDate(defaultValues.start)
  );
  useEffect(() => {
    if (start) {
      const newEndTime = {
        dateTime: addMinutes(start, initialInterval),
        date: null,
      };
      setValue('end', newEndTime);
    }
  }, [initialInterval, start, mode, setValue]);

  const [dialogStyle, setDialogStyle] = useState({});

  useEffect(() => {
    if (EVENT_TYPE.ACTUAL === eventType) {
      setDialogStyle({
        maxWidth: 800,
        transition: 'width 0.5s ease, transform 0.5s ease',
      });
    } else {
      setDialogStyle({
        maxWidth: 600,
        transition: 'width 0.5s ease, transform 0.5s ease',
      });
    }
  }, [eventType]);

  const handleFormSubmit = async (data): Promise<void> => {
    console.log('EventForm handleFormSubmit called with:', data);
    if (!userDetails) {
      throw new Error('userDetails is null');
    }
    const inputData = { ...data, eventType: eventType };
    try {
      const eventEntryProxy = rendererContainer.get<IEventEntryProxy>(TYPES.EventEntryProxy);
      if (data.id && String(data.id).length > 0) {
        const id = `${data.id}`;
        const ee = await eventEntryProxy.get(id);
        if (!ee) {
          throw new Error(`EventEntry not found. id=${id}`);
        }
        const merged = { ...ee, ...inputData };
        const saved = await eventEntryProxy.save(merged);
        await onSubmit(saved);
      } else {
        // TODO EventDateTime の対応
        const ee = await eventEntryProxy.create(
          userDetails.userId,
          inputData.eventType,
          inputData.summary,
          inputData.start,
          inputData.end
        );
        const merged = { ...ee, ...inputData };
        const saved = await eventEntryProxy.save(merged);
        await onSubmit(saved);
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleCloseEventEntryForm = async (): Promise<void> => {
    await onClose();
  };

  const handleDeleteEventEntry = async (): Promise<void> => {
    console.log('handleDelete');
    if (!eventEntry) {
      throw new AppError('eventEntry is null');
    }
    const deletedId = eventEntry.id;
    console.log('deletedId', deletedId);
    try {
      const eventEntryProxy = rendererContainer.get<IEventEntryProxy>(TYPES.EventEntryProxy);
      await eventEntryProxy.delete(deletedId);
      await onDelete();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return (
    <>
      <CustomDialog
        open={isOpen}
        onClose={handleCloseEventEntryForm}
        PaperProps={{
          style: {
            ...dialogStyle,
            transition: 'width 0.5s ease, transform 0.5s ease',
          },
        }}
      >
        <FormContainer
          isVisible={isOpen}
          formId="event-entry-form"
          onSubmit={handleSubmit(handleFormSubmit)}
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              {((): string => {
                const selectedEventTypeLabel = EVENT_TYPE.ACTUAL === eventType ? '実績' : '予定';
                const selectedFormModeLabel =
                  FORM_MODE_ITEMS.find((item) => item.id === mode)?.name || '';
                return `${selectedEventTypeLabel}の${selectedFormModeLabel}`;
              })()}
            </Box>
          </DialogTitle>
          <CustomDialogContent>
            <Grid container spacing={2}>
              {EVENT_TYPE.ACTUAL === eventType && targetDate && (
                <Grid item xs={6}>
                  <ActivityTimeline
                    selectedDate={targetDate}
                    focusTimeStart={start || targetDate}
                    focusTimeEnd={end || targetDate}
                  />
                </Grid>
              )}
              <Grid item xs={EVENT_TYPE.ACTUAL === eventType ? 6 : 12}>
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
                        name="start.dateTime"
                        control={control}
                        rules={{
                          required: '入力してください',
                        }}
                        render={({ field: { onChange, value } }): React.ReactElement => (
                          <DatePicker
                            label="開始日時"
                            value={value}
                            onChange={onChange}
                            format="yyyy/MM/dd"
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Controller
                        name="end.dateTime"
                        control={control}
                        rules={{
                          required: '入力してください',
                          validate: (value): string | true => {
                            if (value && start && value <= start) {
                              return '終了時間は開始時間よりも後の時間にしてください';
                            }
                            return true;
                          },
                        }}
                        render={({ field: { onChange, value } }): React.ReactElement => (
                          <DatePicker
                            label="終了日時"
                            value={value}
                            onChange={onChange}
                            format="yyyy/MM/dd"
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Controller
                        name="start.dateTime"
                        control={control}
                        rules={{
                          required: '入力してください',
                        }}
                        render={({ field: { onChange, value } }): React.ReactElement => (
                          <TimePicker
                            label="開始時間"
                            value={value}
                            onChange={onChange}
                            ampm={false}
                            format="HH:mm"
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Controller
                        name="end.dateTime"
                        control={control}
                        rules={{
                          required: '入力してください',
                          validate: (value): string | true => {
                            if (value && start && value <= start) {
                              return '終了時間は開始時間よりも後の時間にしてください';
                            }
                            return true;
                          },
                        }}
                        render={({ field: { onChange, value } }): React.ReactElement => (
                          <TimePicker
                            label="終了時間"
                            value={value}
                            onChange={onChange}
                            ampm={false}
                            format="HH:mm"
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
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </CustomDialogContent>
          <DialogActions>
            {mode !== FORM_MODE.NEW && ( // 新規モード以外で表示のときのみ削除を表示
              <Button onClick={handleDeleteEventEntry} color="secondary" variant="contained">
                削除
              </Button>
            )}
            <Button type="submit" color="primary" variant="contained">
              保存
            </Button>
            <Button onClick={handleCloseEventEntryForm} color="secondary" variant="contained">
              キャンセル
            </Button>
          </DialogActions>
        </FormContainer>
      </CustomDialog>
    </>
  );
};

export default React.forwardRef(EventEntryForm);
