import { Grid, TextField, Stack, Alert, Paper, useTheme } from '@mui/material';
import { useFormManager } from '@renderer/hooks/useFormManager';
import rendererContainer from '@renderer/inversify.config';
import { IPlanTemplateProxy } from '@renderer/services/IPlanTemplateProxy';
import { TYPES } from '@renderer/types';
import { PlanTemplate } from '@shared/data/PlanTemplate';
import { PlanTemplateEvent } from '@shared/data/PlanTemplateEvent';
import { AppError } from '@shared/errors/AppError';
import { UniqueConstraintError } from '@shared/errors/UniqueConstraintError';
import { DateUtil } from '@shared/utils/DateUtil';
import { useState, useEffect, useContext, useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { ReadOnlyTextField } from '../common/fields/ReadOnlyTextField';
import { CRUDFormDialog } from '../crud/CRUDFormDialog';
import { getLogger } from '@renderer/utils/LoggerUtil';
import { IPlanTemplateEventProxy } from '@renderer/services/IPlanTemplateEventProxy';
import { TimeLane, TimeLaneContainer } from '../timeTable/TimeLane';
import { HeaderCell, TimeCell } from '../timeTable/common';
import { usePlanTemplateEvents } from '@renderer/hooks/usePlanTemplateEvents';
import AppContext from '../AppContext';
import { timeToDummyDate } from '@shared/data/Time';
import { useUserPreference } from '@renderer/hooks/useUserPreference';
import { PlanTemplateEventTimeCell } from '@renderer/services/EventTimeCell';
import PlanTemplateEventForm from './PlanTemplateEventForm';
import { usePlanTemplateEventForm } from '@renderer/hooks/usePlanTemplateEventForm';

const logger = getLogger('PlanTemplateEdit');

interface PlanTemplateFormData {
  id: string;
  name: string;
}

interface PlanTemplateEditProps {
  isOpen: boolean;
  templateId: string | null;
  onClose: () => void;
  onSubmit: (planTemplate: PlanTemplate, events: PlanTemplateEvent[]) => void;
}

export const PlanTemplateEdit = ({
  isOpen,
  templateId,
  onClose,
  onSubmit,
}: PlanTemplateEditProps): JSX.Element => {
  logger.info('PlanTemplateEdit', isOpen);
  const [isDialogOpen, setDialogOpen] = useState(isOpen);
  const [planTemplate, setPlanTemplate] = useState<PlanTemplate | null>(null);
  const methods = useFormManager<PlanTemplateFormData>({
    formId: 'plan-template-edit-form',
    isVisible: isOpen,
  });
  const {
    control,
    reset,
    formState: { errors: formErrors },
    setError,
  } = methods;
  const theme = useTheme();
  const { userDetails } = useContext(AppContext);
  const { userPreference } = useUserPreference();
  const startHourLocal = userPreference?.startHourLocal;
  const laneStartDateTime = useMemo(
    () =>
      startHourLocal != null
        ? timeToDummyDate({ hours: startHourLocal, minutes: 0 }, startHourLocal)
        : undefined,
    [startHourLocal]
  );
  const { events, overlappedEvents, updateEvent, upsertEvent, deleteEvent, refreshEvents } =
    usePlanTemplateEvents(templateId);
  const {
    handleAddEvent,
    handleUpdateEvent,
    handleCloseForm: handleEventFormClose,
    ...eventFormState
  } = usePlanTemplateEventForm();

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      if (logger.isDebugEnabled()) logger.debug('PlanTemplateEdit fetchData', templateId);
      const patternProxy = rendererContainer.get<IPlanTemplateProxy>(TYPES.PlanTemplateProxy);
      let pattern: PlanTemplate | null = null;
      if (templateId !== null) {
        pattern = await patternProxy.get(templateId);
      }
      reset(pattern ? pattern : {});
      setPlanTemplate(pattern);
    };
    fetchData();
    setDialogOpen(isOpen);
  }, [isOpen, templateId, reset]);

  const handleDialogSubmit = async (data: PlanTemplateFormData): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug('PlanTemplateEdit handleDialogSubmit', data);
    if (userDetails == null) {
      return;
    }
    const dateUtil = rendererContainer.get<DateUtil>(TYPES.DateUtil);
    const { ...templateData } = data;
    // mongodb や nedb の場合、 _id などのエンティティとしては未定義の項目が埋め込まれていることがあり
    // それらの項目を使って更新処理が行われるため、`...planTemplate` で隠れた項目もコピーされるようにする
    const newPlanTemplate: PlanTemplate = {
      ...planTemplate,
      ...templateData,
      id: planTemplate ? planTemplate.id : '',
      userId: userDetails?.userId,
      updated: dateUtil.getCurrentDate(),
    };
    try {
      const planTemplateProxy = rendererContainer.get<IPlanTemplateProxy>(TYPES.PlanTemplateProxy);
      const saved = await planTemplateProxy.save(newPlanTemplate);
      const planTemplateEventProxy = rendererContainer.get<IPlanTemplateEventProxy>(
        TYPES.PlanTemplateEventProxy
      );
      const dbEvents = templateId
        ? await planTemplateEventProxy.list(userDetails.userId, templateId)
        : [];
      const deletedIds =
        events != null
          ? dbEvents.map((event) => event.id).filter((id) => !events.some((e) => e.id === id))
          : [];
      await planTemplateEventProxy.bulkDelete(deletedIds);
      const savedEvent = events
        ? await planTemplateEventProxy.bulkUpsert(
            events.map((event): PlanTemplateEvent => ({ ...event, templateId: saved.id }))
          )
        : [];
      onSubmit(saved, savedEvent);
      refreshEvents();
      onClose();
      reset();
    } catch (error) {
      logger.error('PlanTemplateEdit handleDialogSubmit error', error);
      const errName = AppError.getErrorName(error);
      if (errName === UniqueConstraintError.NAME) {
        setError('name', {
          type: 'manual',
          message: 'テンプレート名は既に登録されています',
        });
      } else {
        throw error;
      }
    }
  };

  const handleDialogClose = (): void => {
    if (logger.isDebugEnabled()) logger.debug('PlanTemplateEdit handleDialogClose');
    onClose();
  };

  const handleDragStop = (eventTimeCell: PlanTemplateEventTimeCell): void => {
    updateEvent(eventTimeCell.event);
  };

  const handleResizeStop = (eventTimeCell: PlanTemplateEventTimeCell): void => {
    updateEvent(eventTimeCell.event);
  };

  const handleTemplateEventFormSubmit = async (event: PlanTemplateEvent): Promise<void> => {
    upsertEvent(event);
    // 実際の更新はテンプレート保存時に行う
    handleEventFormClose();
  };

  const handleDeleteEvent = async (deletedId): Promise<void> => {
    deleteEvent(deletedId);
    // 実際の削除はテンプレート保存時に行う
    handleEventFormClose();
  };

  if (startHourLocal == null || overlappedEvents == null) {
    return <>Loading...</>;
  }

  return (
    <>
      <CRUDFormDialog
        isOpen={isDialogOpen}
        title={`予定テンプレート${templateId !== null ? '編集' : '追加'}`}
        onSubmit={handleDialogSubmit}
        onClose={handleDialogClose}
        methods={methods}
        // TODO: ウィンドウ幅を小さくしたときの横幅調整
        PaperProps={{ sx: { minWidth: '600px' } }}
      >
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Paper variant="outlined">
              <Grid container spacing={2} style={{ paddingTop: '16px' }}>
                {templateId !== null && (
                  <Grid item xs={12} key="templateId">
                    <Controller
                      name="id"
                      control={control}
                      render={({ field }): React.ReactElement => (
                        <ReadOnlyTextField field={field} label="ID" margin="none" />
                      )}
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: '入力してください。' }}
                    render={({ field, fieldState: { error } }): React.ReactElement => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        label="テンプレート名"
                        variant="outlined"
                        error={!!error}
                        helperText={error?.message}
                        fullWidth
                        margin="none"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Stack>
                    {Object.entries(formErrors).length > 0 && (
                      <Alert severity="error">入力エラーを修正してください</Alert>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Grid container spacing={0}>
              <Grid item xs={2}>
                <HeaderCell></HeaderCell>
                <TimeLaneContainer name={'axis'}>
                  {Array.from({ length: 24 }).map((_, hour, self) => (
                    <TimeCell key={hour} isBottom={hour === self.length - 1}>
                      {(hour + startHourLocal) % 24}
                    </TimeCell>
                  ))}
                </TimeLaneContainer>
              </Grid>
              <Grid item xs={10}>
                <HeaderCell isRight={true}>予定</HeaderCell>
                <TimeLane
                  name={'planTemplate'}
                  backgroundColor={theme.palette.primary.main}
                  isRight={true}
                  startTime={laneStartDateTime}
                  overlappedEvents={overlappedEvents}
                  slotText={(event: PlanTemplateEventTimeCell): JSX.Element => <>{event.summary}</>}
                  onAddEvent={(hours: number): void => handleAddEvent({ hours, minutes: 0 })}
                  onUpdateEvent={handleUpdateEvent}
                  onDragStop={handleDragStop}
                  onResizeStop={handleResizeStop}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CRUDFormDialog>
      <PlanTemplateEventForm
        isOpen={eventFormState.isOpen}
        mode={eventFormState.formMode}
        templateId={templateId || ''}
        startTime={eventFormState.startTime}
        event={eventFormState.event}
        onSubmit={handleTemplateEventFormSubmit}
        onClose={async (): Promise<void> => handleEventFormClose()}
        onDelete={handleDeleteEvent}
      />
    </>
  );
};
