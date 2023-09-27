import rendererContainer from '@renderer/inversify.config';
import {
  FormControlLabel,
  Checkbox,
  FormHelperText,
  Grid,
  Paper,
  Alert,
  Button,
  PaletteMode,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import React from 'react';
import { useForm, SubmitHandler, Controller, useFieldArray, useWatch } from 'react-hook-form';
import { useGoogleAuth } from '@renderer/hooks/useGoogleAuth';
import { UserPreference } from '@shared/data/UserPreference';
import { TYPES } from '@renderer/types';
import { IUserPreferenceProxy } from '@renderer/services/IUserPreferenceProxy';
import { ICalendarProxy } from '@renderer/services/ICalendarProxy';
import AppContext from '@renderer/components/AppContext';
import { useUserPreference } from '@renderer/hooks/useUserPreference';
import { SettingFormBox } from './SettingFormBox';
import { CalendarItem } from './CalendarItem';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { AppError } from '@shared/errors/AppError';
import { useAppSnackbar } from '@renderer/hooks/useAppSnackbar';

export const GoogleCalendarSetting = (): JSX.Element => {
  console.log('GoogleCalendarSetting');
  const { userDetails, setThemeMode } = React.useContext(AppContext);
  const { userPreference, loading } = useUserPreference();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors: formErrors },
    reset,
  } = useForm<UserPreference>();
  const { enqueueAppSnackbar } = useAppSnackbar();

  React.useEffect(() => {
    if (userPreference) {
      reset(userPreference);
    }
  }, [reset, userPreference]);

  // calendars を 配列 Field にする
  const {
    fields: calendarFields,
    append: appendField,
    remove: removeField,
  } = useFieldArray({
    control,
    name: 'calendars',
    keyName: 'id',
  });

  // カレンダーの追加ハンドラー
  const handleCalendarAdd = React.useCallback((): void => {
    appendField({
      calendarId: '',
      eventType: EVENT_TYPE.SHARED,
    });
  }, [appendField]);

  // カレンダーの削除ハンドラー
  const handleCalendarDelete = (index: number) => () => {
    removeField(index);
  };
  // 「Googleカレンダーと同期する」を監視
  const syncGoogleCalendar = useWatch({
    control,
    name: 'syncGoogleCalendar',
    defaultValue: userPreference?.syncGoogleCalendar || false,
  });
  // 「Googleカレンダーと同期する」がチェックされていて、
  // カレンダーがまだ追加されていない場合は、デフォルト値を追加する
  React.useEffect(() => {
    if (syncGoogleCalendar && calendarFields.length === 0) {
      handleCalendarAdd();
    }
  }, [syncGoogleCalendar, calendarFields.length, handleCalendarAdd]);

  // Google 認証の hook
  const { isAuthenticated, authError, handleAuth, handleRevoke } = useGoogleAuth();

  // エラーメッセージ
  const [alertMessage, setAlertMessage] = React.useState('');

  // 保存ハンドラー
  const onSubmit: SubmitHandler<UserPreference> = async (data: UserPreference): Promise<void> => {
    if (!userDetails) {
      throw new AppError('userDetails is null');
    }
    // Google Calendar同期が有効なら認証チェックが必要
    if (data.syncGoogleCalendar && !isAuthenticated) {
      setAlertMessage('Google認証が完了していません。');
      return;
    }
    // カレンダーが少なくとも1つ以上登録されていることを確認
    if (data.syncGoogleCalendar) {
      if (data.calendars.length === 0) {
        setAlertMessage('少なくとも1つ以上のカレンダーを登録してください。');
        return;
      }
      // カレンダーIDが重複していないことを確認し、カレンダーIDの存在チェックを行う
      const calendarIds = new Set<string>();
      const calendarProxy = rendererContainer.get<ICalendarProxy>(TYPES.GoogleCalendarProxy);
      for (const [i, calendar] of data.calendars.entries()) {
        if (calendarIds.has(calendar.calendarId)) {
          setError(`calendars.${i}.calendarId`, {
            type: 'manual',
            message: 'カレンダーIDが重複しています。',
          });
          return;
        }
        calendarIds.add(calendar.calendarId);
        const cal = await calendarProxy.get(calendar.calendarId);
        if (!cal) {
          setError(`calendars.${i}.calendarId`, {
            type: 'manual',
            message: 'カレンダーIDが存在しません。',
          });
          return;
        }
      }
    }
    if (Object.keys(formErrors).length === 0) {
      // エラーがない場合の処理
      console.log('フォームデータの送信:', data);
      const userPreferenceProxy = rendererContainer.get<IUserPreferenceProxy>(
        TYPES.UserPreferenceProxy
      );
      const userPreference = await userPreferenceProxy.getOrCreate(userDetails.userId);
      const updateData = { ...userPreference, ...data };
      updateData.syncGoogleCalendar = Boolean(updateData.syncGoogleCalendar);
      await userPreferenceProxy.save(updateData);
      setThemeMode(updateData.theme as PaletteMode);

      enqueueAppSnackbar('保存しました。', { variant: 'info' });
    }
  };

  // キャンセルハンドラー
  // キャンセル時はフォームをリセット
  const onCancel = (): void => {
    if (!userPreference) {
      throw new AppError('userPreference is null');
    }
    reset(userPreference);
  };

  // データがまだ読み込まれていない場合はローディングスピナーを表示
  if (loading || !userDetails) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <SettingFormBox
        onSubmit={handleSubmit(onSubmit)}
        onCancel={onCancel}
        errors={formErrors}
        alertMessage={alertMessage}
      >
        <Paper variant="outlined">
          <Grid container spacing={2} padding={2}>
            <Grid item xs={12}>
              <Paper variant="outlined">
                <Grid container spacing={2} padding={2}>
                  <Grid item xs={12}>
                    <Controller
                      name="syncGoogleCalendar"
                      defaultValue={false}
                      control={control}
                      rules={{ required: false }}
                      render={({ field, fieldState: { error } }): React.ReactElement => (
                        <>
                          <FormControlLabel
                            {...field}
                            label="Google Calendar と同期する"
                            control={<Checkbox checked={field.value} />}
                            onChange={(
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                              _event: React.SyntheticEvent<Element, Event>,
                              checked: boolean
                            ): void => {
                              // handle the change event here
                              field.onChange(checked); // Update the value of 'syncGoogleCalendar' field
                            }}
                          />
                          <FormHelperText error={!!error?.message}>{error?.message}</FormHelperText>
                        </>
                      )}
                    />
                    {syncGoogleCalendar && (
                      <>
                        {!isAuthenticated && (
                          <>
                            <Button
                              variant="contained"
                              color="primary"
                              disabled={isAuthenticated === null}
                              onClick={handleAuth}
                            >
                              Google認証
                            </Button>
                            {/* 認証エラー */}
                            {authError && <Alert severity="error">{authError}</Alert>}
                          </>
                        )}
                        {isAuthenticated && (
                          <Button
                            variant="outlined"
                            color="secondary"
                            style={{ marginLeft: '1ch' }}
                            onClick={handleRevoke}
                          >
                            認証解除
                          </Button>
                        )}
                      </>
                    )}
                    {syncGoogleCalendar &&
                      calendarFields.map((field, index) => (
                        <CalendarItem
                          key={field.id}
                          index={index}
                          control={control}
                          onDelete={handleCalendarDelete(index)}
                        />
                      ))}
                    {syncGoogleCalendar && (
                      <Button
                        variant={'contained'}
                        sx={{
                          marginTop: '1rem',
                          whiteSpace: 'nowrap',
                        }}
                        onClick={handleCalendarAdd}
                        color="primary"
                      >
                        <AddCircleIcon />
                        追加
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </SettingFormBox>
    </>
  );
};
