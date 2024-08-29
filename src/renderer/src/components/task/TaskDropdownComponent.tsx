import { Box, Button, MenuItem, TextField } from "@mui/material";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useTaskMap } from "@renderer/hooks/useTaskMap";
import { Task } from "@shared/data/Task";
import { useEffect, useState } from "react";
import { TaskEdit } from "./TaskEdit";

interface TaskDropdownComponentProps {
  onChange: (value: string) => void;
  value?: string | null;
  selectedProjectId: string;
}

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
  selectedProjectId,
}: TaskDropdownComponentProps): JSX.Element => {
  const { taskMap, isLoading, refresh } = useTaskMap(selectedProjectId);
  const [selectedValue, setSelectedValue] = useState<string | undefined | null>(value || '');
  const [isDialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setSelectedValue(value || '');
  }, [value]);

  /**
   * タスク変更ハンドラー
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - 入力イベント
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSelectedValue(e.target.value);
    onChange(e.target.value);
    console.log('TaskDropdownComponent handleChange called with:', e.target.value);
  };

  /**
   * タスク追加ハンドラー
   */
  const handleAdd = (): void => {
    console.log('handleAdd');
    setDialogOpen(true);
  };

  /**
   * ダイアログのクローズ用ハンドラー
   */
  const handleDialogClose = (): void => {
    console.log('handleDialogClose');
    setDialogOpen(false);
  }

  /**
   * ダイアログの送信用ハンドラー
   * 
   * @param {Task} task - タスクオブジェクト
   */
  const handleDialogSubmit = async (task: Task): Promise<void> => {
    console.log('handleDialogSubmit', task);
    await refresh();
    setSelectedValue(task.id);
    onChange(task.id);
  };

  if (isLoading) {
    return <div>Loading...</div>
  }

  const sorted = Array.from(taskMap.values()).sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  return (
    <>
      <TextField
        select
        label="タスク"
        value={selectedValue}
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
          <Button variant="text" color="primary" onClick={handleAdd}>
            <AddCircleIcon sx={{ marginRight: '0.5rem' }} />
            新しいタスクを作成する
          </Button>
        </Box>
      </TextField>
      {isDialogOpen && (
        <TaskEdit
          isOpen={isDialogOpen}
          taskId={null}
          onClose={handleDialogClose}
          onSubmit={handleDialogSubmit}
        />
      )}
    </>
  );
};
