import rendererContainer from '../../inversify.config';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
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
import { useEventAggregationProject } from '@renderer/hooks/useEventAggregationProject';
import { useEventAggregationCategory } from '@renderer/hooks/useEventAggregationCategory';
import { useEventAggregationTask } from '@renderer/hooks/useEventAggregationTask';
import { useEventAggregationLabel } from '@renderer/hooks/useEventAggregationLabel';
import { ExpandLessRounded } from '@mui/icons-material';
import { AnalysisTable } from './AnalysisTable';

export const WorkAnalysis = (): JSX.Element => {
  const { userPreference, loading: loadingUserPreference } = useUserPreference();
  const startHourLocal = loadingUserPreference ? null : userPreference?.startHourLocal;

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [eventType, setEventType] = useState<EVENT_TYPE>(EVENT_TYPE.ACTUAL);
  const { activityUsage } = useActivityUsage(startDate, endDate);
  const { eventAggregationProject, analysisTableProject } = useEventAggregationProject(
    startDate,
    endDate,
    eventType
  );
  const { eventAggregationCategory, analysisTableCategory } = useEventAggregationCategory(
    startDate,
    endDate,
    eventType
  );
  const { eventAggregationTask, analysisTableTask } = useEventAggregationTask(
    startDate,
    endDate,
    eventType
  );
  const { eventAggregationLabel, analysisTableLabel } = useEventAggregationLabel(
    startDate,
    endDate,
    eventType
  );

  useEffect(() => {
    // userPreferense が読み込まれた後に反映させる
    const now = rendererContainer.get<DateUtil>(TYPES.DateUtil).getCurrentDate();
    const startDate = getStartDate(now, startHourLocal ? startHourLocal : 0);
    setStartDate(startDate);
    setEndDate(addDays(startDate, 1));
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
                      <Grid item textAlign={'left'}>
                        <TextField
                          select
                          label="表示タイプ"
                          value={eventType || ''}
                          onChange={handleEventTypeChange}
                          variant="outlined"
                          size={'small'}
                          sx={{
                            width: '13rem',
                          }}
                        >
                          <MenuItem key={'PLAN'} value={EVENT_TYPE.PLAN}>
                            予定
                          </MenuItem>
                          <MenuItem key={'ACTUAL'} value={EVENT_TYPE.ACTUAL}>
                            実績
                          </MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <BarChart
                        height={400}
                        dataset={eventAggregationProject.map((eventAggregationTime) => ({
                          name: eventAggregationTime.name,
                          aggregationTime: Math.round(
                            eventAggregationTime.aggregationTime / (60 * 1000)
                          ),
                        }))}
                        series={[
                          {
                            dataKey: 'aggregationTime',
                            valueFormatter: displayHours,
                          },
                        ]}
                        yAxis={[
                          {
                            dataKey: 'name',
                            scaleType: 'band',
                          },
                        ]}
                        xAxis={[
                          {
                            scaleType: 'time',
                            valueFormatter: displayHours,
                            tickNumber: 20,
                          },
                        ]}
                        layout="horizontal"
                        margin={{ left: 100, right: 100 }}
                        grid={{ vertical: false, horizontal: true }}
                      >
                        <ChartsXAxis label="プロジェクト別作業時間(分)" />
                      </BarChart>
                    </Grid>
                    <Grid item xs={12}>
                      <AnalysisTable
                        title="プロジェクト別作業時間"
                        headCells={analysisTableProject.headCells}
                        records={analysisTableProject.records}
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
                      <Grid item textAlign={'left'}>
                        <TextField
                          select
                          label="表示タイプ"
                          value={eventType || ''}
                          onChange={handleEventTypeChange}
                          variant="outlined"
                          size={'small'}
                          sx={{
                            width: '13rem',
                          }}
                        >
                          <MenuItem key={'PLAN'} value={EVENT_TYPE.PLAN}>
                            予定
                          </MenuItem>
                          <MenuItem key={'ACTUAL'} value={EVENT_TYPE.ACTUAL}>
                            実績
                          </MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <BarChart
                        height={400}
                        dataset={eventAggregationCategory.map((eventAggregationTime) => ({
                          name: eventAggregationTime.name,
                          aggregationTime: Math.round(
                            eventAggregationTime.aggregationTime / (60 * 1000)
                          ),
                        }))}
                        series={[
                          {
                            dataKey: 'aggregationTime',
                            valueFormatter: displayHours,
                          },
                        ]}
                        yAxis={[
                          {
                            dataKey: 'name',
                            scaleType: 'band',
                          },
                        ]}
                        xAxis={[
                          {
                            scaleType: 'time',
                            valueFormatter: displayHours,
                            tickNumber: 20,
                          },
                        ]}
                        layout="horizontal"
                        margin={{ left: 100, right: 100 }}
                        grid={{ vertical: false, horizontal: true }}
                      >
                        <ChartsXAxis label="カテゴリ別作業時間(分)" />
                      </BarChart>
                    </Grid>
                    <Grid item xs={12}>
                      <AnalysisTable
                        title="カテゴリ別作業時間一覧"
                        headCells={analysisTableCategory.headCells}
                        records={analysisTableCategory.records}
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
                      <Grid item textAlign={'left'}>
                        <TextField
                          select
                          label="表示タイプ"
                          value={eventType || ''}
                          onChange={handleEventTypeChange}
                          variant="outlined"
                          size={'small'}
                          sx={{
                            width: '13rem',
                          }}
                        >
                          <MenuItem key={'PLAN'} value={EVENT_TYPE.PLAN}>
                            予定
                          </MenuItem>
                          <MenuItem key={'ACTUAL'} value={EVENT_TYPE.ACTUAL}>
                            実績
                          </MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <BarChart
                        height={400}
                        dataset={eventAggregationTask.map((eventAggregationTime) => ({
                          name: eventAggregationTime.name,
                          aggregationTime: Math.round(
                            eventAggregationTime.aggregationTime / (60 * 1000)
                          ),
                        }))}
                        series={[
                          {
                            dataKey: 'aggregationTime',
                            valueFormatter: displayHours,
                          },
                        ]}
                        yAxis={[
                          {
                            dataKey: 'name',
                            scaleType: 'band',
                          },
                        ]}
                        xAxis={[
                          {
                            scaleType: 'time',
                            valueFormatter: displayHours,
                            tickNumber: 20,
                          },
                        ]}
                        layout="horizontal"
                        margin={{ left: 100, right: 100 }}
                        grid={{ vertical: false, horizontal: true }}
                      >
                        <ChartsXAxis label="タスク別作業時間(分)" />
                      </BarChart>
                    </Grid>
                    <Grid item xs={12}>
                      <AnalysisTable
                        title="タスク別作業時間一覧"
                        headCells={analysisTableTask.headCells}
                        records={analysisTableTask.records}
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
                      <Grid item textAlign={'left'}>
                        <TextField
                          select
                          label="表示タイプ"
                          value={eventType || ''}
                          onChange={handleEventTypeChange}
                          variant="outlined"
                          size={'small'}
                          sx={{
                            width: '13rem',
                          }}
                        >
                          <MenuItem key={'PLAN'} value={EVENT_TYPE.PLAN}>
                            予定
                          </MenuItem>
                          <MenuItem key={'ACTUAL'} value={EVENT_TYPE.ACTUAL}>
                            実績
                          </MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <BarChart
                        height={400}
                        dataset={eventAggregationLabel.map((eventAggregationTime) => ({
                          name: eventAggregationTime.name,
                          aggregationTime: Math.round(
                            eventAggregationTime.aggregationTime / (60 * 1000)
                          ),
                        }))}
                        series={[
                          {
                            dataKey: 'aggregationTime',
                            valueFormatter: displayHours,
                          },
                        ]}
                        yAxis={[
                          {
                            dataKey: 'name',
                            scaleType: 'band',
                          },
                        ]}
                        xAxis={[
                          {
                            scaleType: 'time',
                            valueFormatter: displayHours,
                            tickNumber: 20,
                          },
                        ]}
                        layout="horizontal"
                        margin={{ left: 100, right: 100 }}
                        grid={{ vertical: false, horizontal: true }}
                      >
                        <ChartsXAxis label="ラベル別作業時間(分)" />
                      </BarChart>
                    </Grid>
                    <Grid item xs={12}>
                      <AnalysisTable
                        title="ラベル別作業時間一覧"
                        headCells={analysisTableLabel.headCells}
                        records={analysisTableLabel.records}
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
