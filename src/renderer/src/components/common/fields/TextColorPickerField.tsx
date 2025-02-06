import { Menu, TextField } from '@mui/material';
import { getLogger } from '@renderer/utils/LoggerUtil';
import { useState } from 'react';
import { ColorResult, SketchPicker } from 'react-color';

interface TextColorPickerFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
  label: string;
  variant?: 'standard' | 'filled' | 'outlined';
  helperText?: string;
  fullWidth?: boolean;
  error?: boolean;
  margin?: 'none' | 'dense' | 'normal';
  onChangeComplete: (color: string) => void;
}

const logger = getLogger('TextColorPickerField');

export const TextColorPickerField = ({
  field,
  label,
  variant,
  helperText,
  fullWidth,
  error,
  margin,
  onChangeComplete,
}: TextColorPickerFieldProps): JSX.Element => {
  logger.info('TextColorPickerField');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpenPicker = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePicker = (): void => {
    setAnchorEl(null);
  };

  const handleChangeComplete = (color: ColorResult): void => {
    onChangeComplete(color.hex);
  };

  return (
    <>
      <TextField
        {...field}
        label={label}
        variant={variant !== undefined ? variant : 'outlined'}
        onClick={handleOpenPicker}
        error={!!error}
        helperText={helperText}
        fullWidth={fullWidth !== undefined ? fullWidth : true}
        margin={margin !== undefined ? margin : 'normal'}
        InputLabelProps={{
          shrink: field.value !== undefined && field.value !== '',
        }}
      />
      <Menu
        id={`color-picker-menu-${field.id}`}
        anchorEl={anchorEl}
        keepMounted={false}
        open={Boolean(anchorEl)}
        onClose={handleClosePicker}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <SketchPicker
          color={field.value}
          onChange={handleChangeComplete}
          onChangeComplete={handleChangeComplete}
        />
      </Menu>
    </>
  );
};
