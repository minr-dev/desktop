import React, { useEffect, useState } from 'react';
import { TextField, MenuItem, Box, Button } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useCategoryMap } from '@renderer/hooks/useCategoryMap';
import { Category } from '@shared/data/Category';
import { CategoryEdit } from './CategoryEdit';
import rendererContainer from '../../inversify.config';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';
import { TYPES } from '@renderer/types';

/**
 * CategoryDropdownComponent のプロパティを定義するインターフェース。
 *
 * @property {Function} onChange - カテゴリーが選択されたときに呼び出される関数。
 * @property {string | null} [value] - 初期値または外部から制御される値。オプショナル。
 */
interface CategoryDropdownComponentProps {
  onChange: (value: string) => void;
  value?: string | null;
}

/**
 * カテゴリー選択用のドロップダウンコンポーネント。
 *
 * カテゴリーの一覧を取得して、ドロップダウンに表示する。
 * 既存の登録の中に選択できるカテゴリーがないときのために、新規作成のボタンも表示する。
 *
 * このコンポーネントはカテゴリーの選択と新規カテゴリー追加のトリガーが含まれている。
 * しかし、新規カテゴリーの追加設定用のダイアログはこのコンポーネントに含まれていないため、
 * 親コンポーネントの方で、 CategoryEdit を表示制御するようにする。
 * 詳しくは、 EventEntryForm を参照。
 *
 * @param {CategoryDropdownComponentProps} props - コンポーネントのプロパティ。
 * @returns {JSX.Element} レンダリング結果。
 */
export const CategoryDropdownComponent = ({
  onChange,
  value,
}: CategoryDropdownComponentProps): JSX.Element => {
  const { categoryMap, isLoading } = useCategoryMap();
  const [selectedValue, setSelectedValue] = useState<string | undefined | null>(value || '');

  const [isCategoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const { refresh: refreshCategories } = useCategoryMap();

  const loggerFactory = rendererContainer.get<ILoggerFactory>(TYPES.LoggerFactory);
  const logger = loggerFactory.getLogger({
    processType: 'renderer',
    loggerName: 'CategoryDropdownComponent',
  });

  useEffect(() => {
    setSelectedValue(value || '');
  }, [value]);

  // ドロップダウンの値が選択変更されたイベント
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSelectedValue(e.target.value);
    onChange(e.target.value);
    if (logger.isDebugEnabled())
      logger.debug(`CategoryDropdownComponent handleChange called with: ${e.target.value}`);
  };

  // 新規カテゴリーを作成するボタンのクリックイベント
  const handleAdd = (): void => {
    if (logger.isDebugEnabled()) logger.debug('handleAdd');
    setCategoryDialogOpen(true);
  };

  const handleDialogClose = (): void => {
    if (logger.isDebugEnabled()) logger.debug('handleDialogClose');
    setCategoryDialogOpen(false);
  };

  const handleDialogSubmit = async (category: Category): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug(`handleDialogSubmit: ${category}`);
    await refreshCategories();
    setSelectedValue(category.id);
    onChange(category.id);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const sorted = Array.from(categoryMap.values()).sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

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
        {sorted.map((project) => (
          <MenuItem key={project.id} value={project.id}>
            {project.name}
          </MenuItem>
        ))}
        <Box borderTop={1}>
          <Button variant="text" color="primary" onClick={handleAdd}>
            <AddCircleIcon sx={{ marginRight: '0.5rem' }} />
            新しいカテゴリーを作成する
          </Button>
        </Box>
      </TextField>
      {isCategoryDialogOpen && (
        <CategoryEdit
          isOpen={isCategoryDialogOpen}
          categoryId={null}
          onClose={handleDialogClose}
          onSubmit={handleDialogSubmit}
        />
      )}
    </>
  );
};
