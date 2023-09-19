import rendererContainer from '@renderer/inversify.config';
import React, { useEffect, useState } from 'react';
import { TextField, MenuItem, Box, Button } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { TYPES } from '@renderer/types';
import { useFetchCRUDData } from '@renderer/hooks/useFetchCRUDData';
import { Label } from '@shared/data/Label';
import { ICRUDProxy } from '@renderer/services/ICRUDProxy';
import { Pageable } from '@shared/data/Page';
import { Theme, useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { AppError } from '@shared/errors/AppError';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(
  name: string,
  selectedValue: readonly string[],
  theme: Theme
): React.CSSProperties {
  return {
    fontWeight:
      selectedValue.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

/**
 * LabelMultiSelectChip のプロパティを定義するインターフェース。
 *
 * @property {Function} onChange - ラベルが選択されたときに呼び出される関数。
 * @property {string | null} [value] - 初期値または外部から制御される値。オプショナル。
 */
interface LabelMultiSelectChipProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
  onChange: (values: string[]) => void;
  onAdd: () => void;
  pageable: Pageable;
  value?: string[] | null;
}

/**
 * ラベル選択用のプルダウンコンポーネント。
 *
 * ラベルの一覧を取得して、プルダウンに表示する。
 * 既存の登録の中に選択できるラベルがないときのために、新規作成のボタンも表示する。
 *
 * このコンポーネントはラベルの選択と新規ラベル追加のトリガーが含まれている。
 * しかし、新規ラベルの追加設定用のダイアログはこのコンポーネントに含まれていないため、
 * 親コンポーネントの方で、 LabelEdit を表示制御するようにする。
 * 詳しくは、 EventEntryForm を参照。
 *
 * @param {LabelMultiSelectChipProps} props - コンポーネントのプロパティ。
 * @returns {JSX.Element} レンダリング結果。
 */
export const LabelMultiSelectComponent = ({
  field,
  onChange,
  onAdd,
  pageable,
  value,
}: LabelMultiSelectChipProps): JSX.Element => {
  const crudProxy = rendererContainer.get<ICRUDProxy<Label>>(TYPES.LabelProxy);
  const { page, refreshPage, isLoading } = useFetchCRUDData<Label>({ pageable, crudProxy });
  const [selectedValue, setSelectedValue] = useState<Label['id'][]>(value || []);
  const theme = useTheme();

  useEffect(() => {
    refreshPage();
  }, [pageable, refreshPage]);

  useEffect(() => {
    setSelectedValue(value || []);
  }, [value]);

  // Multiple select の値が選択変更されたイベント
  const handleChange = (event: SelectChangeEvent<typeof selectedValue>): void => {
    const { value } = event.target;
    const values = typeof value === 'string' ? value.split(',') : value;
    setSelectedValue(values);
    onChange(values);
  };

  // 新規ラベルを作成するボタンのクリックイベント
  const handleAddLabel = (): void => {
    onAdd();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (page === null) {
    throw new AppError('page is null');
  }
  const labelMap = new Map<string, Label>();
  page.content.forEach((label) => {
    labelMap.set(label.id, label);
  });

  return (
    <>
      <FormControl fullWidth>
        <InputLabel id={`${field.id}-label`}>ラベル</InputLabel>
        <Select<string[]>
          labelId={`${field.id}-label`}
          // id={field.id}
          multiple
          // value={field.value || []}
          {...field}
          onChange={(e): void => {
            field.onChange(e);
            handleChange(e);
          }}
          input={<OutlinedInput id={`${field.id}-select-multiple`} label="ラベル" />}
          renderValue={(selected): React.ReactNode => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((id: Label['id']) => (
                <Chip key={id} label={labelMap.get(id)?.name || ''} />
              ))}
            </Box>
          )}
        >
          {page.content.map((label) => (
            <MenuItem
              key={label.id}
              value={label.id}
              style={getStyles(label.id, selectedValue, theme)}
            >
              {label.name}
            </MenuItem>
          ))}
          <Box borderTop={1}>
            <Button variant="text" color="primary" onClick={handleAddLabel}>
              <AddCircleIcon sx={{ marginRight: '0.5rem' }} />
              新しいラベルを作成する
            </Button>
          </Box>
        </Select>
      </FormControl>
    </>
  );
};
