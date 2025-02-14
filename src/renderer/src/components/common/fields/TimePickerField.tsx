import { TimePicker } from '@mui/x-date-pickers';
import { Time } from '@shared/data/Time';
import { set } from 'date-fns';

interface TimePickerFieldProps {
  label?: string;
  value: Time;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (...event: any[]) => void;
  ampm?: boolean;
  format?: string;
}

/**
 * `TimePicker`のラッパー。`TimePicker`が`Date`型を扱う設定なので、`Time`型で保存されるようにしたコンポーネント。
 */
export const TimePickerField = ({
  label,
  value,
  onChange,
  ampm,
  format,
}: TimePickerFieldProps): JSX.Element => {
  const timeToDate = (time: Time): Date => {
    return set(new Date('1970-01-01T00:00:00'), time);
  };
  const DateToTime = (date: Date): Time => {
    return { hours: date.getHours(), minutes: date.getMinutes() };
  };
  return (
    <TimePicker
      label={label}
      value={timeToDate(value)}
      onChange={(value): void => {
        if (value) {
          onChange(DateToTime(value));
        }
      }}
      ampm={ampm ?? false}
      format={format ?? 'HH:mm'}
    />
  );
};
