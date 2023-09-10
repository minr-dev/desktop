import rendererContainer from '../../inversify.config';
import { EVENT_TYPE, EventEntry } from '@shared/dto/EventEntry';
import { TYPES } from '@renderer/types';
import { IEventEntryProxy } from '@renderer/services/IEventEntryProxy';
import { addDays } from 'date-fns';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  useTheme,
} from '@mui/material';
import { useContext, useRef, useState } from 'react';
import EventEntryForm, { FORM_MODE, FORM_MODE_ITEMS } from './EventEntryForm';
import { useEventEntries } from '@renderer/hooks/useEventEntries';
import { DatePicker } from '@mui/x-date-pickers';
import { startHourLocal, HeaderCell, TimeCell } from './common';
import { ActivityTooltipEvent } from './ActivitySlot';
import { useActivityEvents } from '@renderer/hooks/useActivityEvents';
import { ActivityTableLane, TimeLane, TimeLeneContainer } from './TimeLane';
import { DragDropResizeState } from './EventSlot';
import { eventDateTimeToDate } from '@shared/dto/EventDateTime';
import SyncIcon from '@mui/icons-material/Sync';
import { useUserPreference } from '@renderer/hooks/useUserPreference';
import UserContext from '../UserContext';
import { ISynchronizerProxy } from '@renderer/services/ISynchronizerProxy';
import { useGitHubAuth } from '@renderer/hooks/useGitHubAuth';
import GitHubIcon from '@mui/icons-material/GitHub';

/**
 * TimeTable は、タイムテーブルを表示する
 *
 */
const TimeTable = (): JSX.Element => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const {
    events: eventEntries,
    overlappedEvents,
    updateEventEntry,
    addEventEntry,
    deleteEventEntry,
    refreshEventEntries,
  } = useEventEntries(selectedDate);
  const { activityEvents, overlappedEvents: overlappedActivityEvents } =
    useActivityEvents(selectedDate);
  const theme = useTheme();

  const [isOpenEventEntryForm, setEventEntryFormOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedEventType, setSelectedEventType] = useState<EVENT_TYPE>(EVENT_TYPE.PLAN);
  const [selectedFormMode, setFormMode] = useState<FORM_MODE>(FORM_MODE.NEW);
  const [selectedEvent, setSelectedEvent] = useState<EventEntry | undefined>(undefined);

  const { userDetails } = useContext(UserContext);
  const { userPreference, loading: loadingUserPreference } = useUserPreference();
  const showCalendarSyncButton = !loadingUserPreference && userPreference?.syncGoogleCalendar;
  const [isCalendarSyncing, setIsCalendarSyncing] = useState(false);

  const { isAuthenticated: isGitHubAuthenticated } = useGitHubAuth();
  const [isGitHubSyncing, setIsGitHubSyncing] = useState(false);

  const EventFormRef = useRef<HTMLFormElement>(null);

  if (eventEntries === null || activityEvents === null) {
    return <div>Loading...</div>;
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
  }

  const handleSaveEventEntry = async (data: EventEntry): Promise<EventEntry> => {
    console.log('handleSaveEventEntry =', data);
    if (!userDetails) {
      throw new Error('userDetails is null');
    }
    try {
      const eventEntryProxy = rendererContainer.get<IEventEntryProxy>(TYPES.EventEntryProxy);
      if (data.id && String(data.id).length > 0) {
        const id = `${data.id}`;
        const ee = await eventEntryProxy.get(id);
        if (!ee) {
          throw new Error(`EventEntry not found. id=${id}`);
        }
        ee.summary = data.summary;
        ee.start = data.start;
        ee.end = data.end;
        ee.description = data.description;
        // console.log('ee', ee);
        await eventEntryProxy.save(ee);
        // 編集モードの場合、既存のイベントを更新する
        updateEventEntry(ee);
      } else {
        // TODO EventDateTime の対応
        const ee = await eventEntryProxy.create(
          userDetails.userId,
          data.eventType,
          data.summary,
          data.start,
          data.end
        );
        ee.description = data.description;
        const saved = await eventEntryProxy.save(ee);
        // 新規モードの場合、新しいイベントを追加する
        addEventEntry(saved);
        // console.log('saved ee', saved);
      }
      setEventEntryFormOpen(false);
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleDeleteEventEntry = async (): Promise<void> => {
    console.log('handleDelete');
    if (!selectedEvent) {
      throw new Error('selectedEvent is null');
    }
    const deletedId = selectedEvent.id;
    console.log('deletedId', deletedId);
    try {
      const eventEntryProxy = rendererContainer.get<IEventEntryProxy>(TYPES.EventEntryProxy);
      eventEntryProxy.delete(deletedId);
      deleteEventEntry(deletedId);
      setEventEntryFormOpen(false);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleOpenEventEntryForm = (
    formMode: FORM_MODE,
    eventType: EVENT_TYPE,
    hour: number,
    event?: EventEntry
  ): void => {
    console.log('handleOpenEventEntryForm');
    setSelectedHour(hour);
    setEventEntryFormOpen(true);
    setSelectedEventType(eventType);
    setFormMode(formMode);
    setSelectedEvent(event);
  };

  const handleCloseEventEntryForm = (): void => {
    setEventEntryFormOpen(false);
  };

  const handleToday = (): void => {
    setSelectedDate(new Date());
  };

  const handlePrevDay = (): void => {
    setSelectedDate(addDays(selectedDate, -1));
  };

  const handleNextDay = (): void => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  // 日付が変更されたときにイベントを再フェッチする
  const handleDateChange = (date: Date | null): void => {
    if (date !== null) {
      setSelectedDate(date);
    }
  };

  // 「カレンダーと同期」ボタンのイベント
  const handleSyncCalendar = async (): Promise<void> => {
    if (isCalendarSyncing) {
      return; // 同期中なら早期リターン
    }
    const synchronizerProxy = rendererContainer.get<ISynchronizerProxy>(
      TYPES.CalendarSynchronizerProxy
    );
    setIsCalendarSyncing(true); // 同期中の状態をセット
    try {
      await synchronizerProxy.sync();
      refreshEventEntries();
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setIsCalendarSyncing(false); // 同期が終了したら状態を解除
    }
  };

  // 「GitHubイベント」ボタンのイベント
  const handleSyncGitHub = async (): Promise<void> => {
    if (isGitHubSyncing) {
      return; // 同期中なら早期リターン
    }
    const synchronizerProxy = rendererContainer.get<ISynchronizerProxy>(
      TYPES.GitHubSynchronizerProxy
    );
    setIsGitHubSyncing(true); // 同期中の状態をセット
    try {
      await synchronizerProxy.sync();
      refreshEventEntries();
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setIsGitHubSyncing(false); // 同期が終了したら状態を解除
    }
  };

  const handleFormSubmit = (): void => {
    console.log('ScheduleTable handleFormSubmit called');
    EventFormRef.current?.submit(); // フォームの送信を手動でトリガー
  };

  const handleResizeStop = (state: DragDropResizeState): void => {
    console.log('start handleResizeStop', state.eventTimeCell);
    const eventEntryProxy = rendererContainer.get<IEventEntryProxy>(TYPES.EventEntryProxy);
    eventEntryProxy.save(state.eventTimeCell.event);
    updateEventEntry(state.eventTimeCell.event);
    console.log('end handleResizeStop', state.eventTimeCell);
  };

  const handleDragStop = (state: DragDropResizeState): void => {
    console.log('start handleDragStop', state.eventTimeCell);
    const eventEntryProxy = rendererContainer.get<IEventEntryProxy>(TYPES.EventEntryProxy);
    eventEntryProxy.save(state.eventTimeCell.event);
    updateEventEntry(state.eventTimeCell.event);
    console.log('end handleDragStop', state.eventTimeCell);
  };

  if (!userDetails) {
    return <div>loading...</div>;
  }

  return (
    <>
      <Grid container spacing={1} sx={{ marginBottom: '0.5rem' }} alignItems="center">
        <Grid item sx={{ marginRight: '0.5rem' }}>
          <Button variant="outlined" onClick={handleToday}>
            今日
          </Button>
        </Grid>
        <Grid item sx={{ marginRight: '0.5rem' }}>
          <Button variant="outlined" onClick={handlePrevDay}>
            &lt;
          </Button>
        </Grid>
        <Grid item sx={{ marginRight: '0.5rem' }}>
          <Button variant="outlined" onClick={handleNextDay}>
            &gt;
          </Button>
        </Grid>
        <Grid item sx={{ marginRight: '0.5rem' }}>
          <DatePicker
            sx={{ width: '10rem' }}
            value={selectedDate}
            format={'yyyy/MM/dd'}
            slotProps={{ textField: { size: 'small' } }}
            onChange={handleDateChange}
          />
        </Grid>
        <Grid item sx={{ marginRight: '0.5rem' }}>
          {showCalendarSyncButton && (
            <Button variant="outlined" onClick={handleSyncCalendar} disabled={isCalendarSyncing}>
              <SyncIcon />
              カレンダーと同期
            </Button>
          )}
        </Grid>
        <Grid item sx={{ marginRight: '0.5rem' }}>
          {isGitHubAuthenticated && (
            <Button variant="outlined" onClick={handleSyncGitHub} disabled={isGitHubSyncing}>
              <GitHubIcon sx={{ marginRight: '0.25rem' }} />
              GitHubイベント
            </Button>
          )}
        </Grid>
      </Grid>

      <Grid container spacing={0}>
        <Grid item xs={1}>
          <HeaderCell></HeaderCell>
          <TimeLeneContainer name={'axis'}>
            {Array.from({ length: 24 }).map((_, hour, self) => (
              <TimeCell key={hour} isBottom={hour === self.length - 1}>
                {(hour + startHourLocal) % 24}
              </TimeCell>
            ))}
          </TimeLeneContainer>
        </Grid>
        <Grid item xs={4}>
          <HeaderCell>予定</HeaderCell>
          {overlappedEvents && (
            <TimeLane
              name="plan"
              color={theme.palette.primary.contrastText}
              backgroundColor={theme.palette.primary.main}
              overlappedEvents={overlappedEvents.filter(
                (oe) =>
                  oe.event.eventType === EVENT_TYPE.PLAN || oe.event.eventType === EVENT_TYPE.SHARED
              )}
              onAddEventEntry={(hour: number): void => {
                handleOpenEventEntryForm(FORM_MODE.NEW, EVENT_TYPE.PLAN, hour);
              }}
              onUpdateEventEntry={(eventEntry: EventEntry): void => {
                // TODO EventDateTime の対応
                const hour = eventDateTimeToDate(eventEntry.start).getHours();
                handleOpenEventEntryForm(FORM_MODE.EDIT, EVENT_TYPE.PLAN, hour, eventEntry);
              }}
              onDragStop={handleDragStop}
              onResizeStop={handleResizeStop}
            />
          )}
        </Grid>
        <Grid item xs={4}>
          <HeaderCell>実績</HeaderCell>
          {overlappedEvents && (
            <TimeLane
              name="actual"
              color={theme.palette.secondary.contrastText}
              backgroundColor={theme.palette.secondary.main}
              overlappedEvents={overlappedEvents.filter(
                (oe) => oe.event.eventType === EVENT_TYPE.ACTUAL
              )}
              onAddEventEntry={(hour: number): void => {
                handleOpenEventEntryForm(FORM_MODE.NEW, EVENT_TYPE.ACTUAL, hour);
              }}
              onUpdateEventEntry={(eventEntry: EventEntry): void => {
                // TODO EventDateTime の対応
                const hour = eventDateTimeToDate(eventEntry.start).getHours();
                handleOpenEventEntryForm(FORM_MODE.EDIT, EVENT_TYPE.ACTUAL, hour, eventEntry);
              }}
              onDragStop={handleDragStop}
              onResizeStop={handleResizeStop}
            />
          )}
        </Grid>
        <Grid item xs={3}>
          <HeaderCell isRight={true}>アクティビティ</HeaderCell>
          <ActivityTableLane overlappedEvents={overlappedActivityEvents} />
        </Grid>
      </Grid>

      <Dialog open={isOpenEventEntryForm} onClose={handleCloseEventEntryForm}>
        <DialogTitle>
          {((): string => {
            const selectedEventTypeLabel =
              EVENT_TYPE.ACTUAL === selectedEventType ? '実績' : '予定';
            const selectedFormModeLabel =
              FORM_MODE_ITEMS.find((item) => item.id === selectedFormMode)?.name || '';
            return `${selectedEventTypeLabel}の${selectedFormModeLabel}`;
          })()}
        </DialogTitle>
        <DialogContent>
          <EventEntryForm
            ref={EventFormRef}
            mode={selectedFormMode}
            eventType={selectedEventType}
            targetDate={selectedDate}
            startHour={selectedHour}
            initialValues={selectedEvent}
            onSubmit={handleSaveEventEntry}
          />
        </DialogContent>
        <DialogActions>
          {selectedFormMode !== FORM_MODE.NEW && ( // 新規モード以外で表示
            <Button onClick={handleDeleteEventEntry} color="secondary">
              削除
            </Button>
          )}
          <Button onClick={handleCloseEventEntryForm}>キャンセル</Button>
          <Button onClick={handleFormSubmit}>登録</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TimeTable;
