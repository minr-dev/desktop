import rendererContainer from '../../inversify.config';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { DateTimePicker } from '@mui/x-date-pickers';
import { useActivityUsage } from '@renderer/hooks/useActivityUsage';
import { TYPES } from '@renderer/types';
import { DateUtil } from '@shared/utils/DateUtil';
import { addDays } from 'date-fns';
import { useEffect, useState } from 'react';
import { getStartDate, getStartWeekDay } from '../timeTable/common';
import { useUserPreference } from '@renderer/hooks/useUserPreference';
import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis';
import { ActivityUsage } from '@shared/data/ActivityUsage';
import { useEventAggregationProject } from '@renderer/hooks/useEventAggregationProject';
import { useEventAggregationCategory } from '@renderer/hooks/useEventAggregationCategory';
import { useEventAggregationTask } from '@renderer/hooks/useEventAggregationTask';
import { useEventAggregationLabel } from '@renderer/hooks/useEventAggregationLabel';
import { ExpandLessRounded } from '@mui/icons-material';
import { AnalysisTable } from './AnalysisTable';
import { EventAggregationGraph } from './EventAggregationGraph';

const isValidWeekDay = (value): value is 0 | 1 | 2 | 3 | 4 | 5 | 6 => {
  return [0, 1, 2, 3, 4, 5, 6].includes(value);
};

export const WorkAnalysis = (): JSX.Element => {
  const { userPreference, loading: loadingUserPreference } = useUserPreference();
  const startHourLocal = loadingUserPreference ? 0 : userPreference?.startHourLocal ?? 0;
  const startWeekDayLocal = loadingUserPreference
    ? 0
    : isValidWeekDay(userPreference?.startWeekDayLocal) && userPreference
    ? userPreference.startWeekDayLocal
    : 0;

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const { activityUsage } = useActivityUsage(startDate, endDate);
  const { eventAggregationProjectPlan, eventAggregationProjectActual, analysisTableProject } =
    useEventAggregationProject(startDate, endDate);
  const { eventAggregationCategoryPlan, eventAggregationCategoryActual, analysisTableCategory } =
    useEventAggregationCategory(startDate, endDate);
  const { eventAggregationTaskPlan, eventAggregationTaskActual, analysisTableTask } =
    useEventAggregationTask(startDate, endDate);
  const { eventAggregationLabelPlan, eventAggregationLabelActual, analysisTableLabel } =
    useEventAggregationLabel(startDate, endDate);

  useEffect(() => {
    const now = rendererContainer.get<DateUtil>(TYPES.DateUtil).getCurrentDate();
    const startWeekDay = getStartWeekDay(now, startWeekDayLocal);
    const startDate = getStartDate(startWeekDay, startHourLocal);
    setStartDate(startDate);
    setEndDate(addDays(startDate, 7));
  }, [startHourLocal, startWeekDayLocal]);

  const handleStartDateChange = (date: Date | null): void => {
    if (date) {
      setStartDate(date);
      setEndDate(addDays(date, 7));
    }
  };

  const handleEndDateChange = (date: Date | null): void => {
    if (date && (!startDate || date >= startDate)) {
      setEndDate(date);
    }
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
        <Grid container spacing={1} padding={1}>
          <Grid item xs={12}>
            <Paper variant="outlined">
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandLessRounded />}
                  sx={{ flexDirection: 'row-reverse' }}
                >
                  <Typography>プロジェクト別作業時間</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container justifyContent={'center'} spacing={2} padding={2}>
                    <Grid container justifyContent={'left'} spacing={2} padding={2}>
                      <Grid item textAlign={'center'}>
                        <DateTimePicker
                          sx={{ width: '13rem' }}
                          label={'開始日時'}
                          value={startDate ?? null}
                          format={'yyyy/MM/dd HH:mm'}
                          slotProps={{ textField: { size: 'small' } }}
                          onChange={handleStartDateChange}
                        />
                      </Grid>
                      <Grid item textAlign={'center'}>
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
                    </Grid>
                    <Grid item xs={12}>
                      <EventAggregationGraph
                        graphTitle="プロジェクト別の作業時間(分)"
                        valueFormatter={displayHours}
                        eventAggregationPlan={eventAggregationProjectPlan}
                        eventAggregationActual={eventAggregationProjectActual}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <AnalysisTable
                        title="プロジェクト別作業時間"
                        analysisTableData={analysisTableProject}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper variant="outlined">
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandLessRounded />}
                  sx={{ flexDirection: 'row-reverse' }}
                >
                  <Typography>カテゴリ別作業時間</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container justifyContent={'center'} spacing={2} padding={2}>
                    <Grid container justifyContent={'left'} spacing={2} padding={2}>
                      <Grid item textAlign={'center'}>
                        <DateTimePicker
                          sx={{ width: '13rem' }}
                          label={'開始日時'}
                          value={startDate ?? null}
                          format={'yyyy/MM/dd HH:mm'}
                          slotProps={{ textField: { size: 'small' } }}
                          onChange={handleStartDateChange}
                        />
                      </Grid>
                      <Grid item textAlign={'center'}>
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
                    </Grid>
                    <Grid item xs={12}>
                      <EventAggregationGraph
                        graphTitle="カテゴリ別の作業時間(分)"
                        valueFormatter={displayHours}
                        eventAggregationPlan={eventAggregationCategoryPlan}
                        eventAggregationActual={eventAggregationCategoryActual}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <AnalysisTable
                        title="カテゴリ別作業時間一覧"
                        analysisTableData={analysisTableCategory}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper variant="outlined">
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandLessRounded />}
                  sx={{ flexDirection: 'row-reverse' }}
                >
                  <Typography>タスク別作業時間</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container justifyContent={'center'} spacing={2} padding={2}>
                    <Grid container justifyContent={'left'} spacing={2} padding={2}>
                      <Grid item textAlign={'center'}>
                        <DateTimePicker
                          sx={{ width: '13rem' }}
                          label={'開始日時'}
                          value={startDate ?? null}
                          format={'yyyy/MM/dd HH:mm'}
                          slotProps={{ textField: { size: 'small' } }}
                          onChange={handleStartDateChange}
                        />
                      </Grid>
                      <Grid item textAlign={'center'}>
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
                    </Grid>
                    <Grid item xs={12}>
                      <EventAggregationGraph
                        graphTitle="タスク別の作業時間(分)"
                        valueFormatter={displayHours}
                        eventAggregationPlan={eventAggregationTaskPlan}
                        eventAggregationActual={eventAggregationTaskActual}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <AnalysisTable
                        title="タスク別作業時間一覧"
                        analysisTableData={analysisTableTask}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper variant="outlined">
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandLessRounded />}
                  sx={{ flexDirection: 'row-reverse' }}
                >
                  <Typography>ラベル別作業時間</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container justifyContent={'center'} spacing={2} padding={2}>
                    <Grid container justifyContent={'left'} spacing={2} padding={2}>
                      <Grid item textAlign={'center'}>
                        <DateTimePicker
                          sx={{ width: '13rem' }}
                          label={'開始日時'}
                          value={startDate ?? null}
                          format={'yyyy/MM/dd HH:mm'}
                          slotProps={{ textField: { size: 'small' } }}
                          onChange={handleStartDateChange}
                        />
                      </Grid>
                      <Grid item textAlign={'center'}>
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
                    </Grid>
                    <Grid item xs={12}>
                      <EventAggregationGraph
                        graphTitle="ラベル別の作業時間(分)"
                        valueFormatter={displayHours}
                        eventAggregationPlan={eventAggregationLabelPlan}
                        eventAggregationActual={eventAggregationLabelActual}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <AnalysisTable
                        title="ラベル別作業時間一覧"
                        analysisTableData={analysisTableLabel}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper variant="outlined">
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandLessRounded />}
                  sx={{ flexDirection: 'row-reverse' }}
                >
                  <Typography>アプリ使用時間</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container justifyContent={'center'} spacing={2} padding={2}>
                    <Grid container justifyContent={'left'} spacing={2} padding={2}>
                      <Grid item textAlign={'center'}>
                        <DateTimePicker
                          sx={{ width: '13rem' }}
                          label={'開始日時'}
                          value={startDate ?? null}
                          format={'yyyy/MM/dd HH:mm'}
                          slotProps={{ textField: { size: 'small' } }}
                          onChange={handleStartDateChange}
                        />
                      </Grid>
                      <Grid item textAlign={'center'}>
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
                        xAxis={[{ valueFormatter: displayHours, tickNumber: 20 }]}
                        layout="horizontal"
                        tooltip={{ trigger: 'item' }}
                        margin={{ left: 100, right: 100 }}
                        grid={{ vertical: false, horizontal: true }}
                      >
                        <ChartsXAxis label="アプリ使用時間(分)" />
                      </BarChart>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};
