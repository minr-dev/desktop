import {
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Grid,
  Paper,
  TextField,
  TextFieldProps,
} from '@mui/material';
import { Control, Controller, FieldPath, FieldValues, useWatch } from 'react-hook-form';

// nameがcontrolに対応するオブジェクトのフィールド名になるような型指定(Controllerの定義を参考にした)
// nameにNotificationSettings型以外のフィールド名を指定できてしまうが、複雑になりすぎるので断念した
interface NotificationSettingsFormControlProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> {
  // 通知設定のフィールド名
  name: TName;
  min: number;
  control: Control<TFieldValues>;
  notificationTimeOffsetHidden?: boolean;
  notificationTimeOffsetProps?: TextFieldProps;
  notificationTemplateProps?: TextFieldProps;
}

/**
 * 通知設定を行う、フォーム内のコンポーネント
 *
 * @param param0
 * @returns
 */
export const NotificationSettingsFormControl = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  name,
  min,
  control,
  notificationTimeOffsetHidden,
  notificationTimeOffsetProps,
  notificationTemplateProps,
}: NotificationSettingsFormControlProps<TFieldValues, TName>): JSX.Element => {
  const requestPermission = async (): Promise<boolean> => {
    if (Notification.permission === 'granted') {
      return true;
    }
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  const useVoiceNotification = useWatch({
    control,
    name: `${name}.useVoiceNotification` as TName,
  });

  const useDesktopNotification = useWatch({
    control,
    name: `${name}.useDesktopNotification` as TName,
  });

  const useNotification = useVoiceNotification || useDesktopNotification;

  const handleOnChangeUseDesktopNotification = (checked: boolean, onChange): void => {
    if (!checked) {
      onChange(checked);
    }
    requestPermission().then((granted) => {
      if (granted) {
        onChange(checked);
      }
    });
  };

  return (
    <Paper variant="outlined">
      <Grid container spacing={2} padding={2}>
        <Grid item xs={6}>
          <Controller
            name={`${name}.useVoiceNotification` as TName}
            control={control}
            rules={{ required: false }}
            render={({ field }): JSX.Element => (
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value ?? false} />}
                label={`音声で読み上げる`}
              />
            )}
          />
        </Grid>
        {'Notification' in window && (
          <Grid item xs={6}>
            <Controller
              name={`${name}.useDesktopNotification` as TName}
              control={control}
              rules={{ required: false }}
              render={({ field }): JSX.Element => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      onChange={(_event, checked): void =>
                        handleOnChangeUseDesktopNotification(checked, field.onChange)
                      }
                      checked={field.value ?? false}
                    />
                  }
                  label={`通知を送る`}
                />
              )}
            />
          </Grid>
        )}
        {!notificationTimeOffsetHidden && useNotification && (
          <Grid item xs={12}>
            <Controller
              name={`${name}.notificationTimeOffset` as TName}
              control={control}
              rules={{
                required: '入力してください。',
                min: { value: min, message: `${min}以上の値を入力してください。` },
              }}
              render={({ field, fieldState: { error } }): JSX.Element => (
                <>
                  <TextField
                    {...field}
                    value={field.value ?? min}
                    label="通知タイミング（分前）"
                    type="number"
                    variant="outlined"
                    InputProps={{
                      inputProps: {
                        min: min,
                      },
                    }}
                    error={!!error}
                    {...notificationTimeOffsetProps}
                  />
                  <FormHelperText>{min}以上の値を入力してください。</FormHelperText>
                </>
              )}
            />
          </Grid>
        )}
        {useNotification && (
          <Grid item xs={12}>
            <Controller
              name={`${name}.notificationTemplate` as TName}
              control={control}
              rules={{
                required: '入力してください。',
              }}
              render={({ field, fieldState: { error } }): JSX.Element => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  label="メッセージ"
                  variant="outlined"
                  error={!!error}
                  helperText={error?.message}
                  fullWidth
                  {...notificationTemplateProps}
                />
              )}
            />
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};
