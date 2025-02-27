import rendererContainer from '../../inversify.config';
import { Grid, MenuItem, Paper, TextField } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { DateTimePicker } from '@mui/x-date-pickers';
import { useActivityUsage } from '@renderer/hooks/useActivityUsage';
import { TYPES } from '@renderer/types';
import { DateUtil } from '@shared/utils/DateUtil';
import { addDays } from 'date-fns';
import { useEffect, useState } from 'react';
import { getStartDate } from '../timeTable/common';
import { useUserPreference } from '@renderer/hooks/useUserPreference';
import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis';
import { ActivityUsage } from '@shared/data/ActivityUsage';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { useBusinessClassificationUsage } from '@renderer/hooks/useBusinessClassificationUsage';

export const ActivityGraph = (): JSX.Element => {
  const { userPreference, loading: loadingUserPreference } = useUserPreference();
  const startHourLocal = loadingUserPreference ? null : userPreference?.startHourLocal;

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [eventType, setEventType] = useState<EVENT_TYPE | undefined>();
  const { activityUsage } = useActivityUsage(startDate, endDate);
  const {businessClassificationUsage} = useBusinessClassificationUsage(startDate, endDate, eventType);

  useEffect(() => {
    // userPreferense が読み込まれた後に反映させる
    if (startHourLocal) {
      const now = rendererContainer.get<DateUtil>(TYPES.DateUtil).getCurrentDate();
      const startDate = getStartDate(now, startHourLocal);
      setStartDate(startDate);
      setEndDate(addDays(startDate, 1));
      setEventType(EVENT_TYPE.ACTUAL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startHourLocal]);

  const handleStartDateChange = (date: Date | null): void => {
    if (date) {
      setStartDate(date);
      setEndDate(addDays(date, 1));
    }
  };

  const handleEndDateChange = (date: Date | null): void => {
    if (date && (!startDate || date >= startDate)) {
      setEndDate(date);
    }
  };

  const handleEventTypeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const selectEventType = !e.target.value ? EVENT_TYPE.ACTUAL : (e.target.value as EVENT_TYPE);
    setEventType(selectEventType);
  };

  const summerizeAsOther = (activityUsage: ActivityUsage[], topN: number): ActivityUsage[] => {
    if (activityUsage.length <= topN) {
      return activityUsage;
    }
    const ret = activityUsage.slice(0, topN);
    const others = activityUsage.slice(topN);
    ret.push({
      basename: 'その他',
      color: '#7d7d7d',
      usageTime: others.reduce((acc, other) => acc + other.usageTime, 0),
    });
    return ret;
  };

  const displayHours = (totalMinutes: number | null): string => {
    if (totalMinutes === null) {
      return '';
    }
    const hours = Math.trunc(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours !== 0) {
      return hours + '時間' + (minutes === 0 ? '' : minutes + '分');
    } else {
      return minutes + '分';
    }
  };

  return (
    <>
      <Paper variant="outlined">
        <Grid container justifyContent={'center'} spacing={2} padding={2}>
          <Grid item xs={12} md={6} textAlign={'center'}>
            <DateTimePicker
              sx={{ width: '13rem' }}
              label={'開始日時'}
              value={startDate ?? null}
              format={'yyyy/MM/dd HH:mm'}
              slotProps={{ textField: { size: 'small' } }}
              onChange={handleStartDateChange}
            />
          </Grid>
          <Grid item xs={12} md={6} textAlign={'center'}>
            <DateTimePicker
              sx={{ width: '13rem' }}
              label={'終了日時'}
              value={endDate ?? null}
              minDateTime={startDate}
              format={'yyyy/MM/dd HH:mm'}
              slotProps={{ textField: { size: 'small' } }}
              onChange={handleEndDateChange}
            />
          </Grid>
          <Grid item xs={12}>
            <BarChart
              height={300}
              series={summerizeAsOther(activityUsage, 5).map((activity) => ({
                data: [Math.round(activity.usageTime / (60 * 1000))],
                label: activity.basename,
                color: activity.color ?? undefined,
                valueFormatter: displayHours,
                stack: 'total',
              }))}
              yAxis={[{ data: [''], scaleType: 'band' }]}
              layout="horizontal"
              tooltip={{ trigger: 'item' }}
              margin={{ left: 100, right: 100 }}
              grid={{ vertical: false, horizontal: true }}
            >
              <ChartsXAxis label="アプリ使用時間(分)" />
            </BarChart>
          </Grid>
          {activityUsage.length !== 0 && (
            <Grid item xs={12}>
              <TextField
                select
                label="予実フィルター"
                value={eventType || ''}
                onChange={handleEventTypeChange}
                variant="outlined"
                sx={{
                  width: '100%',
                  maxWidth: '12rem',
                  margin: { left: 100, right: 100 }
                }}
              >
                <MenuItem key={'PLAN'} value={EVENT_TYPE.PLAN}>
                  予定
                </MenuItem>
                <MenuItem key={'ACTUAL'} value={EVENT_TYPE.ACTUAL}>
                  実績
                </MenuItem>
              </TextField>
              <BarChart
                height={100 * (businessClassificationUsage.length + 1)}
                dataset={businessClassificationUsage.map((businessClassification) => ({
                  basename: businessClassification.basename,
                  usageTime: Math.round(businessClassification.usageTime / (60 * 1000))
                }))}
                series={[
                  {
                    dataKey: 'usageTime',
                    valueFormatter: displayHours,
                  },
                ]}
                yAxis={[
                  {
                    dataKey: 'basename',
                    scaleType: 'band',
                  }
                ]}
                layout="horizontal"
                margin={{ left: 100, right: 100 }}
                grid={{ vertical: false, horizontal: true }}
              >
                <ChartsXAxis label="業務分類別アプリ使用時間(分)" />
              </BarChart>
            </Grid>
          )}
        </Grid>
      </Paper>
    </>
  );
};
