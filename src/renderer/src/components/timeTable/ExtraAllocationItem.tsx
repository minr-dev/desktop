import { TextField, Grid, Typography, Paper, Chip } from '@mui/material';
import React from 'react';
import { Controller, Control, useWatch } from 'react-hook-form';
import { ExtraAllocationFormData } from './ExtraAllocationForm';

interface ExtraAllocationItemProps {
  index: number;
  control: Control<ExtraAllocationFormData, unknown>;
}

export const ExtraAllocationItem = ({ index, control }: ExtraAllocationItemProps): JSX.Element => {
  const taskData = useWatch({ control, name: `allocations.${index}` });
  const scheduledTime = {
    hours: Math.floor(taskData.scheduledMinutes / 60),
    minutes: taskData.scheduledMinutes % 60,
  };
  return (
    <Paper variant="outlined" style={{ marginTop: '1ch' }}>
      <Grid container spacing={2} padding={2}>
        <Grid item xs={9}>
          <Typography variant="h6">{taskData.taskName}</Typography>
        </Grid>
        <Grid item xs={3}>
          {taskData.projectName && <Chip label={taskData.projectName} />}
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">見積工数: {taskData.estimatedHours}時間</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            予定登録された合計時間: {scheduledTime.hours ? `${scheduledTime.hours}時間` : ''}
            {scheduledTime.minutes}分
          </Typography>
        </Grid>
        <Grid item xs={0}>
          <Controller
            name={`allocations.${index}.extraAllocateHours`}
            control={control}
            rules={{
              required: '入力してください。',
              min: { value: 0, message: '0以上の値を入力してください。' },
            }}
            render={({ field, fieldState: { error } }): React.ReactElement => (
              <>
                <TextField
                  {...field}
                  type="number"
                  label="追加工数"
                  error={!!error}
                  helperText={error?.message}
                  variant="outlined"
                  InputProps={{
                    inputProps: {
                      min: 0,
                    },
                  }}
                />
              </>
            )}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};
