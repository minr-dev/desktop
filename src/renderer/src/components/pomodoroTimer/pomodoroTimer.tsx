import { Button, Grid, Paper, Typography } from '@mui/material';
import { usePomodoroTimer } from '@renderer/hooks/usePomodoroTimer';
import { TimerState, TimerSession } from '@shared/data/PomodoroTimerDetails';
import { format } from 'date-fns';

export const PomodoroTimer = (): JSX.Element => {
  const { timerDetails, startTimer, pauseTimer, stopTimer } = usePomodoroTimer();

  if (!timerDetails) {
    return <div>Loading...</div>;
  }

  const formatTime = (ms: number | null): string => {
    if (ms == null) {
      return '';
    }
    const ceilSecondsInMs = Math.ceil(ms / 1000) * 1000;
    return format(ceilSecondsInMs, 'mm:ss');
  };

  return (
    <>
      <Grid container spacing={1} sx={{ marginBottom: '0.5rem' }} alignItems="center">
        <Grid item sx={{ marginRight: '0.5rem' }}>
          {timerDetails.state == TimerState.STOPPED && (
            <Button variant="outlined" onClick={(): void => startTimer()}>
              スタート
            </Button>
          )}
          {timerDetails.state == TimerState.RUNNING && (
            <Button variant="outlined" onClick={pauseTimer}>
              一時停止
            </Button>
          )}
          {timerDetails.state == TimerState.PAUSED && (
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
              ただいまは{timerDetails.session == TimerSession.WORK ? '作業時間' : '休憩時間'}です。
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
              {formatTime(timerDetails.currentTime)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};
