import {
  TextField,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Grid,
  Typography,
  Paper,
} from '@mui/material';
import React from 'react';
import { Controller, Control, useController } from 'react-hook-form';
import DeleteIcon from '@mui/icons-material/Delete';
import { UserPreference } from '@shared/data/UserPreference';
import { EVENT_TYPE } from '@shared/data/EventEntry';

interface CalendarItemProps {
  index: number;
  control: Control<UserPreference, unknown>;
  onDelete: () => void;
}

export const CalendarItem = ({ index, control, onDelete }: CalendarItemProps): JSX.Element => {
  const { field } = useController({
    name: `calendars.${index}.calendarId`,
    control,
  });

  return (
    // 必ず fields オブジェクトの id をコンポーネントの key に割り当てる
    <React.Fragment key={index}>
      <Paper variant="outlined" style={{ marginTop: '1ch' }}>
        <Grid container spacing={2} padding={2}>
          <Grid item xs={11} md={11}>
            <Typography variant="h6">{`カレンダー(${index + 1})`}</Typography>
          </Grid>
          <Grid item xs={1} md={1} container justifyContent="flex-end" alignItems="flex-start">
            <IconButton onClick={onDelete} aria-label="delete">
              <DeleteIcon />
            </IconButton>
          </Grid>
          <Grid item xs={0}>
            <Controller
              name={`calendars.${index}.calendarId`}
              control={control}
              defaultValue={field.value}
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
                    label="カレンダーID"
                    error={!!error}
                    helperText={error?.message}
                    variant="outlined"
                  />
                </>
              )}
            />
          </Grid>
          <Grid item xs={0}>
            <FormControl style={{ width: '14ch' }}>
              <InputLabel id={`calendars.${index}.type-label`}>カレンダータイプ</InputLabel>
              <Controller
                name={`calendars.${index}.eventType`}
                control={control}
                defaultValue={EVENT_TYPE[field.value as keyof typeof EVENT_TYPE]}
                rules={{ required: '入力してください' }}
                render={({ field, fieldState: { error } }): React.ReactElement => (
                  <>
                    <Select
                      {...field}
                      labelId={`calendars.${index}.type-label`}
                      onChange={(e): void => {
                        field.onChange(e.target.value as EVENT_TYPE);
                      }}
                    >
                      <MenuItem value={EVENT_TYPE.SHARED}>共有</MenuItem>
                      <MenuItem value={EVENT_TYPE.PLAN}>予定</MenuItem>
                      <MenuItem value={EVENT_TYPE.ACTUAL}>実績</MenuItem>
                    </Select>
                    {error && <FormHelperText error>{error.message}</FormHelperText>}
                  </>
                )}
              />
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
    </React.Fragment>
  );
};
