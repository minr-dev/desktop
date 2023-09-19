import rendererContainer from '@renderer/inversify.config';
import React, { useMemo, useState } from 'react';
import { TextField, MenuItem, Box, Button } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { TYPES } from '@renderer/types';
import { useFetchCRUDData } from '@renderer/hooks/useFetchCRUDData';
import { Project } from '@shared/data/Project';
import { ICRUDProxy } from '@renderer/services/ICRUDProxy';
import { Pageable } from '@shared/data/Page';

const DEFAULT_ORDER = 'name';
const DEFAULT_SORT_DIRECTION = 'asc';
const DEFAULT_PAGE_SIZE = 10;

/**
 * ProjectPulldownComponentのプロパティを定義するインターフェース。
 *
 * @property {Function} onChange - プロジェクトが選択されたときに呼び出される関数。
 * @property {string | null} [value] - 初期値または外部から制御される値。オプショナル。
 */
interface ProjectPulldownComponentProps {
  onChange: (value: string) => void;
  value?: string | null;
}

/**
 * プロジェクト選択用のプルダウンコンポーネント。
 *
 * プロジェクトの一覧を取得して、プルダウンに表示する。
 * 既存の登録の中に選択できるプロジェクトがないときのために、新規作成のボタンも表示する。
 *
 * TODO:
 * - pageSizeよりもデータが多いときにどうするかは要検討。
 * - ソートの仕様も要検討。
 *
 * @param {ProjectPulldownComponentProps} props - コンポーネントのプロパティ。
 * @returns {JSX.Element} レンダリング結果。
 */
export const ProjectPulldownComponent = ({
  onChange,
  value,
}: ProjectPulldownComponentProps): JSX.Element => {
  // TODO pageSize よりもデータが多いときにどうするかは要検討。またソートも。
  const pageable = useMemo<Pageable>(() => {
    return new Pageable(0, DEFAULT_PAGE_SIZE, {
      property: DEFAULT_ORDER,
      direction: DEFAULT_SORT_DIRECTION,
    });
  }, []);
  const crudProxy = rendererContainer.get<ICRUDProxy<Project>>(TYPES.ProjectProxy);
  const { page, isLoading } = useFetchCRUDData<Project>({ pageable, crudProxy });

  const [selectedValue, setSelectedValue] = useState<string | undefined | null>(value || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSelectedValue(e.target.value);
    onChange(e.target.value);
    console.log('ProjectPulldownComponent handleChange called with:', e.target.value);
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
          <Button variant="text" color="primary">
            <AddCircleIcon sx={{ marginRight: '0.5rem' }} />
            新しいプロジェクトを作成する
          </Button>
        </Box>
      </TextField>
    </>
  );
};
