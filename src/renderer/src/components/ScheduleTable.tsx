import rendererContainer from '../inversify.config';
import { EVENT_TYPE, EVENT_TYPE_ITEMS, ScheduleEvent } from '@shared/dto/ScheduleEvent';
import { TYPES } from '@renderer/types';
import { IScheduleEventProxy } from '@renderer/services/IScheduleEventProxy';
import { addDays, differenceInMinutes, startOfDay } from 'date-fns';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Tooltip,
  Typography,
} from '@mui/material';
import { styled } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import ActivityDetailsStepper from './ActivityDetailsStepper';
import { useRef, useState } from 'react';
import EventForm, { FORM_MODE, FORM_MODE_ITEMS } from './EventForm';
import { useScheduleEvents } from '@renderer/hooks/useScheduleEvents';
import { DatePicker } from '@mui/x-date-pickers';
import { ActivityEvent } from '@shared/dto/ActivityEvent';
import { useActivityEvents } from '@renderer/hooks/useActivityEvents';

const TITLE_HEIGHT = 2;

const HOUR_HEIGHT = 3;

const HourLine = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isLast' && prop !== 'isRightmost',
})<{ isLast: boolean; isRightmost: boolean }>(({ isLast, isRightmost }) => ({
  height: isLast ? `${HOUR_HEIGHT}rem` : `calc(${HOUR_HEIGHT}rem - 1px)`,
  display: 'flex',
  alignItems: 'center',
  border: '1px solid grey',
  borderBottom: isLast ? '1px solid grey' : 'none',
  borderRight: isRightmost ? '1px solid grey' : 'none',
  width: '100%',
}));

const TitleLine = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isRightmost',
})<{ isRightmost: boolean }>(({ isRightmost }) => ({
  height: `${TITLE_HEIGHT}rem`,
  border: '1px solid grey',
  borderBottom: 'none',
  borderRight: isRightmost ? '1px solid grey' : 'none',
  width: '100%',
}));

const TimeTableContainer = styled(Box)({
  position: 'relative',
  height: `${HOUR_HEIGHT * 24 + TITLE_HEIGHT}rem`, // adjust this according to your needs
});

// TODO 設定画面で設定できるようにする
const startHourLocal = 6;

const convertDateToTableOffset = (date: Date): number => {
  // 開始時間を日付の一部として考慮するために、日付の開始時間を取得します。
  const startDate = startOfDay(date);

  // 現在の日付と開始時間との差を計算します。
  const diffMinutes = differenceInMinutes(date, startDate);

  // 開始時間を0とするために開始時間（分）を引きます。
  const minutesFromStart = diffMinutes - startHourLocal * 60;

  // 分を1時間=1remに変換します。
  let offset = minutesFromStart / 60;
  if (offset < 0) {
    offset = 24 + offset;
  }
  return offset;
};

interface TimeSlotProps {
  startTime: Date;
  endTime: Date;
  onClick: () => void;
  variant?: 'text' | 'outlined' | 'contained';
  color?:
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning'
    | undefined;
  children?: React.ReactNode;
}

/**
 * TimeSlot は予定・実績の枠を表示する
 *
 * ```
 * <TimeSlot
 *   variant="contained"
 *   startTime={start}
 *   endTime={end}
 *   onClick={handleOpen}
 * >
 *   <TimeSlotText>{title}</TimeSlotText>
 * </TimeSlot>
 * ```
 *
 * 構成は、 TimeSlotContainer が、 内部の Button のテキストを制御するためのラッパーで
 * 枠の高さは、 TimeSlotContainer の div で指定している。
 * ただし、実際には、内部に配置している Button の高さに依存してしまうので、
 * Button の方でも、 height の指定をしている。
 * 尚、Button の height は、この div height を inherit すると伝わるので、
 * 高さの指定は、TimeSlotContainer にのみ行うことで対応される。
 *
 * Buttonのテキストでスケジュールのタイトルを表示しているが、枠内に収まらない場合は、
 * 3点リーダーで省略させるために、Button 内で TimeSlotText を使用するようにしている。
 * これをしないと、textOverflow: 'ellipsis' が効かなかった。
 */
const TimeSlot = ({
  startTime,
  endTime,
  onClick,
  children,
  variant,
  color,
}: TimeSlotProps): JSX.Element => (
  <TimeSlotContainer startTime={startTime} endTime={endTime}>
    <Button fullWidth onClick={onClick} variant={variant} color={color} sx={{ height: 'inherit' }}>
      {children}
    </Button>
  </TimeSlotContainer>
);

const TimeSlotContainer = styled('div')<{ startTime: Date; endTime: Date }>(
  ({ startTime, endTime }) => {
    const hourOffset = convertDateToTableOffset(startTime);
    let hours = (endTime.getTime() - startTime.getTime()) / 3600000;
    if (hourOffset + hours > 24) {
      hours = 24 - hourOffset;
    }
    const hoursHeight = hours * HOUR_HEIGHT;

    const rems = hourOffset * HOUR_HEIGHT + TITLE_HEIGHT;
    return {
      position: 'absolute',
      top: `calc(${rems}rem + 1px)`,
      height: `${hoursHeight}rem`,
      width: '90%',
      overflow: 'hidden',
    };
  }
);

const TimeSlotText = styled('div')({
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textAlign: 'left',
});

/**
 * ActivitySlot はアクティビティの枠を表示する
 *
 * ```
 * <Tooltip
 *   title={<ActivityDetailsStepper activeStep={event.activeStep} steps={event.steps} />}
 *   placement="left"
 * >
 *   <ActivitySlot
 *     startTime={event.start}
 *     endTime={event.end}
 *     colorIndex={index}
 *   ></ActivitySlot>
 * </Tooltip>
 * ```
 *
 * 枠にマウスを持っていくと Tooltip でアクティビティの明細が見えるようにする。
 * 尚、Tooltip の中身は、ActivityDetailsStepper で構成する。
 */
const ActivitySlot = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'startTime' && prop !== 'endTime' && prop !== 'colorIndex',
})<{ startTime: Date; endTime: Date; colorIndex: number }>(({ startTime, endTime, colorIndex }) => {
  // dateオブジェクトをrem単位に変換します。
  const hourOffset = convertDateToTableOffset(startTime);
  let hours = (endTime.getTime() - startTime.getTime()) / 3600000;
  if (hourOffset + hours > 24) {
    hours = 24 - hourOffset;
  }
  const hoursHeight = hours * HOUR_HEIGHT;
  const rems = hourOffset * HOUR_HEIGHT + TITLE_HEIGHT;

  const theme = useTheme();
  const color = colorIndex % 2 === 0 ? theme.palette.info.light : theme.palette.success.dark;

  return {
    position: 'absolute',
    top: `calc(${rems}rem + 1px)`,
    height: `${hoursHeight}rem`,
    width: '1rem',
    overflow: 'hidden',
    backgroundColor: color,
    margin: 0,
    padding: 0,
    fontSize: '0.75rem',
    // borderRadius: '5px',
  };
});

interface ActivityTooltipEvent {
  event: ActivityEvent;
  steps: ActivityEvent[];
  activeStep: number;
}

/**
 * ScheduleTable は、タイムテーブルを表示する
 *
 */
const ScheduleTable = (): JSX.Element => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { events, updateEvents, addEvent, deleteEvent } = useScheduleEvents(selectedDate);
  const { activityEvents } = useActivityEvents(selectedDate);

  const [open, setOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedEventType, setSelectedEventType] = useState<EVENT_TYPE>(EVENT_TYPE.PLAN);
  const [selectedFormMode, setFormMode] = useState<FORM_MODE>(FORM_MODE.NEW);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | undefined>(undefined);

  const EventFormRef = useRef<HTMLFormElement>(null);

  if (events === null || activityEvents === null) {
    return <div>Loading...</div>;
  }

  const handleConfirm = async (data: ScheduleEvent): Promise<ScheduleEvent> => {
    console.log('handleConfirm =', data);
    try {
      const scheduleEventProxy = rendererContainer.get<IScheduleEventProxy>(
        TYPES.ScheduleEventProxy
      );
      if (data.id && String(data.id).length > 0) {
        const id = `${data.id}`;
        const sEvent = await scheduleEventProxy.get(id);
        if (!sEvent) {
          throw new Error(`ScheduleEvent not found. id=${id}`);
        }
        sEvent.summary = data.summary;
        sEvent.eventType = data.eventType;
        sEvent.start = data.start;
        sEvent.end = data.end;
        await scheduleEventProxy.save(sEvent);
        // 編集モードの場合、既存のイベントを更新する
        updateEvents(sEvent);
      } else {
        const sEvent = await scheduleEventProxy.create(
          data.eventType,
          data.summary,
          data.start,
          data.end
        );
        await scheduleEventProxy.save(sEvent);
        // 新規モードの場合、新しいイベントを追加する
        addEvent(sEvent);
      }
      setOpen(false);
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleDelete = async (): Promise<void> => {
    console.log('handleDelete');
    if (!selectedEvent) {
      throw new Error('selectedEvent is null');
    }
    const deletedId = selectedEvent.id;
    console.log('deletedId', deletedId);
    try {
      const scheduleEventProxy = rendererContainer.get<IScheduleEventProxy>(
        TYPES.ScheduleEventProxy
      );
      scheduleEventProxy.delete(deletedId);
      deleteEvent(deletedId);
      setOpen(false);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleOpen = (
    formMode: FORM_MODE,
    eventType: EVENT_TYPE,
    hour: number,
    event?: ScheduleEvent
  ): void => {
    setSelectedHour(hour);
    setOpen(true);
    setSelectedEventType(eventType);
    setFormMode(formMode);
    setSelectedEvent(event);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  const planEvents: ScheduleEvent[] = [];
  const actualEvents: ScheduleEvent[] = [];
  for (const event of events) {
    if (event.eventType === EVENT_TYPE.PLAN) {
      planEvents.push(event);
    } else if (event.eventType === EVENT_TYPE.ACTUAL) {
      actualEvents.push(event);
    } else {
      throw new Error(`Unknown event type. eventType=${event.eventType}`);
    }
  }
  const activityTooltipEvents: ActivityTooltipEvent[] = [];
  for (const [index, event] of activityEvents.entries()) {
    let activeStep = 3;
    let indexTop = index - 3;
    if (indexTop < 0) {
      activeStep = indexTop + 3;
      indexTop = 0;
    }
    let indexBottom = index + 4;
    if (indexBottom > activityEvents.length) {
      indexBottom = activityEvents.length;
    }
    activityTooltipEvents.push({
      event: event,
      steps: activityEvents.slice(indexTop, indexBottom),
      activeStep: activeStep,
    });
    indexTop += 1000 * 60 * 60 * 24;
  }

  const handleToday = (): void => {
    setSelectedDate(new Date());
  };

  const handlePrevday = (): void => {
    setSelectedDate(addDays(selectedDate, -1));
  };

  const handleNextday = (): void => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  // 日付が変更されたときにイベントを再フェッチする
  const handleDateChange = (date: Date | null): void => {
    if (date !== null) {
      setSelectedDate(date);
    }
  };

  const handleFormSubmit = (): void => {
    console.log('ScheduleTable handleFormSubmit called');
    EventFormRef.current?.submit(); // フォームの送信を手動でトリガー
  };

  return (
    <>
      <Grid container spacing={0} sx={{ marginBottom: '0.5rem' }} alignItems="center">
        <Grid item sx={{ marginRight: '0.5rem' }}>
          <Button variant="outlined" onClick={handleToday}>
            今日
          </Button>
        </Grid>
        <Grid item sx={{ marginRight: '0.5rem' }}>
          <Button variant="outlined" onClick={handlePrevday}>
            &lt;
          </Button>
        </Grid>
        <Grid item sx={{ marginRight: '0.5rem' }}>
          <Button variant="outlined" onClick={handleNextday}>
            &gt;
          </Button>
        </Grid>
        <Grid item>
          <DatePicker
            value={selectedDate}
            format={'yyyy/MM/dd'}
            slotProps={{ textField: { size: 'small' } }}
            onChange={handleDateChange}
          />
        </Grid>
      </Grid>

      <Grid container spacing={0}>
        <Grid item xs={2}>
          <TimeTableContainer>
            <Grid container spacing={0}>
              <Grid item xs={12}>
                <TitleLine isRightmost={false} />
              </Grid>
              {Array.from({ length: 24 }).map((_, hour, self) => (
                <Grid item xs={12} key={hour}>
                  <HourLine
                    isLast={hour === self.length - 1}
                    isRightmost={false}
                    sx={{ paddingLeft: '0.5rem' }}
                  >
                    {(hour + startHourLocal) % 24}:00
                  </HourLine>
                </Grid>
              ))}
            </Grid>
          </TimeTableContainer>
        </Grid>
        <Grid item xs={4}>
          <TimeTableContainer>
            <Grid container spacing={0}>
              <Grid item xs={12}>
                <TitleLine isRightmost={false}>
                  <Typography sx={{ textAlign: 'center' }}>予定</Typography>
                </TitleLine>
              </Grid>
              {Array.from({ length: 24 }).map((_, hour, self) => (
                <>
                  <Grid item xs={12}>
                    <HourLine
                      key={hour}
                      isLast={hour === self.length - 1}
                      isRightmost={false}
                      onClick={(): void =>
                        handleOpen(FORM_MODE.NEW, EVENT_TYPE.PLAN, hour + startHourLocal)
                      }
                    />
                  </Grid>
                </>
              ))}
            </Grid>
            {planEvents.map((event) => (
              <TimeSlot
                key={event.id}
                variant="contained"
                startTime={event.start}
                endTime={event.end}
                onClick={(): void =>
                  handleOpen(FORM_MODE.EDIT, EVENT_TYPE.PLAN, event.start.getHours(), event)
                }
              >
                <TimeSlotText>{event.summary}</TimeSlotText>
              </TimeSlot>
            ))}
          </TimeTableContainer>
        </Grid>
        <Grid item xs={4}>
          <TimeTableContainer>
            <Grid container spacing={0}>
              <Grid item xs={12}>
                <TitleLine isRightmost={false}>
                  <Typography sx={{ textAlign: 'center' }}>実績</Typography>
                </TitleLine>
              </Grid>
              {Array.from({ length: 24 }).map((_, hour, self) => (
                <>
                  <Grid item xs={12}>
                    <HourLine
                      key={hour}
                      isLast={hour === self.length - 1}
                      isRightmost={false}
                      onClick={(): void =>
                        handleOpen(FORM_MODE.NEW, EVENT_TYPE.ACTUAL, hour + startHourLocal)
                      }
                    />
                  </Grid>
                </>
              ))}
            </Grid>
            {actualEvents.map((event) => (
              <TimeSlot
                key={event.id}
                color="secondary"
                variant="contained"
                startTime={event.start}
                endTime={event.end}
                onClick={(): void =>
                  handleOpen(FORM_MODE.EDIT, EVENT_TYPE.ACTUAL, event.start.getHours(), event)
                }
              >
                <TimeSlotText>{event.summary}</TimeSlotText>
              </TimeSlot>
            ))}
          </TimeTableContainer>
        </Grid>
        <Grid item xs={2}>
          <TimeTableContainer>
            <Grid container spacing={0}>
              <Grid item xs={12}>
                <TitleLine isRightmost={true}>
                  <Typography sx={{ textAlign: 'center' }}>アクティビティ</Typography>
                </TitleLine>
              </Grid>
              {Array.from({ length: 24 }).map((_, i, self) => (
                <>
                  <Grid item xs={12}>
                    <HourLine key={i} isLast={i === self.length - 1} isRightmost={true} />
                  </Grid>
                </>
              ))}
            </Grid>
            {activityTooltipEvents.map((event, index) => (
              <Tooltip
                key={event.event.id}
                title={<ActivityDetailsStepper activeStep={event.activeStep} steps={event.steps} />}
                placement="left"
              >
                <ActivitySlot
                  startTime={event.event.start}
                  endTime={event.event.end}
                  colorIndex={index}
                ></ActivitySlot>
              </Tooltip>
            ))}
          </TimeTableContainer>
        </Grid>
      </Grid>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {((): string => {
            const selectedEventTypeLabel =
              EVENT_TYPE_ITEMS.find((item) => item.id === selectedEventType)?.name || '';
            const selectedFormModeLabel =
              FORM_MODE_ITEMS.find((item) => item.id === selectedFormMode)?.name || '';
            return `${selectedEventTypeLabel}の${selectedFormModeLabel}`;
          })()}
        </DialogTitle>
        <DialogContent>
          <EventForm
            ref={EventFormRef}
            mode={selectedFormMode}
            eventType={selectedEventType}
            targetDate={selectedDate}
            startHour={selectedHour}
            initialValues={selectedEvent}
            onSubmit={handleConfirm}
          />
        </DialogContent>
        <DialogActions>
          {selectedFormMode !== FORM_MODE.NEW && ( // 新規モード以外で表示
            <Button onClick={handleDelete} color="secondary">
              削除
            </Button>
          )}
          <Button onClick={handleClose}>キャンセル</Button>
          <Button onClick={handleFormSubmit}>登録</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ScheduleTable;
