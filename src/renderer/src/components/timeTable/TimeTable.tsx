import rendererContainer from '../../inversify.config';
import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { TYPES } from '@renderer/types';
import { IEventEntryProxy } from '@renderer/services/IEventEntryProxy';
import { addDays } from 'date-fns';
import { Button, Grid, useTheme } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import EventEntryForm, { FORM_MODE } from './EventEntryForm';
import { useEventEntries } from '@renderer/hooks/useEventEntries';
import { DatePicker } from '@mui/x-date-pickers';
import { startHourLocal, HeaderCell, TimeCell } from './common';
import { useActivityEvents } from '@renderer/hooks/useActivityEvents';
import { TimeLane, TimeLeneContainer } from './TimeLane';
import { DragDropResizeState } from './EventSlot';
import { eventDateTimeToDate } from '@shared/data/EventDateTime';
import SyncIcon from '@mui/icons-material/Sync';
import { useUserPreference } from '@renderer/hooks/useUserPreference';
import AppContext from '../AppContext';
import { ISynchronizerProxy } from '@renderer/services/ISynchronizerProxy';
import { useGitHubAuth } from '@renderer/hooks/useGitHubAuth';
import GitHubIcon from '@mui/icons-material/GitHub';
import { IpcChannel } from '@shared/constants';
import { ActivityTableLane } from './ActivityTableLane';

/**
 * TimeTable は、タイムラインを表示する
 *
 */
const TimeTable = (): JSX.Element => {
  console.log('TimeTable');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const {
    events: eventEntries,
    overlappedPlanEvents,
    overlappedActualEvents,
    updateEventEntry,
    addEventEntry,
    deleteEventEntry,
    refreshEventEntries,
  } = useEventEntries(selectedDate);
  const {
    activityEvents,
    overlappedEvents: overlappedActivityEvents,
    refreshActivityEntries,
  } = useActivityEvents(selectedDate);
  const theme = useTheme();

  const [isOpenEventEntryForm, setEventEntryFormOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedEventType, setSelectedEventType] = useState<EVENT_TYPE>(EVENT_TYPE.PLAN);
  const [selectedFormMode, setFormMode] = useState<FORM_MODE>(FORM_MODE.NEW);
  const [selectedEvent, setSelectedEvent] = useState<EventEntry | undefined>(undefined);

  const { userDetails } = useContext(AppContext);
  const { userPreference, loading: loadingUserPreference } = useUserPreference();
  const showCalendarSyncButton = !loadingUserPreference && userPreference?.syncGoogleCalendar;
  const [isCalendarSyncing, setIsCalendarSyncing] = useState(false);

  const { isAuthenticated: isGitHubAuthenticated } = useGitHubAuth();
  const [isGitHubSyncing, setIsGitHubSyncing] = useState(false);

  useEffect(() => {
    // ハンドラ
    const handler = (): void => {
      console.log('recv ACTIVITY_NOTIFY');
      refreshActivityEntries();
    };
    // コンポーネントがマウントされたときに IPC のハンドラを設定
    const unsubscribe = window.electron.ipcRenderer.on(IpcChannel.ACTIVITY_NOTIFY, handler);
    // コンポーネントがアンマウントされたときに解除
    return () => {
      unsubscribe();
    };
  }, [refreshActivityEntries]);

  useEffect(() => {
    // ハンドラ
    const handler = (): void => {
      console.log('recv EVENT_ENTRY_NOTIFY');
      refreshEventEntries();
    };
    // コンポーネントがマウントされたときに IPC のハンドラを設定
    const unsubscribe = window.electron.ipcRenderer.on(IpcChannel.EVENT_ENTRY_NOTIFY, handler);
    // コンポーネントがアンマウントされたときに解除
    return () => {
      unsubscribe();
    };
  }, [refreshEventEntries]);

  if (eventEntries === null || activityEvents === null) {
    return <div>Loading...</div>;
  }

  const handleSaveEventEntry = async (data: EventEntry): Promise<void> => {
    console.log('handleSaveEventEntry =', data);
    if (selectedFormMode === FORM_MODE.EDIT) {
      // 編集モードの場合、既存のイベントを更新する
      updateEventEntry(data);
    } else {
      // 新規モードの場合、新しいイベントを追加する
      addEventEntry(data);
    }
    setEventEntryFormOpen(false);
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

  const handleCloseEventEntryForm = async (): Promise<void> => {
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

  const handleDeleteEventEntry = async (): Promise<void> => {
    console.log('ScheduleTable handleDeleteEventEntry called');
    if (!selectedEvent) {
      throw new Error('selectedEvent is null');
    }
    deleteEventEntry(selectedEvent.id);
    setEventEntryFormOpen(false);
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
          {overlappedPlanEvents && (
            <TimeLane
              name="plan"
              backgroundColor={theme.palette.primary.main}
              overlappedEvents={overlappedPlanEvents}
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
          {overlappedActualEvents && (
            <TimeLane
              name="actual"
              backgroundColor={theme.palette.secondary.main}
              overlappedEvents={overlappedActualEvents}
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

      <EventEntryForm
        isOpen={isOpenEventEntryForm}
        mode={selectedFormMode}
        eventType={selectedEventType}
        targetDate={selectedDate}
        startHour={selectedHour}
        eventEntry={selectedEvent}
        onSubmit={handleSaveEventEntry}
        onClose={handleCloseEventEntryForm}
        onDelete={handleDeleteEventEntry}
      />
    </>
  );
};

export default TimeTable;
