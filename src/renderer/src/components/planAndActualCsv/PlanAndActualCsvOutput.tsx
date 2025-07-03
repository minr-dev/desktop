import { addDays, differenceInDays, subDays } from 'date-fns';
import { useEffect, useState } from 'react';
import rendererContainer from '../../inversify.config';
import { Alert, Button, Grid, MenuItem, Paper, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { IPlanAndActualCsvProxy } from '@renderer/services/IPlanAndActualCsvProxy';
import { TYPES } from '@renderer/types';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { PlanAndActualCsvSetting } from '@shared/data/PlanAndActualCsvSetting';
import { DateUtil } from '@shared/utils/DateUtil';

export const PlanAndActualCsvOutput = (): JSX.Element => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedEventType, setSelectedEventType] = useState<string>();
  const [warning, setWarning] = useState<string>('');

  useEffect(() => {
    const dateTime = rendererContainer.get<DateUtil>(TYPES.DateUtil).getCurrentDate();
    const now = new Date(
      dateTime.getFullYear(),
      dateTime.getMonth(),
      dateTime.getDate(),
      0,
      0,
      0,
      0
    );
    setStartDate(subDays(now, 29));
    setEndDate(now);
  }, []);

  const handleStartDateChange = (date: Date | null): void => {
    if (date && (!endDate || date >= endDate)) {
      setStartDate(date);
      setEndDate(addDays(date, 1));
    } else if (date) {
      setStartDate(date);
    }
  };

  const handleEndDateChange = (date: Date | null): void => {
    if (date && (!startDate || date <= startDate)) {
      setEndDate(date);
      setStartDate(subDays(date, 1));
    } else if (date) {
      setEndDate(date);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSelectedEventType(e.target.value);
  };

  const handleSubmit = async (): Promise<void> => {
    if (!startDate) throw new Error('startDate is undefined');
    if (!endDate) throw new Error('endDate is undefined');
    if (differenceInDays(addDays(endDate, 1), startDate) > 30) {
      setWarning('開始日時と終了日時の期間が30日を超えています');
      return;
    } else {
      setWarning('');
    }
    const eventType: EVENT_TYPE | undefined =
      selectedEventType === '' ? undefined : (selectedEventType as EVENT_TYPE);
    const newPlanAndActualCsvSetting: PlanAndActualCsvSetting = {
      start: startDate,
      end: addDays(endDate, 1),
      eventType: eventType,
    };

    const planAndActualCsvProxy = rendererContainer.get<IPlanAndActualCsvProxy>(
      TYPES.PlanAndActualCsvProxy
    );
    const csvContent = await planAndActualCsvProxy.createCsv(newPlanAndActualCsvSetting);

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '予実管理.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Paper variant="outlined">
        <Grid container justifyContent={'center'} spacing={2} padding={2}>
          <Grid item md={6} textAlign={'right'}>
            <DatePicker
              sx={{
                width: '100%',
                maxWidth: '13rem',
              }}
              label={'開始日時'}
              value={startDate ?? null}
              format={'yyyy/MM/dd'}
              slotProps={{ textField: { size: 'small' } }}
              onChange={handleStartDateChange}
            />
          </Grid>
          <Grid item md={6} textAlign={'left'}>
            <DatePicker
              sx={{
                width: '100%',
                maxWidth: '13rem',
              }}
              label={'終了日時'}
              value={endDate ?? null}
              format={'yyyy/MM/dd'}
              slotProps={{ textField: { size: 'small' } }}
              onChange={handleEndDateChange}
            />
          </Grid>
          <Grid item xs={12} textAlign={'center'}>
            <TextField
              select
              label="予実フィルター"
              value={selectedEventType || ''}
              onChange={handleChange}
              variant="outlined"
              sx={{
                width: '100%',
                maxWidth: '27rem',
                textAlign: 'left',
              }}
            >
              <MenuItem value={''}>
                <em>フィルター無し</em>
              </MenuItem>
              <MenuItem key={'PLAN'} value={EVENT_TYPE.PLAN}>
                予定のみ
              </MenuItem>
              <MenuItem key={'ACTUAL'} value={EVENT_TYPE.ACTUAL}>
                実績のみ
              </MenuItem>
            </TextField>
          </Grid>
          {warning && (
            <Grid item xs={12} display="flex" justifyContent={'center'}>
              <Alert
                severity="error"
                sx={{
                  width: '100%',
                  maxWidth: '25rem',
                }}
              >
                {warning}
              </Alert>
            </Grid>
          )}
          <Grid item xs={12} textAlign={'center'}>
            <Button type="submit" color="primary" variant="contained" onClick={handleSubmit}>
              CSVを作成
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};
