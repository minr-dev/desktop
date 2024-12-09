import React, { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import {
  Grid,
  Dialog,
  DialogActions,
  Button,
  DialogContent,
  DialogTitle,
  Box,
} from '@mui/material';
import { styled } from '@mui/system';
import { getLogger } from '@renderer/utils/LoggerUtil';
import { OverrunTask } from '@shared/data/OverrunTask';
import { useTaskMap } from '@renderer/hooks/useTaskMap';
import { useProjectMap } from '@renderer/hooks/useProjectMap';
import { ExtraAllocationItem } from './ExtraAllocationItem';

const CustomDialogContent = styled(DialogContent)`
  transition: width 0.5s ease;
`;

const CustomDialog = styled(Dialog)`
  & .MuiDialog-paper {
    transition: transform 0.5s ease, width 0.5s ease;
  }
`;

export interface ExtraAllocationFormData {
  allocations: {
    taskId: string;
    taskName: string;
    projectName?: string;
    estimatedHours: number;
    scheduledMinutes: number;
    extraAllocateHours: number;
  }[];
}

interface ExtraAllocationFormProps {
  isOpen: boolean;
  overrunTasks: OverrunTask[];
  onSubmit: (extraAllocation: Map<string, number>) => void;
  onClose: () => void;
}

const logger = getLogger('ExtraAllocationForm');

/**
 * 予定の自動登録でタスクの予定工数を実績が超過していた場合に表示するコンポーネント。
 *
 * @param {ExtraAllocationFormProps} props - コンポーネントのプロパティ。
 * @returns {JSX.Element} レンダリング結果。
 */
const ExtraAllocationForm = (
  { isOpen, overrunTasks, onSubmit, onClose }: ExtraAllocationFormProps,
  ref
): JSX.Element => {
  logger.info('ExtraAllocationForm', isOpen);

  const { handleSubmit, control, reset } = useForm<ExtraAllocationFormData>();

  const { fields } = useFieldArray({
    name: 'allocations',
    control: control,
  });

  const { taskMap } = useTaskMap();
  const { projectMap } = useProjectMap();

  useEffect(() => {
    reset({
      allocations: overrunTasks.map(({ taskId, schduledTime: actualTimeMs }) => {
        const task = taskMap.get(taskId);
        if (task == null) {
          throw new Error();
        }
        const project = projectMap.get(task.projectId);
        return {
          taskId,
          taskName: task.name,
          projectName: project?.name,
          plannedHours: task.plannedHours,
          actualMinutes: Math.floor(actualTimeMs / (60 * 1000)),
          allocateHours: undefined,
        };
      }),
    });
  }, [overrunTasks, projectMap, reset, taskMap]);

  const handleFormSubmit = async (data: ExtraAllocationFormData): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug('EventForm handleFormSubmit called with:', data);
    const extraAllocationData = data.allocations.map((allocation): [string, number] => [
      allocation.taskId,
      allocation.extraAllocateHours,
    ]);
    await onSubmit(new Map<string, number>(extraAllocationData));
  };

  const handleCloseEventEntryForm = async (): Promise<void> => {
    await onClose();
  };

  return (
    <CustomDialog
      ref={ref}
      open={isOpen}
      onClose={handleCloseEventEntryForm}
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit(handleFormSubmit),
        style: {
          maxWidth: 600,
          transition: 'width 0.5s ease, transform 0.5s ease',
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          工数の再設定
        </Box>
      </DialogTitle>
      <CustomDialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {fields.map((field, index) => {
              return <ExtraAllocationItem control={control} index={index} key={field.id} />;
            })}
          </Grid>
        </Grid>
      </CustomDialogContent>
      <DialogActions>
        <Button type="submit" color="primary" variant="contained">
          登録
        </Button>
        <Button onClick={handleCloseEventEntryForm} color="secondary" variant="contained">
          キャンセル
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default React.forwardRef(ExtraAllocationForm);
