import { TextFieldProps } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers';
import { dateToTime, Time, timeToDummyDate } from '@shared/data/Time';

interface TimePickerFieldProps {
  label?: string;
  value: Time;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (...event: any[]) => void;
  ampm?: boolean;
  format?: string;
  slotProps?: { textField: TextFieldProps };
}

/**
 * `TimePicker`のラッパー。`TimePicker`が`Date`型を扱う設定なので、`Time`型で保存されるようにしたコンポーネント。
 */
export const TimePickerField = ({
  label,
  value,
  onChange,
  ampm = false,
  format = 'HH:mm',
  slotProps,
}: TimePickerFieldProps): JSX.Element => {
  return (
    <TimePicker
      label={label}
      value={timeToDummyDate(value)}
      onChange={(value): void => {
        if (value) {
          onChange(dateToTime(value));
        }
      }}
      ampm={ampm}
      format={format}
      slotProps={slotProps}
    />
  );
};
