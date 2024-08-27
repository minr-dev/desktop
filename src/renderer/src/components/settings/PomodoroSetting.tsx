import rendererContainer from '@renderer/inversify.config';
import { TextField, Grid, Paper, FormLabel } from '@mui/material';
import React, { useContext, useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { UserPreference } from '@shared/data/UserPreference';
import { TYPES } from '@renderer/types';
import { IUserPreferenceProxy } from '@renderer/services/IUserPreferenceProxy';
import AppContext from '@renderer/components/AppContext';
import { useUserPreference } from '@renderer/hooks/useUserPreference';
import { SettingFormBox } from './SettingFormBox';
import { AppError } from '@shared/errors/AppError';
import { useAppSnackbar } from '@renderer/hooks/useAppSnackbar';
import { NotificationSettingsFormControl } from '../common/form/NotificationSettingsFormControl';

export const PomodoroTimerSetting = (): JSX.Element => {
  console.log('PomodoroTimerSetting');
  const { userDetails } = useContext(AppContext);
  const { userPreference, loading } = useUserPreference();

  const {
    control,
    handleSubmit,
    formState: { errors: formErrors },
    reset,
  } = useForm<UserPreference>();
  const { enqueueAppSnackbar } = useAppSnackbar();

  useEffect(() => {
    if (userPreference) {
      reset(userPreference);
    }
  }, [reset, userPreference]);

  // 保存ハンドラー
  const onSubmit: SubmitHandler<UserPreference> = async (data: UserPreference): Promise<void> => {
    console.log('GeneralSetting onSubmit');
    if (!userDetails) {
      throw new AppError('userDetails is null');
    }
    if (Object.keys(formErrors).length === 0) {
      // エラーがない場合の処理
      console.log('フォームデータの送信:', data);
      const userPreferenceProxy = rendererContainer.get<IUserPreferenceProxy>(
        TYPES.UserPreferenceProxy
      );
      const userPreference = await userPreferenceProxy.getOrCreate(userDetails.userId);
      const updateData = { ...userPreference, ...data };
      updateData.workingMinutes = Number(updateData.workingMinutes);
      updateData.breakMinutes = Number(updateData.breakMinutes);
      console.log(updateData.workingMinutes);
      console.log(updateData.breakMinutes);
      await userPreferenceProxy.save(updateData);

      enqueueAppSnackbar('保存しました。', { variant: 'info' });
    }
  };

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
      <SettingFormBox onSubmit={handleSubmit(onSubmit)} onCancel={onCancel} errors={formErrors}>
        <Paper variant="outlined">
          <Grid container spacing={2} padding={2}>
            <Grid item xs={12}>
              <Paper variant="outlined">
                <Grid container spacing={2} padding={2}>
                  <Grid item>
                    <Controller
                      name="workingMinutes"
                      control={control}
                      defaultValue={userPreference?.workingMinutes}
                      rules={{
                        required: '入力してください。',
                        min: { value: 0, message: '0以上の値を入力してください。' },
                      }}
                      render={({ field, fieldState: { error } }): React.ReactElement => (
                        <>
                          <FormLabel component="legend">作業時間(分)</FormLabel>
                          <TextField
                            {...field}
                            type="number"
                            error={!!error}
                            helperText={error?.message}
                            variant="outlined"
                            InputProps={{
                              inputProps: {
                                min: 0,
                              },
                            }}
                          />
                        </>
                      )}
                    ></Controller>
                    <Controller
                      name="breakMinutes"
                      control={control}
                      defaultValue={userPreference?.breakMinutes}
                      rules={{
                        required: '入力してください。',
                        min: { value: 0, message: '0以上の値を入力してください。' },
                      }}
                      render={({ field, fieldState: { error } }): React.ReactElement => (
                        <>
                          <FormLabel component="legend">休憩時間(分)</FormLabel>
                          <TextField
                            {...field}
                            type="number"
                            error={!!error}
                            helperText={error?.message}
                            variant="outlined"
                            InputProps={{
                              inputProps: {
                                min: 0,
                              },
                            }}
                          />
                        </>
                      )}
                    ></Controller>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <FormLabel component="legend">セッション終了時の通知</FormLabel>
              <NotificationSettingsFormControl
                name={`notifyAtPomodoroComplete`}
                control={control}
                notificationTimeOffsetHidden
              />
            </Grid>
            <Grid item xs={12}>
              <FormLabel component="legend">セッション終了前の通知</FormLabel>
              <NotificationSettingsFormControl
                name={`notifyBeforePomodoroComplete`}
                control={control}
              />
            </Grid>
          </Grid>
        </Paper>
      </SettingFormBox>
    </>
  );
};
