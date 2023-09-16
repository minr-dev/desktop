import { Menu, TextField } from '@mui/material';
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
  console.log('TextColorPickerField');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpenPicker = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePicker = (): void => {
    setAnchorEl(null);
  };

  const handleChangeComplete = (color: ColorResult): void => {
    setAnchorEl(null);
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
      />
      <Menu
        id={`color-picker-menu-${field.id}`}
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClosePicker}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <SketchPicker
          {...field}
          color={field.value}
          onChange={handleChangeComplete}
          onChangeComplete={handleChangeComplete}
        />
      </Menu>
    </>
  );
};
