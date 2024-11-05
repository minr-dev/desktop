import { addDays, subDays } from 'date-fns';
import { useEffect, useState } from 'react';
import rendererContainer from '../../inversify.config';
import { getStartDate } from '../timeTable/common';
import { Button, Grid, MenuItem, Paper, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useUserPreference } from '@renderer/hooks/useUserPreference';
import { IEventEntryCsvProxy } from '@renderer/services/IEventEntryCsvProxy';
import { TYPES } from '@renderer/types';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { EventEntryCsvSetting } from '@shared/data/EventEntryCsvSetting';
import { DateUtil } from '@shared/utils/DateUtil';

export const EventEntryCsvOutput = (): JSX.Element => {
  const { userPreference, loading: loadingUserPreference } = useUserPreference();
  const startHourLocal = loadingUserPreference ? null : userPreference?.startHourLocal;

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedFilter, setSelectedFilter] = useState<string | undefined>('NULL');

  useEffect(() => {
    if (startHourLocal) {
      const now = rendererContainer.get<DateUtil>(TYPES.DateUtil).getCurrentDate();
      const startDate = getStartDate(now, startHourLocal);
      setStartDate(subDays(startDate, 30));
      setEndDate(startDate);
    }
  }, [startHourLocal]);

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
    setSelectedFilter(e.target.value);
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      if (!startDate) throw new Error('startDate is undefined');
      if (!endDate) throw new Error('endDate is undefined');
      const filter: EVENT_TYPE | undefined =
        selectedFilter === 'NULL' ? undefined : (selectedFilter as EVENT_TYPE);
      const newEventEntryCsvSetting: EventEntryCsvSetting = {
        start: startDate,
        end: endDate,
        eventType: filter,
      };

      const eventEntryCsvProxy = rendererContainer.get<IEventEntryCsvProxy>(
        TYPES.EventEntryCsvProxy
      );
      const csvContent = await eventEntryCsvProxy.createCsv(newEventEntryCsvSetting);

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'EventEntry.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('An error occurred:', error);
    }
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
              value={selectedFilter}
              onChange={handleChange}
              variant="outlined"
              sx={{
                width: '100%',
                maxWidth: '27rem',
              }}
            >
              <MenuItem value={'NULL'}>
                <em>フィルター無し</em>
              </MenuItem>
              <MenuItem key={'PLAN'} value={EVENT_TYPE.PLAN}>
                予定のみ
              </MenuItem>
              <MenuItem key={'ACTUAL'} value={EVENT_TYPE.ACTUAL}>
                実績のみ
              </MenuItem>
              <MenuItem key={'SHARED'} value={EVENT_TYPE.SHARED}>
                共有のみ
              </MenuItem>
            </TextField>
          </Grid>
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
