import React, { useEffect, useState } from 'react';
import { TextField, MenuItem, Box, Button } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useProjectMap } from '@renderer/hooks/useProjectMap';
import { ProjectEdit } from './ProjectEdit';
import { Project } from '@shared/data/Project';
import { getLogger } from '@renderer/utils/LoggerUtil';

/**
 * ProjectDropdownComponentのプロパティを定義するインターフェース。
 *
 * @property {Function} onChange - プロジェクトが選択されたときに呼び出される関数。
 * @property {string | null} [value] - 初期値または外部から制御される値。オプショナル。
 */
interface ProjectDropdownComponentProps {
  onChange: (value: string) => void;
  value?: string | null;
}

const logger = getLogger('ProjectDropdownComponent');

/**
 * プロジェクト選択用のドロップダウンコンポーネント。
 *
 * プロジェクトの一覧を取得して、プルダウンに表示する。
 * 既存の登録の中に選択できるプロジェクトがないときのために、新規作成のボタンも表示する。
 *
 * このコンポーネントはプロジェクトの選択と新規プロジェクト追加のトリガーが含まれている。
 * しかし、新規プロジェクトの追加設定用のダイアログはこのコンポーネントに含まれていないため、
 * 親コンポーネントの方で、 ProjectEdit を表示制御するようにする。
 * また、このコンポーネントは、内部的に useProjectMap によって、プロジェクト一覧を取得しているので、
 * 新規の追加があった場合には、 refresh を呼び出して、プルダウンを更新する必要があるが、
 * 追加設定用のダイアログが親コンポーネントにあるので、親コンポーネントの方でも、
 * useProjectMap を inport して refresh を呼び出す必要がある。
 * 詳しくは、 EventEntryForm を参照。
 *
 * @param {ProjectDropdownComponentProps} props - コンポーネントのプロパティ。
 * @returns {JSX.Element} レンダリング結果。
 */
export const ProjectDropdownComponent = ({
  onChange,
  value,
}: ProjectDropdownComponentProps): JSX.Element => {
  const { projectMap, isLoading, refresh } = useProjectMap();
  const [selectedValue, setSelectedValue] = useState<string | undefined | null>(value || '');
  const [isDialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setSelectedValue(value || '');
  }, [value]);

  // ドロップダウンの値が選択変更されたイベント
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSelectedValue(e.target.value);
    onChange(e.target.value);
    if (logger.isDebugEnabled())
      logger.debug('ProjectDropdownComponent handleChange called with:', e.target.value);
  };

  // 新規プロジェクトを作成するボタンのクリックイベント
  const handleAdd = (): void => {
    if (logger.isDebugEnabled()) logger.debug('handleAdd');
    setDialogOpen(true);
  };

  const handleDialogClose = (): void => {
    if (logger.isDebugEnabled()) logger.debug('handleDialogClose');
    setDialogOpen(false);
  };

  const handleDialogSubmit = async (project: Project): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug('handleDialogSubmit', project);
    await refresh();
    setSelectedValue(project.id);
    onChange(project.id);
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
          <Button variant="text" color="primary" onClick={handleAdd}>
            <AddCircleIcon sx={{ marginRight: '0.5rem' }} />
            新しいプロジェクトを作成する
          </Button>
        </Box>
      </TextField>
      {isDialogOpen && (
        <ProjectEdit
          isOpen={isDialogOpen}
          projectId={null}
          onClose={handleDialogClose}
          onSubmit={handleDialogSubmit}
        />
      )}
    </>
  );
};
