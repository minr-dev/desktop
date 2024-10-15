import { Alert, FormControl, FormHelperText, Stack, TextField } from '@mui/material';
import { ITaskProxy } from '@renderer/services/ITaskProxy';
import { TYPES } from '@renderer/types';
import { Task } from '@shared/data/Task';
import { AppError } from '@shared/errors/AppError';
import { UniqueConstraintError } from '@shared/errors/UniqueConstraintError';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import rendererContainer from '../../inversify.config';
import { ReadOnlyTextField } from '../common/fields/ReadOnlyTextField';
import { CRUDFormDialog } from '../crud/CRUDFormDialog';
import { ProjectDropdownComponent } from '../project/ProjectDropdownComponent';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';

interface TaskFormData {
  id: string;
  name: string;
  projectId: string;
  description: string;
}

interface TaskEditProps {
  isOpen: boolean;
  taskId: string | null;
  onClose: () => void;
  onSubmit: (task: Task) => void;
}

const loggerFactory = rendererContainer.get<ILoggerFactory>('LoggerFactory');
const logger = loggerFactory.getLogger('TaskEdit');

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
  logger.info(`TaskEdit: ${isOpen}`);
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
      if (logger.isDebugEnabled()) logger.debug(`TaskEdit fetchData: ${taskId}`);
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
  }, [isOpen, taskId, reset, logger]);

  /**
   * ダイアログの送信用ハンドラー
   *
   * @param {TaskFormData} data - フォームのタスクオブジェクト
   */
  const handleDialogSubmit = async (data: TaskFormData): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug(`TaskEdit handleDialogSubmit: ${data}`);
    // mongodb や nedb の場合、 _id などのエンティティとしては未定義の項目が埋め込まれていることがあり
    // それらの項目を使って更新処理が行われるため、`...Task` で隠れた項目もコピーされるようにする
    const newTask: Task = {
      ...task,
      id: task ? task.id : '',
      name: data.name,
      projectId: data.projectId,
      description: data.description,
      updated: new Date(),
    };
    try {
      const taskProxy = rendererContainer.get<ITaskProxy>(TYPES.TaskProxy);
      const saved = await taskProxy.save(newTask);
      await onSubmit(saved);
      onClose();
      reset();
    } catch (error) {
      logger.error(`TaskEdit handleDialogSubmit error: ${error}`);
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
      {taskId !== null && (
        <Controller
          name="id"
          control={control}
          render={({ field }): React.ReactElement => <ReadOnlyTextField field={field} label="ID" />}
        />
      )}
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
      <Stack>
        {Object.entries(formErrors).length > 0 && (
          <Alert severity="error">入力エラーを修正してください</Alert>
        )}
      </Stack>
    </CRUDFormDialog>
  );
};
