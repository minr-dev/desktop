import rendererContainer from '@renderer/inversify.config';
import React, { useEffect, useMemo, useState } from 'react';
import { TextField, MenuItem, Box, Button, Menu } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { TYPES } from '@renderer/types';
import { useFetchCRUDData } from '@renderer/hooks/useFetchCRUDData';
import { Project } from '@shared/data/Project';
import { ICRUDProxy } from '@renderer/services/ICRUDProxy';
import { Pageable } from '@shared/data/Page';

/**
 * ProjectPulldownComponentのプロパティを定義するインターフェース。
 *
 * @property {Function} onChange - プロジェクトが選択されたときに呼び出される関数。
 * @property {string | null} [value] - 初期値または外部から制御される値。オプショナル。
 */
interface ProjectPulldownComponentProps {
  onChange: (value: string) => void;
  onAdd: () => void;
  pageable: Pageable;
  value?: string | null;
}

/**
 * プロジェクト選択用のプルダウンコンポーネント。
 *
 * プロジェクトの一覧を取得して、プルダウンに表示する。
 * 既存の登録の中に選択できるプロジェクトがないときのために、新規作成のボタンも表示する。
 *
 * @param {ProjectPulldownComponentProps} props - コンポーネントのプロパティ。
 * @returns {JSX.Element} レンダリング結果。
 */
export const ProjectPulldownComponent = ({
  onChange,
  onAdd,
  pageable,
  value,
}: ProjectPulldownComponentProps): JSX.Element => {
  const crudProxy = rendererContainer.get<ICRUDProxy<Project>>(TYPES.ProjectProxy);
  const { page, refreshPage, isLoading } = useFetchCRUDData<Project>({ pageable, crudProxy });
  const [selectedValue, setSelectedValue] = useState<string | undefined | null>(value || '');

  useEffect(() => {
    refreshPage();
    setSelectedValue(value || '');
    console.log('ProjectPulldownComponent useEffect called with:', value);
  }, [value, pageable, refreshPage]);

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

  return (
    <>
      <TextField
        select
        label="プロジェクト"
        value={selectedValue}
        onChange={handleChange}
        variant="outlined"
        fullWidth
      >
        <MenuItem value="">
          <em>プロジェクトなし</em>
        </MenuItem>
        {page?.content.map((project) => (
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
