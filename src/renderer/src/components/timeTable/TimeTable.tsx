import rendererContainer from '../../inversify.config';
import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { TYPES } from '@renderer/types';
import { IEventEntryProxy } from '@renderer/services/IEventEntryProxy';
import { addDays } from 'date-fns';
import { Button, Grid, useTheme } from '@mui/material';
import { useContext, useEffect, useMemo, useState } from 'react';
import EventEntryForm, { FORM_MODE } from './EventEntryForm';
import { useEventEntries } from '@renderer/hooks/useEventEntries';
import { DatePicker } from '@mui/x-date-pickers';
import { HeaderCell, TimeCell, getStartDate } from './common';
import { useActivityEvents } from '@renderer/hooks/useActivityEvents';
import { TimeLane, TimeLaneContainer } from './TimeLane';
import { eventDateTimeToDate } from '@shared/data/EventDateTime';
import SyncIcon from '@mui/icons-material/Sync';
import { useUserPreference } from '@renderer/hooks/useUserPreference';
import AppContext from '../AppContext';
import { ISynchronizerProxy } from '@renderer/services/ISynchronizerProxy';
import { useGitHubAuth } from '@renderer/hooks/useGitHubAuth';
import GitHubIcon from '@mui/icons-material/GitHub';
import { IpcChannel } from '@shared/constants';
import { ActivityTableLane } from './ActivityTableLane';
import { DateUtil } from '@shared/utils/DateUtil';
import { IActualAutoRegistrationProxy } from '@renderer/services/IActualAutoRegistrationProxy';
import { getLogger } from '@renderer/utils/LoggerUtil';
import ExtraAllocationForm from './ExtraAllocationForm';
import { useAutoRegistrationPlan } from '@renderer/hooks/useAutoRegistrationPlan';
import { TimeTableDrawer } from './TimeTableDrawer';
import { IPlanTemplateApplicationProxy } from '@renderer/services/IPlanTemplateApplicationProxy';
import PlanTemplateApplicationForm from './PlanTemplateApplicationForm';
import { EventSlotText } from './EventSlotText';
import { EventEntryTimeCell } from '@renderer/services/EventTimeCell';

const logger = getLogger('TimeTable');

/**
 * TimeTable は、タイムラインを表示する
 *
 */
const TimeTable = (): JSX.Element => {
  logger.info('TimeTable');
  const { userDetails } = useContext(AppContext);
  const { userPreference, loading: loadingUserPreference } = useUserPreference();
  const showCalendarSyncButton = !loadingUserPreference && userPreference?.syncGoogleCalendar;
  const [isCalendarSyncing, setIsCalendarSyncing] = useState(false);

  const startHourLocal = loadingUserPreference ? null : userPreference?.startHourLocal;
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const tableStartDateTime = useMemo(
    () =>
      startHourLocal != null && selectedDate != null
        ? getStartDate(selectedDate, startHourLocal)
        : undefined,
    [selectedDate, startHourLocal]
  );

  const {
    events: eventEntries,
    overlappedPlanEvents,
    overlappedActualEvents,
    updateEventEntry,
    addEventEntry,
    deleteEventEntry,
    refreshEventEntries,
  } = useEventEntries(tableStartDateTime);
  const {
    activityEvents,
    overlappedEvents: overlappedActivityEvents,
    refreshActivityEntries,
  } = useActivityEvents(tableStartDateTime);
  const theme = useTheme();

  const [isOpenEventEntryForm, setEventEntryFormOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedEventType, setSelectedEventType] = useState<EVENT_TYPE>(EVENT_TYPE.PLAN);
  const [selectedFormMode, setFormMode] = useState<FORM_MODE>(FORM_MODE.NEW);
  const [selectedEvent, setSelectedEvent] = useState<EventEntry | undefined>(undefined);

  const {
    overrunTasks,
    isFormOpen: isOpenExtraAllocationForm,
    handleAutoRegisterProvisional: handleAutoRegisterProvisionalPlans,
    handleAutoRegisterConfirm: handleAutoRegisterPlanConfirm,
    handleDeleteProvisional: handleDeleteProvisionalPlans,
    handleConfirmExtraAllocation,
    handleCloseForm: handleCloseExtraAllocationForm,
  } = useAutoRegistrationPlan({
    refreshEventEntries,
  });

  const [isOpenPlanTemplateApplicationForm, setPlanTemplateApplicationFormOpen] = useState(false);

  const { isAuthenticated: isGitHubAuthenticated } = useGitHubAuth();
  const [isGitHubSyncing, setIsGitHubSyncing] = useState(false);

  useEffect(() => {
    // userPreferense が読み込まれた後に反映させる
    if (startHourLocal != null) {
      const now = rendererContainer.get<DateUtil>(TYPES.DateUtil).getCurrentDate();
      // 日付は1日の開始時刻で保存する
      setSelectedDate(getStartDate(now, startHourLocal));
    }
  }, [startHourLocal]);

  useEffect(() => {
    // ハンドラ
    const handler = (): void => {
      if (logger.isDebugEnabled()) logger.debug('recv ACTIVITY_NOTIFY');
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
      if (logger.isDebugEnabled()) logger.debug('recv EVENT_ENTRY_NOTIFY');
      refreshEventEntries();
    };
    // コンポーネントがマウントされたときに IPC のハンドラを設定
    const unsubscribe = window.electron.ipcRenderer.on(IpcChannel.EVENT_ENTRY_NOTIFY, handler);
    // コンポーネントがアンマウントされたときに解除
    return () => {
      unsubscribe();
    };
  }, [refreshEventEntries]);

  if (eventEntries === null || activityEvents === null || startHourLocal == null) {
    return <div>Loading...</div>;
  }

  const handleSaveEventEntry = async (data: EventEntry): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug('handleSaveEventEntry =', data);
    if (selectedFormMode === FORM_MODE.EDIT) {
      // 編集モードの場合、既存のイベントを更新する
      updateEventEntry([data]);
    } else {
      // 新規モードの場合、新しいイベントを追加する
      addEventEntry([data]);
    }
    setEventEntryFormOpen(false);
  };

  const handleOpenEventEntryForm = (
    formMode: FORM_MODE,
    eventType: EVENT_TYPE,
    hour: number,
    event?: EventEntry
  ): void => {
    if (logger.isDebugEnabled()) logger.debug('handleOpenEventEntryForm');
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
    const now = rendererContainer.get<DateUtil>(TYPES.DateUtil).getCurrentDate();
    // 日付は1日の開始時刻で保存する
    setSelectedDate(now);
  };

  const handlePrevDay = (): void => {
    if (selectedDate) {
      setSelectedDate(addDays(selectedDate, -1));
    }
  };

  const handleNextDay = (): void => {
    if (selectedDate) {
      setSelectedDate(addDays(selectedDate, 1));
    }
  };

  // 日付が変更されたときにイベントを再フェッチする
  const handleDateChange = (date: Date | null): void => {
    if (date !== null) {
      // 日付は1日の開始時刻で保存する
      setSelectedDate(date);
    }
  };

  const handleAutoRegisterProvisionalActuals = (): void => {
    if (tableStartDateTime == null) {
      return;
    }
    const autoRegisterActual = async (): Promise<void> => {
      const autoRegisterActualService = rendererContainer.get<IActualAutoRegistrationProxy>(
        TYPES.ActualAutoRegistrationProxy
      );
      await autoRegisterActualService.autoRegisterProvisonalActuals(tableStartDateTime);
      refreshEventEntries();
    };
    autoRegisterActual();
  };

  const handleAutoRegisterActualConfirm = (): void => {
    if (tableStartDateTime == null) {
      return;
    }
    const autoRegisterConfirm = async (): Promise<void> => {
      const autoRegisterActualService = rendererContainer.get<IActualAutoRegistrationProxy>(
        TYPES.ActualAutoRegistrationProxy
      );
      await autoRegisterActualService.confirmActualRegistration(tableStartDateTime);
      refreshEventEntries();
    };
    autoRegisterConfirm();
  };

  const handleDeleteProvisionalActuals = (): void => {
    if (tableStartDateTime == null) {
      return;
    }
    const deleteProvisionalActuals = async (): Promise<void> => {
      const autoRegisterActualService = rendererContainer.get<IActualAutoRegistrationProxy>(
        TYPES.ActualAutoRegistrationProxy
      );
      await autoRegisterActualService.deleteProvisionalActuals(tableStartDateTime);
      refreshEventEntries();
    };
    deleteProvisionalActuals();
  };

  const handleApplyPlanTemplate = (templateId: string): void => {
    if (logger.isDebugEnabled()) logger.debug('handleApplyPlanTemplate', templateId);
    if (tableStartDateTime == null) {
      throw new Error('tableStartDateTime is null.');
    }
    const applyPlanTemplate = async (): Promise<void> => {
      const planTemplateApplicationProxy = rendererContainer.get<IPlanTemplateApplicationProxy>(
        TYPES.PlanTemplateApplicationProxy
      );
      await planTemplateApplicationProxy.applyTemplate(tableStartDateTime, templateId);
      refreshEventEntries();
      setPlanTemplateApplicationFormOpen(false);
    };
    applyPlanTemplate();
  };

  const handleClosePlanTemplateApplicationForm = (): void => {
    setPlanTemplateApplicationFormOpen(false);
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
      logger.error(error);
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
      logger.error(error);
      throw error;
    } finally {
      setIsGitHubSyncing(false); // 同期が終了したら状態を解除
    }
  };

  const handleDeleteEventEntry = async (): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug('ScheduleTable handleDeleteEventEntry called');
    if (!selectedEvent) {
      throw new Error('selectedEvent is null');
    }
    deleteEventEntry([selectedEvent.id]);
    setEventEntryFormOpen(false);
  };

  const handleResizeStop = (eventTimeCell: EventEntryTimeCell): void => {
    if (logger.isDebugEnabled()) logger.debug('start handleResizeStop', eventTimeCell);
    const eventEntryProxy = rendererContainer.get<IEventEntryProxy>(TYPES.EventEntryProxy);
    eventEntryProxy.save(eventTimeCell.event);
    updateEventEntry([eventTimeCell.event]);
    if (logger.isDebugEnabled()) logger.debug('end handleResizeStop', eventTimeCell);
  };

  const handleDragStop = (eventTimeCell: EventEntryTimeCell): void => {
    if (logger.isDebugEnabled()) logger.debug('start handleDragStop', eventTimeCell);
    const eventEntryProxy = rendererContainer.get<IEventEntryProxy>(TYPES.EventEntryProxy);
    eventEntryProxy.save(eventTimeCell.event);
    updateEventEntry([eventTimeCell.event]);
    if (logger.isDebugEnabled()) logger.debug('end handleDragStop', eventTimeCell);
  };

  if (!userDetails || !userPreference) {
    return <div>loading...</div>;
  }

  const menuItems = [
    ...(showCalendarSyncButton
      ? [{ text: 'カレンダーと同期', icon: <SyncIcon />, action: handleSyncCalendar }]
      : []),
    ...(isGitHubAuthenticated
      ? [{ text: 'GitHubと同期', icon: <GitHubIcon />, action: handleSyncGitHub }]
      : []),
    {
      text: '予定の自動登録',
      action: (): void => handleAutoRegisterProvisionalPlans(tableStartDateTime),
    },
    {
      text: '仮予定の本登録',
      action: (): void => handleAutoRegisterPlanConfirm(tableStartDateTime),
    },
    {
      text: '仮予定の削除',
      action: () => handleDeleteProvisionalPlans(tableStartDateTime),
    },
    {
      text: '実績の自動登録',
      action: handleAutoRegisterProvisionalActuals,
    },
    {
      text: '仮実績の本登録',
      action: handleAutoRegisterActualConfirm,
    },
    {
      text: '仮実績の削除',
      action: handleDeleteProvisionalActuals,
    },
    {
      text: '予定テンプレート適用',
      action: (): void => setPlanTemplateApplicationFormOpen(true),
    },
  ];

  return (
    <>
      <Grid container>
        <Grid
          item
          xs={11}
          container
          spacing={1}
          sx={{ marginBottom: '0.5rem' }}
          alignItems="center"
        >
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
        </Grid>
        <Grid item xs={1} container justifyContent="flex-end">
          <TimeTableDrawer items={menuItems} />
        </Grid>
      </Grid>

      <Grid container spacing={0}>
        <Grid item xs={1}>
          <HeaderCell></HeaderCell>
          <TimeLaneContainer name={'axis'}>
            {Array.from({ length: 24 }).map((_, hour, self) => (
              <TimeCell key={hour} isBottom={hour === self.length - 1}>
                {(hour + startHourLocal) % 24}
              </TimeCell>
            ))}
          </TimeLaneContainer>
        </Grid>
        <Grid item xs={4}>
          <HeaderCell>予定</HeaderCell>
          {overlappedPlanEvents && (
            <TimeLane
              name="plan"
              backgroundColor={theme.palette.primary.main}
              startTime={tableStartDateTime}
              overlappedEvents={overlappedPlanEvents}
              slotText={(oe): JSX.Element => <EventSlotText eventTimeCell={oe} />}
              onAddEvent={(hour: number): void => {
                handleOpenEventEntryForm(FORM_MODE.NEW, EVENT_TYPE.PLAN, hour);
              }}
              onUpdateEvent={(eventEntry: EventEntry): void => {
                // TODO EventDateTime の対応
                const hour = eventDateTimeToDate(eventEntry.start).getHours();
                handleOpenEventEntryForm(FORM_MODE.EDIT, eventEntry.eventType, hour, eventEntry);
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
              startTime={tableStartDateTime}
              overlappedEvents={overlappedActualEvents}
              slotText={(oe): JSX.Element => <EventSlotText eventTimeCell={oe} />}
              onAddEvent={(hour: number): void => {
                handleOpenEventEntryForm(FORM_MODE.NEW, EVENT_TYPE.ACTUAL, hour);
              }}
              onUpdateEvent={(eventEntry: EventEntry): void => {
                // TODO EventDateTime の対応
                const hour = eventDateTimeToDate(eventEntry.start).getHours();
                handleOpenEventEntryForm(FORM_MODE.EDIT, eventEntry.eventType, hour, eventEntry);
              }}
              onDragStop={handleDragStop}
              onResizeStop={handleResizeStop}
            />
          )}
        </Grid>
        <Grid item xs={3}>
          <HeaderCell isRight={true}>アクティビティ</HeaderCell>
          <ActivityTableLane isRight={true} overlappedEvents={overlappedActivityEvents} />
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

      <ExtraAllocationForm
        isOpen={isOpenExtraAllocationForm}
        overrunTasks={overrunTasks}
        onSubmit={(extraAllocation: Map<string, number>): void => {
          if (!tableStartDateTime) {
            return;
          }
          return handleConfirmExtraAllocation(tableStartDateTime, extraAllocation);
        }}
        onClose={handleCloseExtraAllocationForm}
      />

      <PlanTemplateApplicationForm
        isOpen={isOpenPlanTemplateApplicationForm}
        onSubmit={handleApplyPlanTemplate}
        onClose={handleClosePlanTemplateApplicationForm}
      />
    </>
  );
};

export default TimeTable;
