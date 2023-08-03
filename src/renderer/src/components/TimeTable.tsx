import rendererContainer from '../inversify.config';
import { EVENT_TYPE, EVENT_TYPE_ITEMS, EventEntry } from '@shared/dto/EventEntry';
import { TYPES } from '@renderer/types';
import { IEventEntryProxy } from '@renderer/services/IEventEntryProxy';
import { addDays } from 'date-fns';
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
import ActivityDetailsStepper from './ActivityDetailsStepper';
import { useRef, useState } from 'react';
import EventSlotForm, { FORM_MODE, FORM_MODE_ITEMS } from './EventSlotForm';
import { useEventEntries } from '@renderer/hooks/useEventEntries';
import { DatePicker } from '@mui/x-date-pickers';
import { HOUR_HEIGHT, TITLE_HEIGHT, startHourLocal } from './utils';
import { ActivitySlot, ActivityTooltipEvent } from './ActivitySlot';
import { EventSlot, EventSlotText } from './EventSlot';

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

/**
 * TimeTable は、タイムテーブルを表示する
 *
 */
const TimeTable = (): JSX.Element => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { events, updateEvents, addEvent, deleteEvent } = useEventEntries(selectedDate);
  const { activityEvents } = useActivityEvents(selectedDate);

  const [open, setOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedEventType, setSelectedEventType] = useState<EVENT_TYPE>(EVENT_TYPE.PLAN);
  const [selectedFormMode, setFormMode] = useState<FORM_MODE>(FORM_MODE.NEW);
  const [selectedEvent, setSelectedEvent] = useState<EventEntry | undefined>(undefined);

  const EventFormRef = useRef<HTMLFormElement>(null);

  if (events === null || activityEvents === null) {
    return <div>Loading...</div>;
  }

  const handleConfirm = async (data: EventEntry): Promise<EventEntry> => {
    console.log('handleConfirm =', data);
    try {
      const eventEntryProxy = rendererContainer.get<IEventEntryProxy>(TYPES.EventEntryProxy);
      if (data.id && String(data.id).length > 0) {
        const id = `${data.id}`;
        const ee = await eventEntryProxy.get(id);
        if (!ee) {
          throw new Error(`EventEntry not found. id=${id}`);
        }
        ee.summary = data.summary;
        ee.eventType = data.eventType;
        ee.start = data.start;
        ee.end = data.end;
        await eventEntryProxy.save(ee);
        // 編集モードの場合、既存のイベントを更新する
        updateEvents(ee);
      } else {
        const ee = await eventEntryProxy.create(data.eventType, data.summary, data.start, data.end);
        await eventEntryProxy.save(ee);
        // 新規モードの場合、新しいイベントを追加する
        addEvent(ee);
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
      const eventEntryProxy = rendererContainer.get<IEventEntryProxy>(TYPES.EventEntryProxy);
      eventEntryProxy.delete(deletedId);
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
    event?: EventEntry
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

  const planEvents: EventEntry[] = [];
  const actualEvents: EventEntry[] = [];
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
              <EventSlot
                key={event.id}
                variant="contained"
                startTime={event.start}
                endTime={event.end}
                onClick={(): void =>
                  handleOpen(FORM_MODE.EDIT, EVENT_TYPE.PLAN, event.start.getHours(), event)
                }
              >
                <EventSlotText>{event.summary}</EventSlotText>
              </EventSlot>
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
              <EventSlot
                key={event.id}
                color="secondary"
                variant="contained"
                startTime={event.start}
                endTime={event.end}
                onClick={(): void =>
                  handleOpen(FORM_MODE.EDIT, EVENT_TYPE.ACTUAL, event.start.getHours(), event)
                }
              >
                <EventSlotText>{event.summary}</EventSlotText>
              </EventSlot>
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
          <EventSlotForm
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

export default TimeTable;
