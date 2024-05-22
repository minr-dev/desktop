import { Button, Grid } from '@mui/material';
import { usePomodoroTimer } from '@renderer/hooks/usePomodoroTimer';
import { TimerState, TimerType } from '@shared/data/PomodoroTimerDetails';
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
    const ceilSecondsInMs = ms % 1000 == 0 ? ms : Math.ceil(ms / 1000) * 1000;
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
      <Grid container spacing={0}>
        <Grid item xs={12}>
          ただいまは{timerDetails.type == TimerType.WORK ? '作業時間' : '休憩時間'}です。
        </Grid>
        <Grid item xs={12}>
          {formatTime(timerDetails.currentTime)}
        </Grid>
      </Grid>
    </>
  );
};
