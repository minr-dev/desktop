import { IPlanAutoRegistrationProxy } from '@renderer/services/IPlanAutoRegistrationProxy';
import rendererContainer from '../inversify.config';
import { TYPES } from '@renderer/types';
import { OverrunTask } from '@shared/data/OverrunTask';
import { useState } from 'react';
import { getLogger } from '@renderer/utils/LoggerUtil';

type useAutoRegistrationPlanProps = {
  refreshEventEntries: () => void;
};

type UseAutoRegistrationPlanResult = {
  overrunTasks: OverrunTask[];
  isFormOpen: boolean;
  handleAutoRegisterProvisional: (selectedDate?: Date, projectId?: string) => void;
  handleAutoRegisterConfirm: (selectedDate?: Date) => void;
  handleDeleteProvisional: (selectedDate?: Date) => void;
  handleConfirmExtraAllocation: (selectedDate: Date, extraAllocation: Map<string, number>) => void;
  handleCloseForm: () => void;
};

const logger = getLogger('useAutoRegistrationPlan');

export const useAutoRegistrationPlan = ({
  refreshEventEntries,
}: useAutoRegistrationPlanProps): UseAutoRegistrationPlanResult => {
  const [overrunTasks, setOverrunTasks] = useState<OverrunTask[]>([]);
  const [isFormOpen, setFormOpen] = useState(false);
  const autoRegisterPlanService = rendererContainer.get<IPlanAutoRegistrationProxy>(
    TYPES.PlanAutoRegistrationProxy
  );
  const handleAutoRegisterProvisional = (selectedDate?: Date, projectId?: string): void => {
    if (logger.isDebugEnabled())
      logger.debug('handleAutoRegisterProvisional', selectedDate, projectId);
    if (selectedDate == null) {
      return;
    }
    autoRegisterPlan(selectedDate, undefined, projectId);
  };

  const handleAutoRegisterConfirm = (selectedDate?: Date): void => {
    if (selectedDate == null) {
      return;
    }
    const autoRegisterConfirm = async (): Promise<void> => {
      await autoRegisterPlanService.confirmRegistration(selectedDate);
      refreshEventEntries();
    };
    autoRegisterConfirm();
  };

  const handleDeleteProvisional = (selectedDate?: Date): void => {
    if (selectedDate == null) {
      return;
    }
    const deleteProvisionalActuals = async (): Promise<void> => {
      await autoRegisterPlanService.deleteProvisional(selectedDate);
      refreshEventEntries();
    };
    deleteProvisionalActuals();
  };

  const handleConfirmExtraAllocation = async (
    selectedDate: Date,
    extraAllocation: Map<string, number>
  ): Promise<void> => {
    if (logger.isDebugEnabled())
      logger.debug('handleConfirmExtraAllocationForm', selectedDate, extraAllocation);
    autoRegisterPlan(selectedDate, extraAllocation);
    setFormOpen(false);
    // 確定時、追加工数フォームが閉じる前に overrunTask が空になって、一瞬中身のないフォームが映ってしまう。
    // 空にしなくとも動作はするので、ひとまずコメントアウトで対応する。
    // setOverrunTasks([]);
  };

  const handleCloseForm = async (): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug('handleCloseExtraAllocationForm');
    setFormOpen(false);
    // handleCondirmExtraAllocation と同じ理由でコメントアウト
    // setOverrunTasks([]);
  };

  const autoRegisterPlan = async (
    selectedDate?: Date,
    extraAllocation?: Map<string, number>,
    projectId?: string
  ): Promise<void> => {
    if (selectedDate == null) {
      return;
    }
    const result = await autoRegisterPlanService.autoRegisterProvisonal(
      selectedDate,
      extraAllocation,
      projectId
    );
    if (result.success) {
      refreshEventEntries();
    } else if (result.overrunTasks) {
      setOverrunTasks(result.overrunTasks);
      setFormOpen(true);
    }
  };

  return {
    overrunTasks,
    isFormOpen,
    handleAutoRegisterProvisional,
    handleAutoRegisterConfirm,
    handleDeleteProvisional,
    handleConfirmExtraAllocation,
    handleCloseForm,
  };
};
