import {
  Alert,
  FormControl,
  FormHelperText,
  Grid,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { ITaskProxy } from '@renderer/services/ITaskProxy';
import { TYPES } from '@renderer/types';
import { Task, TASK_PRIORITY, TASK_STATUS } from '@shared/data/Task';
import { AppError } from '@shared/errors/AppError';
import { UniqueConstraintError } from '@shared/errors/UniqueConstraintError';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import rendererContainer from '../../inversify.config';
import { ReadOnlyTextField } from '../common/fields/ReadOnlyTextField';
import { CRUDFormDialog } from '../crud/CRUDFormDialog';
import { ProjectDropdownComponent } from '../project/ProjectDropdownComponent';
import { getLogger } from '@renderer/utils/LoggerUtil';
import { DatePicker } from '@mui/x-date-pickers';

interface TaskFormData {
  id: string;
  name: string;
  projectId: string;
  description: string;
  status: TASK_STATUS;
  priority: TASK_PRIORITY;
  plannedHours?: number;
  dueDate?: Date;
}

interface TaskEditProps {
  isOpen: boolean;
  taskId: string | null;
  onClose: () => void;
  onSubmit: (task: Task) => void;
}

const logger = getLogger('TaskEdit');

/**
 * タスク編集コンポーネント
 *
 * @param {boolean} isOpen - モーダルの開閉フラグ
 * @param {string} taskId - タスクID
 * @param {Function} onClose - モーダルを閉じるイベントハンドラ
 * @param {Function} onSubmit - フォーム送信時のイベントハンドラ
 * @returns {JSX.Element} - タスク編集コンポーネント
 */
export const TaskEdit = ({ isOpen, taskId, onClose, onSubmit }: TaskEditProps): JSX.Element => {
  logger.info('TaskEdit', isOpen);
  const [isDialogOpen, setDialogOpen] = useState(isOpen);
  const [task, setTask] = useState<Task | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors: formErrors },
    setError,
  } = useForm<TaskFormData>();

  useEffect(() => {
    // タスク編集画面のリセットと設定
    const fetchData = async (): Promise<void> => {
      if (logger.isDebugEnabled()) logger.debug('TaskEdit fetchData', taskId);
      const taskProxy = rendererContainer.get<ITaskProxy>(TYPES.TaskProxy);
      let task: Task | null = null;
      if (taskId !== null) {
        task = await taskProxy.get(taskId);
      }
      reset(task ? task : {});
      setTask(task);
    };
    fetchData();
    setDialogOpen(isOpen);
  }, [isOpen, taskId, reset]);

  /**
   * ダイアログの送信用ハンドラー
   *
   * @param {TaskFormData} data - フォームのタスクオブジェクト
   */
  const handleDialogSubmit = async (data: TaskFormData): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug('TaskEdit handleDialogSubmit', data);
    // mongodb や nedb の場合、 _id などのエンティティとしては未定義の項目が埋め込まれていることがあり
    // それらの項目を使って更新処理が行われるため、`...Task` で隠れた項目もコピーされるようにする
    const newTask: Task = {
      ...task,
      id: task ? task.id : '',
      name: data.name,
      projectId: data.projectId,
      description: data.description,
      status: data.status,
      priority: data.priority,
      plannedHours: data.plannedHours,
      dueDate: data.dueDate,
      updated: new Date(),
    };
    try {
      const taskProxy = rendererContainer.get<ITaskProxy>(TYPES.TaskProxy);
      const saved = await taskProxy.save(newTask);
      await onSubmit(saved);
      onClose();
      reset();
    } catch (error) {
      logger.error('TaskEdit handleDialogSubmit error', error);
      const errName = AppError.getErrorName(error);
      if (errName === UniqueConstraintError.NAME) {
        setError('name', {
          type: 'manual',
          message: 'タスク名と関連プロジェクトは既に登録されています',
        });
      } else {
        throw error;
      }
    }
  };

  /**
   * ダイアログのクローズ用ハンドラー
   */
  const handleDialogClose = (): void => {
    if (logger.isDebugEnabled()) logger.debug('TaskEdit handleDialogClose');
    onClose();
  };

  return (
    <CRUDFormDialog
      isOpen={isDialogOpen}
      title={`タスク${taskId !== null ? '編集' : '追加'}`}
      onSubmit={handleSubmit(handleDialogSubmit)}
      onClose={handleDialogClose}
    >
      <Grid container spacing={2}>
        {taskId !== null && (
          <Grid item xs={12}>
            <Controller
              name="id"
              control={control}
              render={({ field }): React.ReactElement => (
                <ReadOnlyTextField field={field} label="ID" />
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
                label="タスク名"
                variant="outlined"
                error={!!error}
                helperText={error?.message}
                fullWidth
                margin="normal"
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="projectId"
            control={control}
            rules={{ required: '入力してください。' }}
            render={({ field: { onChange, value }, fieldState: { error } }): JSX.Element => (
              <FormControl fullWidth>
                <ProjectDropdownComponent value={value} onChange={onChange} />
                {error && <FormHelperText error={!!error}>{error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="description"
            control={control}
            rules={{ required: '入力してください。' }}
            render={({ field, fieldState: { error } }): React.ReactElement => (
              <TextField
                {...field}
                label="説明"
                variant="outlined"
                error={!!error}
                helperText={error?.message}
                fullWidth
                margin="normal"
              />
            )}
          />
        </Grid>
        <Grid item xs={6}>
          <Controller
            name="status"
            control={control}
            defaultValue={TASK_STATUS.UNCOMPLETED}
            render={({ field }): React.ReactElement => (
              <TextField
                {...field}
                select
                label="ステータス"
                variant="outlined"
                fullWidth
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      style: {
                        maxHeight: '20rem',
                      },
                    },
                  },
                }}
              >
                <MenuItem value={TASK_STATUS.COMPLETED}>
                  <em>完了</em>
                </MenuItem>
                <MenuItem value={TASK_STATUS.UNCOMPLETED}>
                  <em>未完了</em>
                </MenuItem>
              </TextField>
            )}
          />
        </Grid>
        <Grid item xs={6}>
          <Controller
            name="priority"
            control={control}
            defaultValue={TASK_PRIORITY.MEDIUM}
            render={({ field }): React.ReactElement => (
              <TextField
                {...field}
                select
                label="優先度"
                variant="outlined"
                fullWidth
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      style: {
                        maxHeight: '20rem',
                      },
                    },
                  },
                }}
              >
                <MenuItem value={TASK_PRIORITY.HIGH}>
                  <em>高</em>
                </MenuItem>
                <MenuItem value={TASK_PRIORITY.MEDIUM}>
                  <em>中</em>
                </MenuItem>
                <MenuItem value={TASK_PRIORITY.LOW}>
                  <em>低</em>
                </MenuItem>
              </TextField>
            )}
          />
        </Grid>
        <Grid item xs={6}>
          <Controller
            name="plannedHours"
            control={control}
            render={({ field, fieldState: { error } }): React.ReactElement => (
              <TextField
                {...field}
                type="number"
                label="予定工数(時間)"
                error={!!error}
                helperText={error?.message}
                variant="outlined"
                fullWidth
                InputProps={{
                  inputProps: {
                    min: 0,
                  },
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={6}>
          <Controller
            name="dueDate"
            control={control}
            render={({ field: { onChange, value } }): React.ReactElement => (
              <DatePicker label="期限日" value={value} onChange={onChange} format="yyyy/MM/dd" />
            )}
          />
        </Grid>
        <Stack>
          {Object.entries(formErrors).length > 0 && (
            <Alert severity="error">入力エラーを修正してください</Alert>
          )}
        </Stack>
      </Grid>
    </CRUDFormDialog>
  );
};
