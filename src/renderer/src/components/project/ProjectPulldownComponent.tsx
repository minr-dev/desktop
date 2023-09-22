import React, { useEffect, useState } from 'react';
import { TextField, MenuItem, Box, Button } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useProjectMap } from '@renderer/hooks/useProjectMap';

/**
 * ProjectPulldownComponentのプロパティを定義するインターフェース。
 *
 * @property {Function} onChange - プロジェクトが選択されたときに呼び出される関数。
 * @property {string | null} [value] - 初期値または外部から制御される値。オプショナル。
 */
interface ProjectPulldownComponentProps {
  onChange: (value: string) => void;
  onAdd: () => void;
  value?: string | null;
}

/**
 * プロジェクト選択用のプルダウンコンポーネント。
 *
 * プロジェクトの一覧を取得して、プルダウンに表示する。
 * 既存の登録の中に選択できるプロジェクトがないときのために、新規作成のボタンも表示する。
 *
 * このコンポーネントはプロジェクトの選択と新規プロジェクト追加のトリガーが含まれている。
 * しかし、新規プロジェクトの追加設定用のダイアログはこのコンポーネントに含まれていないため、
 * 親コンポーネントの方で、 ProjectEdit を表示制御するようにする。
 * 詳しくは、 EventEntryForm を参照。
 *
 * @param {ProjectPulldownComponentProps} props - コンポーネントのプロパティ。
 * @returns {JSX.Element} レンダリング結果。
 */
export const ProjectPulldownComponent = ({
  onChange,
  onAdd,
  value,
}: ProjectPulldownComponentProps): JSX.Element => {
  const { projectMap, refresh, isLoading } = useProjectMap();
  const [selectedValue, setSelectedValue] = useState<string | undefined | null>(value || '');

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    setSelectedValue(value || '');
  }, [value]);

  // プルダウンの値が選択変更されたイベント
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSelectedValue(e.target.value);
    onChange(e.target.value);
    console.log('ProjectPulldownComponent handleChange called with:', e.target.value);
  };

  // 新規プロジェクトを作成するボタンのクリックイベント
  const handleAddProject = (): void => {
    onAdd();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const sorted = Array.from(projectMap.values()).sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  return (
    <>
      <TextField
        select
        label="プロジェクト"
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
          <em>プロジェクトなし</em>
        </MenuItem>
        {sorted.map((project) => (
          <MenuItem key={project.id} value={project.id}>
            {project.name}
          </MenuItem>
        ))}
        <Box borderTop={1}>
          <Button variant="text" color="primary" onClick={handleAddProject}>
            <AddCircleIcon sx={{ marginRight: '0.5rem' }} />
            新しいプロジェクトを作成する
          </Button>
        </Box>
      </TextField>
    </>
  );
};
