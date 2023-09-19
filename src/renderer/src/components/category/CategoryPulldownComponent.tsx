import rendererContainer from '@renderer/inversify.config';
import React, { useEffect, useState } from 'react';
import { TextField, MenuItem, Box, Button } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { TYPES } from '@renderer/types';
import { useFetchCRUDData } from '@renderer/hooks/useFetchCRUDData';
import { Category } from '@shared/data/Category';
import { ICRUDProxy } from '@renderer/services/ICRUDProxy';
import { Pageable } from '@shared/data/Page';

/**
 * CategoryPulldownComponent のプロパティを定義するインターフェース。
 *
 * @property {Function} onChange - カテゴリーが選択されたときに呼び出される関数。
 * @property {string | null} [value] - 初期値または外部から制御される値。オプショナル。
 */
interface CategoryPulldownComponentProps {
  onChange: (value: string) => void;
  onAdd: () => void;
  pageable: Pageable;
  value?: string | null;
}

/**
 * カテゴリー選択用のプルダウンコンポーネント。
 *
 * カテゴリーの一覧を取得して、プルダウンに表示する。
 * 既存の登録の中に選択できるカテゴリーがないときのために、新規作成のボタンも表示する。
 *
 * このコンポーネントはカテゴリーの選択と新規カテゴリー追加のトリガーが含まれている。
 * しかし、新規カテゴリーの追加設定用のダイアログはこのコンポーネントに含まれていないため、
 * 親コンポーネントの方で、 CategoryEdit を表示制御するようにする。
 * 詳しくは、 EventEntryForm を参照。
 *
 * @param {CategoryPulldownComponentProps} props - コンポーネントのプロパティ。
 * @returns {JSX.Element} レンダリング結果。
 */
export const CategoryPulldownComponent = ({
  onChange,
  onAdd,
  pageable,
  value,
}: CategoryPulldownComponentProps): JSX.Element => {
  const crudProxy = rendererContainer.get<ICRUDProxy<Category>>(TYPES.CategoryProxy);
  const { page, refreshPage, isLoading } = useFetchCRUDData<Category>({ pageable, crudProxy });
  const [selectedValue, setSelectedValue] = useState<string | undefined | null>(value || '');

  useEffect(() => {
    refreshPage();
  }, [pageable, refreshPage]);

  useEffect(() => {
    setSelectedValue(value || '');
  }, [value]);

  // プルダウンの値が選択変更されたイベント
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSelectedValue(e.target.value);
    onChange(e.target.value);
    console.log('CategoryPulldownComponent handleChange called with:', e.target.value);
  };

  // 新規カテゴリーを作成するボタンのクリックイベント
  const handleAddCategory = (): void => {
    onAdd();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <TextField
        select
        label="カテゴリー"
        value={selectedValue}
        onChange={handleChange}
        variant="outlined"
        fullWidth
      >
        <MenuItem value="">
          <em>カテゴリーなし</em>
        </MenuItem>
        {page?.content.map((project) => (
          <MenuItem key={project.id} value={project.id}>
            {project.name}
          </MenuItem>
        ))}
        <Box borderTop={1}>
          <Button variant="text" color="primary" onClick={handleAddCategory}>
            <AddCircleIcon sx={{ marginRight: '0.5rem' }} />
            新しいカテゴリーを作成する
          </Button>
        </Box>
      </TextField>
    </>
  );
};
