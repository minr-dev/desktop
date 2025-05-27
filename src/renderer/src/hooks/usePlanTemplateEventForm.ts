import { FORM_MODE } from '@renderer/components/timeTable/EventEntryForm';
import { PlanTemplateEvent } from '@shared/data/PlanTemplateEvent';
import { Time } from '@shared/data/Time';
import { useState } from 'react';

interface UsePlanTemplateEventFormResults {
  isOpen: boolean;
  startTime: Time;
  formMode: FORM_MODE;
  event?: PlanTemplateEvent;
  handleAddEvent: (startTime: Time) => void;
  handleUpdateEvent: (event: PlanTemplateEvent) => void;
  handleCloseForm: () => void;
}

export const usePlanTemplateEventForm = (): UsePlanTemplateEventFormResults => {
  const [isOpen, setOpen] = useState(false);
  const [initialStartTime, setInitialStartTime] = useState<Time>({ hours: 0, minutes: 0 });
  const [formMode, setFormMode] = useState<FORM_MODE>(FORM_MODE.NEW);
  const [event, setEvent] = useState<PlanTemplateEvent | undefined>(undefined);

  const handleAddEvent = (startTime: Time): void => {
    setInitialStartTime(startTime);
    setFormMode(FORM_MODE.NEW);
    setEvent(undefined);
    setOpen(true);
  };
  const handleUpdateEvent = (event: PlanTemplateEvent): void => {
    setInitialStartTime(event.start);
    setFormMode(FORM_MODE.EDIT);
    setEvent(event);
    setOpen(true);
  };
  const handleCloseForm = (): void => {
    setOpen(false);
    setEvent(undefined);
  };

  return {
    isOpen,
    startTime: initialStartTime,
    formMode,
    event,
    handleAddEvent,
    handleUpdateEvent,
    handleCloseForm,
  };
};
