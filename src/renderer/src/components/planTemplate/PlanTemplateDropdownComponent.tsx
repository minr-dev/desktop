import React, { useEffect, useState } from 'react';
import { TextField, MenuItem, Box, Button } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { usePlanTemplateMap } from '@renderer/hooks/usePlanTemplateMap';
import { PlanTemplateEdit } from './PlanTemplateEdit';
import { PlanTemplate } from '@shared/data/PlanTemplate';
import { getLogger } from '@renderer/utils/LoggerUtil';
import { PlanTemplateEvent } from '@shared/data/PlanTemplateEvent';
import { FieldError } from 'react-hook-form';

/**
 * PlanTemplateDropdownComponentのプロパティを定義するインターフェース。
 *
 * @property {Function} onChange - 予定テンプレートが選択されたときに呼び出される関数。
 * @property {string | null} [value] - 初期値または外部から制御される値。オプショナル。
 * @property {boolean} [isDisabled] - 予定テンプレートを固定値にするか判定する値。
 */
interface PlanTemplateDropdownComponentProps {
  onChange: (value: string) => void;
  value?: string | null;
  error?: FieldError;
}

const logger = getLogger('PlanTemplateDropdownComponent');

/**
 * 予定テンプレート選択用のドロップダウンコンポーネント。
 *
 * 予定テンプレートの一覧を取得して、プルダウンに表示する。
 * 既存の登録の中に選択できる予定テンプレートがないときのために、新規作成のボタンも表示する。
 *
 * このコンポーネントは予定テンプレートの選択と新規予定テンプレート追加のトリガーが含まれている。
 * しかし、新規予定テンプレートの追加設定用のダイアログはこのコンポーネントに含まれていないため、
 * 親コンポーネントの方で、 PlanTemplateEdit を表示制御するようにする。
 * また、このコンポーネントは、内部的に usePlanTemplateMap によって、予定テンプレート一覧を取得しているので、
 * 新規の追加があった場合には、 refresh を呼び出して、プルダウンを更新する必要があるが、
 * 追加設定用のダイアログが親コンポーネントにあるので、親コンポーネントの方でも、
 * usePlanTemplateMap を import して refresh を呼び出す必要がある。
 * 詳しくは、 EventEntryForm を参照。
 *
 * @param {PlanTemplateDropdownComponentProps} props - コンポーネントのプロパティ。
 * @returns {JSX.Element} レンダリング結果。
 */
export const PlanTemplateDropdownComponent = ({
  onChange,
  value,
  error,
}: PlanTemplateDropdownComponentProps): JSX.Element => {
  const { planTemplateMap, isLoading, refresh } = usePlanTemplateMap();
  const [selectedValue, setSelectedValue] = useState<string | undefined | null>(value || '');
  const [isDialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setSelectedValue(value || '');
    onChange(value || '');
  }, [value, onChange]);

  // ドロップダウンの値が選択変更されたイベント
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSelectedValue(e.target.value);
    onChange(e.target.value);
    if (logger.isDebugEnabled())
      logger.debug('PlanTemplateDropdownComponent handleChange called with:', e.target.value);
  };

  // 新規テンプレートを作成するボタンのクリックイベント
  const handleAdd = (): void => {
    if (logger.isDebugEnabled()) logger.debug('handleAdd');
    setDialogOpen(true);
  };

  const handleDialogClose = (): void => {
    if (logger.isDebugEnabled()) logger.debug('handleDialogClose');
    setDialogOpen(false);
  };

  const handleDialogSubmit = async (
    project: PlanTemplate,
    events: PlanTemplateEvent[]
  ): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug('handleDialogSubmit', project, events);
    await refresh();
    setSelectedValue(project.id);
    onChange(project.id);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const sorted = Array.from(planTemplateMap.values()).sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  return (
    <>
      <TextField
        select
        label="予定テンプレート"
        value={selectedValue}
        onChange={handleChange}
        variant="outlined"
        fullWidth
        error={!!error}
        helperText={error?.message}
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
          <em>予定テンプレートなし</em>
        </MenuItem>
        {sorted.map((project) => (
          <MenuItem key={project.id} value={project.id}>
            {project.name}
          </MenuItem>
        ))}
        <Box borderTop={1}>
          <Button variant="text" color="primary" onClick={handleAdd}>
            <AddCircleIcon sx={{ marginRight: '0.5rem' }} />
            新しいテンプレートを作成する
          </Button>
        </Box>
      </TextField>
      {isDialogOpen && (
        <PlanTemplateEdit
          isOpen={isDialogOpen}
          templateId={null}
          onClose={handleDialogClose}
          onSubmit={handleDialogSubmit}
        />
      )}
    </>
  );
};
