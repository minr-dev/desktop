import React, { useEffect, useState } from 'react';
import { MenuItem, Box, Button, Paper } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Label } from '@shared/data/Label';
import { useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import { useLabelMap } from '@renderer/hooks/useLabelMap';
import { LabelEdit } from './LabelEdit';
import { getLogger } from '@renderer/utils/LoggerUtil';

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
  value?: string[] | null;
}

const logger = getLogger('LabelMultiSelectComponent');

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
  value,
}: LabelMultiSelectComponentProps): JSX.Element => {
  const { labelMap, isLoading, refresh } = useLabelMap();
  const [selectedValue, setSelectedValue] = useState<Label['id'][]>(value || []);
  const [isDialogOpen, setDialogOpen] = useState(false);
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
  const handleAdd = (): void => {
    if (logger.isDebugEnabled()) logger.debug('handleAdd');
    setDialogOpen(true);
  };

  const handleDialogClose = (): void => {
    if (logger.isDebugEnabled()) logger.debug('handleDialogClose');
    setDialogOpen(false);
  };

  const handleDialogSubmit = async (label: Label): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug('handleDialogSubmit', label);
    await refresh();
    const labelIds = [...selectedValue];
    labelIds.push(label.id);
    setSelectedValue(labelIds);
    onChange(labelIds);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const sortedLabels = Array.from(labelMap.values()).sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  const paperWithButton = ({ children, button, ...other }, ref): JSX.Element => {
    return (
      <Paper ref={ref} {...other}>
        {children}
        <Box borderTop={1}>{button}</Box>
      </Paper>
    );
  };
  const paperWithButtonRef = React.forwardRef(paperWithButton);

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
              {selected.map((id: Label['id']) => {
                const label = labelMap.get(id);
                return label ? <Chip key={id} label={label.name} /> : <></>;
              })}
            </Box>
          )}
          MenuProps={{
            /**
             * 追加ボタンを押したときに空のラベルが選択される不具合の対応
             *
             * 現状のMUIの機能では簡潔にこの問題を解決することができない
             * https://github.com/mui/material-ui/issues/26356
             * ひとまずはここに書かれている回避策で対応する
             *
             * TODO: MUI側でこの問題が解決されたときに、このコードも修正する
             */
            PaperProps: {
              component: paperWithButtonRef,
              button: (
                <Button
                  variant="text"
                  color="primary"
                  onClick={handleAdd}
                  sx={{ marginBottom: '10px' }}
                >
                  <AddCircleIcon sx={{ marginRight: '0.5rem' }} />
                  新しいラベルを作成する
                </Button>
              ),
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
        </Select>
      </FormControl>
      {isDialogOpen && (
        <LabelEdit
          isOpen={isDialogOpen}
          labelId={null}
          onClose={handleDialogClose}
          onSubmit={handleDialogSubmit}
        />
      )}
    </>
  );
};
