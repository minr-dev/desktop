import {
  TextField,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Grid,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import React from 'react';
import { useForm, SubmitHandler, Controller, useFieldArray } from 'react-hook-form';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export enum CalendarType {
  PLANNED = '1',
  ACTUAL = '2',
  OTHER = '3',
}

type CalendarSetting = {
  calendarId: string;
  type: CalendarType;
  announce: boolean;
  announceTimeOffset: number;
  announceTextTemplate: string;
};

type Setting = {
  syncGoogleCalendar: boolean;
  calendars: CalendarSetting[];

  announceTimeSignal: boolean;
  timeSignalInterval: number;
  timeSignalTextTemplate: string;
};

const PreferencePage: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<Setting>({
    defaultValues: {
      syncGoogleCalendar: false,
      calendars: [
        {
          calendarId: '',
          type: CalendarType.PLANNED,
          announce: false,
          announceTimeOffset: 0,
          announceTextTemplate: '',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: 'calendars', // unique name for your Field Array
    // keyName: "id", default to "id", you can change the key name
  });

  const handleAdd = (): void => {
    append({
      calendarId: '',
      type: CalendarType.PLANNED,
      announce: false,
      announceTimeOffset: 0,
      announceTextTemplate: '',
    });
  };

  const handleDelete = (index: number) => () => {
    remove(index);
  };

  const onSubmit: SubmitHandler<Setting> = (data: Setting): void => {
    console.log(`submit: ${data}`);
    if (Object.keys(formErrors).length === 0) {
      // エラーがない場合の処理
      console.log('フォームデータの送信:', data);
    } else {
      // エラーがある場合の処理
      console.log('エラーがあります:', formErrors);
    }
  };

  return (
    <>
      <p>Preferences</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Paper variant="outlined">
          <Grid container spacing={2} padding={2}>
            <Grid item xs={12} md={12}>
              <Controller
                name="syncGoogleCalendar"
                defaultValue={false}
                control={control}
                rules={{ required: { value: true, message: 'チェックを入れてください' } }}
                render={({ field, fieldState: { error } }): React.ReactElement => (
                  <>
                    <FormControlLabel
                      {...field}
                      label="Google Calendar と連携する"
                      control={<Checkbox />}
                      onChange={(
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        _event: React.SyntheticEvent<Element, Event>,
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        _checked: boolean
                      ): void => {
                        // handle the change event here
                      }}
                    />
                    <FormHelperText error={!!error?.message}>{error?.message}</FormHelperText>
                  </>
                )}
              />
              {fields.map((field, index) => {
                return (
                  // 必ず fields オブジェクトの id をコンポーネントの key に割り当てる
                  <React.Fragment key={field.id}>
                    <Paper variant="outlined" style={{ marginTop: '1ch' }}>
                      <Grid container spacing={2} padding={2}>
                        <Grid item xs={11} md={11}>
                          <Typography variant="h6">{`カレンダー(${index + 1})`}</Typography>
                        </Grid>
                        <Grid
                          item
                          xs={1}
                          md={1}
                          container
                          justifyContent="flex-end"
                          alignItems="flex-start"
                        >
                          <IconButton onClick={handleDelete(index)} aria-label="delete">
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                        <Grid item xs={0}>
                          <Controller
                            name={`calendars.${index}.calendarId`}
                            control={control}
                            defaultValue={field.calendarId}
                            rules={{ required: true }}
                            render={({ field }): React.ReactElement => (
                              <TextField {...field} label="カレンダーID" variant="outlined" />
                            )}
                          />
                        </Grid>
                        <Grid item xs={0}>
                          <FormControl style={{ width: '14ch' }}>
                            <InputLabel id={`calendars.${index}.type-label`}>
                              カレンダータイプ
                            </InputLabel>
                            <Controller
                              name={`calendars.${index}.type`}
                              control={control}
                              defaultValue={field.type}
                              rules={{ required: true }}
                              render={({ field }): React.ReactElement => (
                                <Select
                                  {...field}
                                  labelId={`calendars.${index}.type-label`}
                                  onChange={(e): void => {
                                    field.onChange(e.target.value as CalendarType);
                                  }}
                                >
                                  <MenuItem value={CalendarType.PLANNED}>予定</MenuItem>
                                  <MenuItem value={CalendarType.ACTUAL}>実績</MenuItem>
                                  <MenuItem value={CalendarType.OTHER}>その他</MenuItem>
                                </Select>
                              )}
                            />
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} mt={1} mb={1}>
                          <Controller
                            name={`calendars.${index}.announce`}
                            control={control}
                            defaultValue={field.announce}
                            render={({ field }): React.ReactElement => (
                              <FormControlLabel
                                control={<Checkbox {...field} checked={field.value} />}
                                label={`読み上げる`}
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={0}>
                          <Controller
                            name={`calendars.${index}.announceTimeOffset`}
                            control={control}
                            defaultValue={field.announceTimeOffset}
                            rules={{ required: true }}
                            render={({ field }): React.ReactElement => (
                              <TextField {...field} label="読み上げ時間差" variant="outlined" />
                            )}
                          />
                        </Grid>
                        <Grid item xs={0}>
                          <Controller
                            name={`calendars.${index}.announceTextTemplate`}
                            control={control}
                            defaultValue={field.announceTextTemplate}
                            rules={{ required: true }}
                            render={({ field }): React.ReactElement => (
                              <TextField
                                {...field}
                                label="読み上げフォーマット"
                                variant="outlined"
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </React.Fragment>
                );
              })}
              <IconButton onClick={handleAdd} color="primary" aria-label="add">
                <AddIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Paper>
      </form>

      {Object.keys(formErrors).length > 0 && (
        <div>
          <Typography variant="h2">エラーメッセージ:</Typography>
          {Object.entries(formErrors).map(([fieldName, error]) => (
            <Alert key={fieldName} severity="error">
              {error.message}
            </Alert>
          ))}
        </div>
      )}
    </>
  );
};

export default PreferencePage;
