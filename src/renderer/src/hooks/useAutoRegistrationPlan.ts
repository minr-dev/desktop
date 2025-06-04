import {
  IPlanAutoRegistrationProxy,
  PlanAutoRegistrationParams,
} from '@renderer/services/IPlanAutoRegistrationProxy';
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
  handleAutoRegisterProvisional: (targetDate?: Date, projectId?: string) => void;
  handleAutoRegisterConfirm: (targetDate?: Date) => void;
  handleDeleteProvisional: (targetDate?: Date) => void;
  handleConfirmExtraAllocation: (targetDate: Date, taskExtraHours: Map<string, number>) => void;
  handleCloseForm: () => void;
};

const logger = getLogger('useAutoRegistrationPlan');

export const useAutoRegistrationPlan = ({
  refreshEventEntries,
}: useAutoRegistrationPlanProps): UseAutoRegistrationPlanResult => {
  const [overrunTasks, setOverrunTasks] = useState<OverrunTask[]>([]);
  const [isFormOpen, setFormOpen] = useState(false);
  const [processingProjectId, setProcessingProjectId] = useState<string | undefined>(undefined);
  const autoRegisterPlanService = rendererContainer.get<IPlanAutoRegistrationProxy>(
    TYPES.PlanAutoRegistrationProxy
  );
  const handleAutoRegisterProvisional = (targetDate?: Date, projectId?: string): void => {
    if (logger.isDebugEnabled())
      logger.debug('handleAutoRegisterProvisional', targetDate, projectId);
    if (targetDate == null) {
      return;
    }
    autoRegisterPlan({ targetDate, projectId });
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
    targetDate: Date,
    taskExtraHours: Map<string, number>
  ): Promise<void> => {
    if (logger.isDebugEnabled())
      logger.debug('handleConfirmExtraAllocationForm', targetDate, taskExtraHours);
    autoRegisterPlan({ targetDate, projectId: processingProjectId, taskExtraHours });
    setFormOpen(false);
    // 確定時、追加工数フォームが閉じる前に overrunTask が空になって、一瞬中身のないフォームが映ってしまう。
    // 空にしなくとも動作はするので、ひとまずコメントアウトで対応する。
    // setOverrunTasks([]);
  };

  const handleCloseForm = async (): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug('handleCloseExtraAllocationForm');
    setProcessingProjectId(undefined);
    setFormOpen(false);
    // handleCondirmExtraAllocation と同じ理由でコメントアウト
    // setOverrunTasks([]);
  };

  const autoRegisterPlan = async ({
    targetDate,
    projectId,
    taskExtraHours = new Map<string, number>(),
  }: PlanAutoRegistrationParams): Promise<void> => {
    const result = await autoRegisterPlanService.autoRegisterProvisonal({
      targetDate,
      projectId,
      taskExtraHours,
    });
    if (result.success) {
      refreshEventEntries();
      setProcessingProjectId(undefined);
    } else if (result.overrunTasks) {
      setProcessingProjectId(projectId);
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
