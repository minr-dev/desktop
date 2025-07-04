import { Box, Button, FormHelperText, MenuItem, TextField } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useTaskMap, useTaskMapFilteredByProject } from '@renderer/hooks/useTaskMap';
import { Task } from '@shared/data/Task';
import { useEffect, useState } from 'react';
import { TaskEdit } from './TaskEdit';
import { getLogger } from '@renderer/utils/LoggerUtil';

interface TaskDropdownComponentProps {
  onChange: (value: string) => void;
  value?: string | null;
  projectId: string;
}

const logger = getLogger('TaskDropdownComponent');

/**
 * タスク選択用のドロップダウンコンポーネント。
 *
 * プロジェクトIDでフィルタリングしたタスクの一覧を取得して、プルダウンに表示する。
 * 既存の登録の中に選択できるタスクがないときのために、新規作成のボタンも表示する。
 *
 * このコンポーネントはタスクの選択と新規プロジェクト追加のトリガーが含まれている。
 * しかし、新規タスクの追加設定用のダイアログはこのコンポーネントに含まれていないため、
 * 親コンポーネントの方で、 TaskEdit を表示制御するようにする。
 * また、このコンポーネントは、内部的に useTaskMap によって、タスク一覧を取得しているので、
 * 新規の追加があった場合には、 refresh を呼び出して、プルダウンを更新する必要があるが、
 * 追加設定用のダイアログが親コンポーネントにあるので、親コンポーネントの方でも、
 * useTaskMap を inport して refresh を呼び出す必要がある。
 * 詳しくは、 EventEntryForm を参照。
 *
 * @param {TaskDropdownComponentProps} props - コンポーネントのプロパティ。
 * @returns {JSX.Element} レンダリング結果。
 */
export const TaskDropdownComponent = ({
  onChange,
  value,
  projectId,
}: TaskDropdownComponentProps): JSX.Element => {
  const {
    taskMap,
    isLoading,
    refresh: filteredTaskRefresh,
  } = useTaskMapFilteredByProject(projectId);
  // 新しいタスクを作成した際に、タイムライン側のタスクを更新するため useTaskMap で refresh を行う。
  // useTaskMapFilteredByProject と useTaskMap はそれぞれ別々のタスクデータを扱っているため、
  // ここで追加したデータをタイムラインに反映させるには useTaskMap の refresh を実行する必要がある。
  // TODO: マップそれぞれで持っている refresh を統合して共通化し、どのマップからでもタスクデータの全体更新ができるようにする。
  const { refresh: taskRefresh } = useTaskMap();
  const [isDialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const task = value != null ? taskMap.get(value) : null;
    if (task && task.projectId === projectId) {
      onChange(value ?? '');
    } else {
      onChange('');
    }
  }, [onChange, value, projectId, taskMap]);

  /**
   * タスク変更ハンドラー
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - 入力イベント
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onChange(e.target.value);
    if (logger.isDebugEnabled())
      logger.debug('TaskDropdownComponent handleChange called with:', e.target.value);
  };

  /**
   * タスク追加ハンドラー
   */
  const handleAdd = (): void => {
    if (logger.isDebugEnabled()) logger.debug('handleAdd');
    setDialogOpen(true);
  };

  /**
   * ダイアログのクローズ用ハンドラー
   */
  const handleDialogClose = (): void => {
    if (logger.isDebugEnabled()) logger.debug('handleDialogClose');
    setDialogOpen(false);
  };

  /**
   * ダイアログの送信用ハンドラー
   *
   * @param {Task} task - タスクオブジェクト
   */
  const handleDialogSubmit = async (task: Task): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug('handleDialogSubmit', task);
    await taskRefresh();
    await filteredTaskRefresh();
    onChange(task.id);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const sorted = Array.from(taskMap.values()).sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  return (
    <>
      <TextField
        select
        label="タスク"
        value={value}
        onChange={handleChange}
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
        <MenuItem value="">
          <em>タスクなし</em>
        </MenuItem>
        {sorted.map((task) => (
          <MenuItem key={task.id} value={task.id}>
            {task.name}
          </MenuItem>
        ))}
        <Box borderTop={1}>
          {projectId !== '' && (
            <Button variant="text" color="primary" onClick={handleAdd}>
              <AddCircleIcon sx={{ marginRight: '0.5rem' }} />
              新しいタスクを作成する
            </Button>
          )}
          {projectId === '' && (
            <FormHelperText sx={{ marginLeft: '1rem', alignSelf: 'center' }}>
              プロジェクトを選択してください
            </FormHelperText>
          )}
        </Box>
      </TextField>
      {isDialogOpen && (
        <TaskEdit
          isOpen={isDialogOpen}
          taskId={null}
          projectId={projectId}
          onClose={handleDialogClose}
          onSubmit={handleDialogSubmit}
        />
      )}
    </>
  );
};
