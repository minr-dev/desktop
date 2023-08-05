import React, { useEffect, useImperativeHandle, useRef } from 'react';
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { TextField, Paper, Grid } from '@mui/material';
import { EVENT_TYPE, EventEntry } from '@shared/dto/EventEntry';
import { addHours, addMinutes, differenceInMinutes, startOfDay } from 'date-fns';
import { TimePicker } from '@mui/x-date-pickers';

export const FORM_MODE = {
  NEW: 'NEW',
  EDIT: 'EDIT',
} as const;
export type FORM_MODE = (typeof FORM_MODE)[keyof typeof FORM_MODE];
export const FORM_MODE_ITEMS: { id: FORM_MODE; name: string }[] = [
  { id: FORM_MODE.NEW, name: '追加' },
  { id: FORM_MODE.EDIT, name: '編集' },
];

interface EventEntryFormProps {
  mode: FORM_MODE;
  eventType: EVENT_TYPE;
  targetDate: Date;
  startHour: number;
  initialValues?: EventEntry;
  onSubmit: SubmitHandler<EventEntry>;
}

const EventEntryForm = (
  { mode, eventType, targetDate, startHour = 0, initialValues, onSubmit }: EventEntryFormProps,
  ref: React.ForwardedRef<unknown>
): JSX.Element => {
  const formRef = useRef<HTMLFormElement>(null);

  const defaultValues = {
    id: initialValues?.id || '',
    summary: initialValues?.summary || '',
    start: initialValues?.start || undefined,
    end: initialValues?.end || undefined,
    description: initialValues?.description || '',
  };
  if (mode === FORM_MODE.NEW) {
    defaultValues.start = addHours(startOfDay(targetDate), startHour);
    defaultValues.end = addHours(defaultValues.start, 1);
  }

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<EventEntry>({ defaultValues });
  console.log('EventForm errors', errors);

  useImperativeHandle(ref, () => ({
    submit: (): void => {
      console.log('useImperativeHandle submit called');
      if (formRef.current) {
        formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    },
  }));

  const start = useWatch({
    control,
    name: 'start',
    defaultValue: defaultValues.start,
  });

  // 開始時間を設定したら、変更前と同じ間隔で終了時間を自動修正する
  // 初期の開始時間と終了時間の間隔を分で計算
  if (!defaultValues.start || !defaultValues.end) {
    throw new Error('EventForm: defaultValues.start or defaultValues.end is undefined');
  }
  const initialInterval = differenceInMinutes(defaultValues.end, defaultValues.start);
  useEffect(() => {
    if (start) {
      const newEndTime = addMinutes(start, initialInterval);
      setValue('end', newEndTime);
    }
  }, [initialInterval, start, mode, setValue]);

  const handleFormSubmit: SubmitHandler<EventEntry> = (data) => {
    console.log('EventForm handleFormSubmit called with:', data);
    const eventData = { ...data, eventType: eventType };
    onSubmit(eventData);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit(handleFormSubmit)}>
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
          <Grid item xs={0}>
            <Controller
              name="start"
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
          <Grid item xs={0}>
            <Controller
              name="end"
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
              name={`description`}
              control={control}
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
    </form>
  );
};

export default React.forwardRef(EventEntryForm);
