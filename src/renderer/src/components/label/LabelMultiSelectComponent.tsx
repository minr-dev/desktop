import React, { useEffect, useState } from 'react';
import { MenuItem, Box, Button } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Label } from '@shared/data/Label';
import { useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import { useLabelMap } from '@renderer/hooks/useLabelMap';

/**
 * LabelMultiSelectComponent のプロパティを定義するインターフェース。
 *
 * @property {Function} onChange - ラベルが選択されたときに呼び出される関数。
 * @property {string | null} [value] - 初期値または外部から制御される値。オプショナル。
 */
interface LabelMultiSelectComponentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
  onChange: (values: string[]) => void;
  onAdd: () => void;
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
 * @param {LabelMultiSelectComponentProps} props - コンポーネントのプロパティ。
 * @returns {JSX.Element} レンダリング結果。
 */
export const LabelMultiSelectComponent = ({
  field,
  onChange,
  onAdd,
  value,
}: LabelMultiSelectComponentProps): JSX.Element => {
  const { labelMap, isLoading } = useLabelMap();
  const [selectedValue, setSelectedValue] = useState<Label['id'][]>(value || []);
  const theme = useTheme();

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

  const sortedLabels = Array.from(labelMap.values()).sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  return (
    <>
      <FormControl fullWidth>
        <InputLabel id={`${field.id}-label`}>ラベル</InputLabel>
        <Select<string[]>
          {...field}
          value={field.value || []}
          labelId={`${field.id}-label`}
          multiple
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
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: '20rem',
              },
            },
          }}
        >
          {sortedLabels.map((label) => (
            <MenuItem
              key={label.id}
              value={label.id}
              style={{
                fontWeight:
                  selectedValue.indexOf(label.id) === -1
                    ? theme.typography.fontWeightRegular
                    : theme.typography.fontWeightMedium,
              }}
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
