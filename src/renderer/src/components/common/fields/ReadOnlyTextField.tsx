import { InputAdornment, TextField, useTheme } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

interface ReadOnlyTextFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
  label: string;
  variant?: 'standard' | 'filled' | 'outlined';
  helperText?: string;
  fullWidth?: boolean;
  error?: boolean;
  margin?: 'none' | 'dense' | 'normal';
}

export const ReadOnlyTextField = ({
  field,
  label,
  variant,
  helperText,
  fullWidth,
  error,
  margin,
}: ReadOnlyTextFieldProps): JSX.Element => {
  const theme = useTheme();

  return (
    <TextField
      {...field}
      label={label}
      value={field.value ?? ''}
      variant={variant !== undefined ? variant : 'outlined'}
      error={!!error}
      helperText={helperText}
      fullWidth={fullWidth !== undefined ? fullWidth : true}
      margin={margin !== undefined ? margin : 'normal'}
      InputProps={{
        readOnly: true,
        endAdornment: (
          <InputAdornment position="end">
            <LockIcon />
          </InputAdornment>
        ),
        style: {
          backgroundColor: theme.palette.action.disabledBackground,
          color: theme.palette.text.disabled,
          opacity: 0.6,
        },
      }}
    />
  );
};
