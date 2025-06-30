import rendererContainer from '../../inversify.config';
import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { TYPES } from '@renderer/types';
import { IEventEntryProxy } from '@renderer/services/IEventEntryProxy';
import { addDays } from 'date-fns';
import { Box, Button, Grid, useTheme } from '@mui/material';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import EventEntryForm, { FORM_MODE } from './EventEntryForm';
import { useEventEntries } from '@renderer/hooks/useEventEntries';
import { DatePicker } from '@mui/x-date-pickers';
import { HeaderCell, TIME_CELL_HEIGHT, TimeCell, getStartDate } from './common';
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
import AutoRegisterProvisionalPlansForm from './AutoRegisterProvisionalPlansForm';
import { EventSlotText } from './EventSlotText';
import { EventEntryTimeCell } from '@renderer/services/EventTimeCell';
import { TimelineContext } from './TimelineContext';
import { IPlanTemplateApplyProxy } from '@renderer/services/IPlanTemplateApplyProxy';
import PlanTemplateApplyForm from './PlanTemplateApplyForm';
import { calcDDRStateCenter, DragDropResizeState } from './DraggableSlot';
import { KeyStateContext } from '../KeyStateContext';
import { useAppSnackbar } from '@renderer/hooks/useAppSnackbar';

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
  const { activityEvents, refreshActivityEntries } = useActivityEvents(tableStartDateTime);
  const [activityRefreshTrigger, setActivityRefreshTrigger] = useState(false);
  const theme = useTheme();

  const [isOpenEventEntryForm, setEventEntryFormOpen] = useState(false);
  const [isOpenAutoRegisterProvisionalPlans, setAutoRegisterProvisionalPlansOpen] = useState(false);
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

  const [isOpenPlanTemplateApplyForm, setPlanTemplateApplyFormOpen] = useState(false);

  const { isAuthenticated: isGitHubAuthenticated } = useGitHubAuth();
  const [isGitHubSyncing, setIsGitHubSyncing] = useState(false);

  const { isCtrlPressed } = useContext(KeyStateContext);
  /**
   * コピー中のイベント。
   * ドラッグ持ち替えが難しいので、ドラッグするのはオリジナルのイベントで、
   * これは元々の位置にコピーを表示する目的で使う。
   */
  const [copiedEventTimeCell, setCopiedEventTimeCell] = useState<EventEntryTimeCell | null>(null);
  const eventEntryLaneRef = useRef<HTMLElement>(null);

  const { enqueueAppSnackbar } = useAppSnackbar();

  useEffect(() => {
    // userPreferense が読み込まれた後に反映させる
    if (startHourLocal != null) {
      const now = rendererContainer.get<DateUtil>(TYPES.DateUtil).getCurrentDate();
      // 日付は1日の開始時刻で保存する
      setSelectedDate(now);
    }
  }, [startHourLocal]);

  useEffect(() => {
    // ハンドラ
    const handler = (): void => {
      if (logger.isDebugEnabled()) logger.debug('recv ACTIVITY_NOTIFY');
      refreshActivityEntries();
      setActivityRefreshTrigger((trigger) => !trigger);
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

  const handleSubmitAutoRegisterProvisionalPlans = async (projectId): Promise<void> => {
    if (tableStartDateTime == null) {
      return;
    }
    if (await handleAutoRegisterProvisionalPlans(tableStartDateTime, projectId)) {
      enqueueAppSnackbar('仮予定を登録しました。', { variant: 'info' });
    }
    setAutoRegisterProvisionalPlansOpen(false);
  };

  const handleCloseAutoRegisterProvisionalPlans = async (): Promise<void> => {
    setAutoRegisterProvisionalPlansOpen(false);
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
    enqueueAppSnackbar('仮実績を登録しました。', { variant: 'info' });
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
    enqueueAppSnackbar('実績を登録しました。', { variant: 'info' });
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
    enqueueAppSnackbar('仮実績を削除しました。', { variant: 'info' });
  };

  const handleApplyPlanTemplate = (templateId: string): void => {
    if (logger.isDebugEnabled()) logger.debug('handleApplyPlanTemplate', templateId);
    if (tableStartDateTime == null) {
      enqueueAppSnackbar('適用に失敗しました。', { variant: 'error' });
      throw new Error('tableStartDateTime is null.');
    }
    const applyPlanTemplate = async (): Promise<void> => {
      const planTemplateApplyProxy = rendererContainer.get<IPlanTemplateApplyProxy>(
        TYPES.PlanTemplateApplyProxy
      );
      await planTemplateApplyProxy.applyTemplate(tableStartDateTime, templateId);
      refreshEventEntries();
      setPlanTemplateApplyFormOpen(false);
    };
    applyPlanTemplate();
    enqueueAppSnackbar('適用しました。', { variant: 'info' });
  };

  const handleClosePlanTemplateApplyForm = (): void => {
    setPlanTemplateApplyFormOpen(false);
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
      enqueueAppSnackbar('同期しました。', { variant: 'info' });
    } catch (error) {
      logger.error(error);
      enqueueAppSnackbar('同期に失敗しました。', { variant: 'error' });
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
      enqueueAppSnackbar('同期しました。', { variant: 'info' });
    } catch (error) {
      logger.error(error);
      enqueueAppSnackbar('同期に失敗しました。', { variant: 'error' });
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

  const handleDragStart = (eventTimeCell: EventEntryTimeCell): void => {
    if (isCtrlPressed) {
      setCopiedEventTimeCell(eventTimeCell);
    }
  };

  const handleResizeStop = (eventTimeCell: EventEntryTimeCell): void => {
    if (logger.isDebugEnabled()) logger.debug('start handleResizeStop', eventTimeCell);
    const eventEntryProxy = rendererContainer.get<IEventEntryProxy>(TYPES.EventEntryProxy);
    eventEntryProxy.save(eventTimeCell.event);
    updateEventEntry([eventTimeCell.event]);
    if (logger.isDebugEnabled()) logger.debug('end handleResizeStop', eventTimeCell);
  };

  const handleDragStop = (eventTimeCell: EventEntryTimeCell, state: DragDropResizeState): void => {
    if (logger.isDebugEnabled()) logger.debug('start handleDragStop', eventTimeCell);
    const eventEntryProxy = rendererContainer.get<IEventEntryProxy>(TYPES.EventEntryProxy);
    const { event } = eventTimeCell;
    if (copiedEventTimeCell) {
      // コピー中の場合、移動しているセルのイベントを更新せず、新規にイベントを作成する
      // TODO: コピー関連の処理が散らばっていて流れが追いづらいので、別ファイルにまとめる
      const { offsetX } = calcDDRStateCenter(state);
      const laneWidth = eventEntryLaneRef.current?.offsetWidth;
      // TODO: この計算は予定レーンと実績レーンが同じ幅であるというレイアウトに依存しているので直したい
      const isInActualLane = laneWidth != null && laneWidth < offsetX * 2;
      const newEventType =
        event.eventType !== EVENT_TYPE.ACTUAL && isInActualLane
          ? EVENT_TYPE.ACTUAL
          : event.eventType;
      const saveCopyEvent = async (): Promise<void> => {
        const newEvent = await eventEntryProxy.copy(event, newEventType);

        const saved = await eventEntryProxy.save(newEvent);
        addEventEntry([saved]);
        setCopiedEventTimeCell(null);
      };
      saveCopyEvent();
    } else {
      eventEntryProxy.save(event);
      updateEventEntry([event]);
    }
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
      action: (): void => setAutoRegisterProvisionalPlansOpen(true),
    },
    {
      text: '仮予定の本登録',
      action: (): void => {
        handleAutoRegisterPlanConfirm(tableStartDateTime);
        enqueueAppSnackbar('予定を登録しました。', { variant: 'info' });
      },
    },
    {
      text: '仮予定の削除',
      action: (): void => {
        handleDeleteProvisionalPlans(tableStartDateTime);
        enqueueAppSnackbar('仮予定を削除しました。', { variant: 'info' });
      },
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
      action: (): void => setPlanTemplateApplyFormOpen(true),
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
              value={tableStartDateTime}
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

      <TimelineContext.Provider
        value={{ startTime: tableStartDateTime, intervalMinutes: 60, intervalCount: 24 }}
      >
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
          <Grid item xs={8}>
            {/* HACK: react-rndでの範囲指定が2つの`TimeLane`をちょうど含むようにしたいため、やむなくこの配置をとっている */}
            <Grid container spacing={0} position={'relative'}>
              <Grid item xs={6}>
                <HeaderCell>予定</HeaderCell>
              </Grid>
              <Grid item xs={6}>
                <HeaderCell>実績</HeaderCell>
              </Grid>
              <Grid item xs={12}>
                <Box
                  className={'event-entry-lane'}
                  sx={{
                    position: 'relative',
                    height: `${TIME_CELL_HEIGHT * 24}rem`,
                  }}
                  ref={eventEntryLaneRef}
                >
                  <Grid container spacing={0}>
                    <Grid item xs={6}>
                      {overlappedPlanEvents && (
                        <TimeLane
                          name="plan"
                          backgroundColor={theme.palette.primary.main}
                          bounds={isCtrlPressed ? '.event-entry-lane' : undefined}
                          overlappedEvents={overlappedPlanEvents}
                          copiedEvent={
                            copiedEventTimeCell?.event.eventType === EVENT_TYPE.PLAN ||
                            copiedEventTimeCell?.event.eventType === EVENT_TYPE.SHARED
                              ? copiedEventTimeCell
                              : null
                          }
                          slotText={(oe): JSX.Element => <EventSlotText eventTimeCell={oe} />}
                          onAddEvent={(hour: number): void => {
                            handleOpenEventEntryForm(FORM_MODE.NEW, EVENT_TYPE.PLAN, hour);
                          }}
                          onUpdateEvent={(eventEntry: EventEntry): void => {
                            // TODO EventDateTime の対応
                            const hour = eventDateTimeToDate(eventEntry.start).getHours();
                            handleOpenEventEntryForm(
                              FORM_MODE.EDIT,
                              eventEntry.eventType,
                              hour,
                              eventEntry
                            );
                          }}
                          onDragStart={handleDragStart}
                          onDragStop={handleDragStop}
                          onResizeStop={handleResizeStop}
                        />
                      )}
                    </Grid>
                    <Grid item xs={6}>
                      {overlappedActualEvents && (
                        <TimeLane
                          name="actual"
                          backgroundColor={theme.palette.secondary.main}
                          overlappedEvents={overlappedActualEvents}
                          copiedEvent={
                            copiedEventTimeCell?.event.eventType === EVENT_TYPE.ACTUAL
                              ? copiedEventTimeCell
                              : null
                          }
                          slotText={(oe): JSX.Element => <EventSlotText eventTimeCell={oe} />}
                          onAddEvent={(hour: number): void => {
                            handleOpenEventEntryForm(FORM_MODE.NEW, EVENT_TYPE.ACTUAL, hour);
                          }}
                          onUpdateEvent={(eventEntry: EventEntry): void => {
                            // TODO EventDateTime の対応
                            const hour = eventDateTimeToDate(eventEntry.start).getHours();
                            handleOpenEventEntryForm(
                              FORM_MODE.EDIT,
                              eventEntry.eventType,
                              hour,
                              eventEntry
                            );
                          }}
                          onDragStart={handleDragStart}
                          onDragStop={handleDragStop}
                          onResizeStop={handleResizeStop}
                        />
                      )}
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={3}>
            <HeaderCell isRight={true}>アクティビティ</HeaderCell>
            <ActivityTableLane
              startTime={tableStartDateTime}
              activityRefreshTrigger={activityRefreshTrigger}
            />
          </Grid>
        </Grid>
      </TimelineContext.Provider>

      <EventEntryForm
        isOpen={isOpenEventEntryForm}
        mode={selectedFormMode}
        eventType={selectedEventType}
        targetDate={tableStartDateTime}
        startHour={selectedHour}
        eventEntry={selectedEvent}
        onSubmit={handleSaveEventEntry}
        onClose={handleCloseEventEntryForm}
        onDelete={handleDeleteEventEntry}
      />

      <ExtraAllocationForm
        isOpen={isOpenExtraAllocationForm}
        overrunTasks={overrunTasks}
        onSubmit={async (extraAllocation: Map<string, number>): Promise<void> => {
          if (!tableStartDateTime) {
            return;
          }
          await handleConfirmExtraAllocation(tableStartDateTime, extraAllocation);
          return enqueueAppSnackbar('仮予定を登録しました。', { variant: 'info' });
        }}
        onClose={handleCloseExtraAllocationForm}
      />

      <AutoRegisterProvisionalPlansForm
        isOpen={isOpenAutoRegisterProvisionalPlans}
        onSubmit={handleSubmitAutoRegisterProvisionalPlans}
        onClose={handleCloseAutoRegisterProvisionalPlans}
      />

      <PlanTemplateApplyForm
        isOpen={isOpenPlanTemplateApplyForm}
        onSubmit={handleApplyPlanTemplate}
        onClose={handleClosePlanTemplateApplyForm}
      />
    </>
  );
};

export default TimeTable;
