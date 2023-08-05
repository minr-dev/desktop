import rendererContainer from '../../inversify.config';
import { EVENT_TYPE, EVENT_TYPE_ITEMS, EventEntry } from '@shared/dto/EventEntry';
import { TYPES } from '@renderer/types';
import { IEventEntryProxy } from '@renderer/services/IEventEntryProxy';
import { addDays } from 'date-fns';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from '@mui/material';
import { useRef, useState } from 'react';
import EventSlotForm, { FORM_MODE, FORM_MODE_ITEMS } from './EventSlotForm';
import { useEventEntries } from '@renderer/hooks/useEventEntries';
import { DatePicker } from '@mui/x-date-pickers';
import { startHourLocal, HeaderCell, TimeTableContainer, TimeCell } from './common';
import { ActivityTooltipEvent } from './ActivitySlot';
import { useActivityEvents } from '@renderer/hooks/useActivityEvents';
import { ActivityTableLane, EventTableLane } from './TimeLane';

/**
 * TimeTable は、タイムテーブルを表示する
 *
 */
const TimeTable = (): JSX.Element => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { events, updateEvent, addEvent, deleteEvent } = useEventEntries(selectedDate);
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
        updateEvent(ee);
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
      <Grid container spacing={1} sx={{ marginBottom: '0.5rem' }} alignItems="center">
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

      <Grid container spacing={0} flexGrow={1}>
        <Grid item xs={1}>
          <HeaderCell></HeaderCell>
          <TimeTableContainer>
            {Array.from({ length: 24 }).map((_, hour, self) => (
              <TimeCell key={hour} isBottom={hour === self.length - 1}>
                {(hour + startHourLocal) % 24}:00
              </TimeCell>
            ))}
          </TimeTableContainer>
        </Grid>
        <Grid item xs={4}>
          <HeaderCell>予定</HeaderCell>
          <EventTableLane
            eventEntries={events.filter((ee) => ee.eventType === EVENT_TYPE.PLAN)}
            onClickNew={(hour: number): void => {
              handleOpen(FORM_MODE.NEW, EVENT_TYPE.PLAN, hour);
            }}
            onClickUpdate={(eventEntry: EventEntry): void => {
              handleOpen(FORM_MODE.EDIT, EVENT_TYPE.PLAN, eventEntry.start.getHours(), eventEntry);
            }}
          />
        </Grid>
        <Grid item xs={4}>
          <HeaderCell>実績</HeaderCell>
          <EventTableLane
            eventEntries={events.filter((ee) => ee.eventType === EVENT_TYPE.ACTUAL)}
            onClickNew={(hour: number): void => {
              handleOpen(FORM_MODE.NEW, EVENT_TYPE.ACTUAL, hour);
            }}
            onClickUpdate={(eventEntry: EventEntry): void => {
              handleOpen(
                FORM_MODE.EDIT,
                EVENT_TYPE.ACTUAL,
                eventEntry.start.getHours(),
                eventEntry
              );
            }}
          />
        </Grid>
        <Grid item xs={3}>
          <HeaderCell isRight={true}>アクティビティ</HeaderCell>
          <ActivityTableLane activityTooltipEvents={activityTooltipEvents} />
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
