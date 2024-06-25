import { Button, Grid, Paper, Typography } from '@mui/material';
import { TimerState, TimerSession } from '@shared/data/PomodoroTimerDetails';
import { format } from 'date-fns';
import { useContext } from 'react';
import pomodoroTimerContext from '../PomodoroTimerContext';

export const PomodoroTimer = (): JSX.Element => {
  const { pomodoroTimerDetails, startTimer, pauseTimer, stopTimer } =
    useContext(pomodoroTimerContext);

  if (!pomodoroTimerDetails) {
    return <div>Loading...</div>;
  }

  const formatTime = (ms: number | null): string => {
    const ceilSecondsInMs = ms === null || Number.isNaN(ms) ? 0 : Math.ceil(ms / 1000) * 1000;
    return format(ceilSecondsInMs, 'mm:ss');
  };

  return (
    <>
      <Grid container spacing={1} sx={{ marginBottom: '0.5rem' }} alignItems="center">
        <Grid item sx={{ marginRight: '0.5rem' }}>
          {pomodoroTimerDetails.state == TimerState.STOPPED && (
            <Button variant="outlined" onClick={(): void => startTimer()}>
              スタート
            </Button>
          )}
          {pomodoroTimerDetails.state == TimerState.RUNNING && (
            <Button variant="outlined" onClick={pauseTimer}>
              一時停止
            </Button>
          )}
          {pomodoroTimerDetails.state == TimerState.PAUSED && (
            <Button variant="outlined" onClick={(): void => startTimer()}>
              再開
            </Button>
          )}
        </Grid>
        <Grid item sx={{ marginRight: '0.5rem' }}>
          <Button variant="outlined" onClick={stopTimer}>
            停止
          </Button>
        </Grid>
        <Grid item sx={{ marginRight: '0.5rem' }}></Grid>
      </Grid>
      <Paper variant="outlined">
        <Grid container spacing={0}>
          <Grid item xs={12} style={{ textAlign: 'center', justifyContent: 'center' }}>
            <Typography variant="h5" gutterBottom>
              ただいまは
              {pomodoroTimerDetails.session === TimerSession.WORK ? '作業時間' : '休憩時間'}です。
            </Typography>
          </Grid>
          <Grid item xs={12} style={{ textAlign: 'center', justifyContent: 'center' }}>
            <Typography
              variant="h1"
              style={{
                fontSize: 'calc(10vw + 10vh)',
                lineHeight: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              {formatTime(pomodoroTimerDetails.currentTime)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};
