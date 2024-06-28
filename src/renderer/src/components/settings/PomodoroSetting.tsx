import rendererContainer from '@renderer/inversify.config';
import {
  TextField,
  Grid,
  Paper,
  FormLabel,
  FormHelperText,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import React, { useContext, useEffect } from 'react';
import { useForm, SubmitHandler, Controller, useWatch } from 'react-hook-form';
import { UserPreference } from '@shared/data/UserPreference';
import { TYPES } from '@renderer/types';
import { IUserPreferenceProxy } from '@renderer/services/IUserPreferenceProxy';
import AppContext from '@renderer/components/AppContext';
import { useUserPreference } from '@renderer/hooks/useUserPreference';
import { SettingFormBox } from './SettingFormBox';
import { AppError } from '@shared/errors/AppError';
import { useAppSnackbar } from '@renderer/hooks/useAppSnackbar';

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

  const notifyAtPomodoroCompleteSignal = useWatch({
    control,
    name: `notifyAtPomodoroComplete`,
    defaultValue: userPreference?.notifyAtPomodoroComplete,
  });

  const notifyBeforePomodoroCompleteSignal = useWatch({
    control,
    name: `notifyBeforePomodoroComplete`,
    defaultValue: userPreference?.notifyBeforePomodoroComplete,
  });

  const requestPermission = async (_event, checked: boolean): Promise<boolean> => {
    if (!checked || Notification.permission == 'granted') {
      return true;
    }
    const permission = await Notification.requestPermission();
    return permission == 'granted';
  };

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
            {'Notification' in window && (
              <Grid item xs={12}>
                <Paper variant="outlined">
                  <Grid container spacing={2} padding={2}>
                    <Grid item xs={6}>
                      <Controller
                        name={`notifyAtPomodoroComplete.announce`}
                        control={control}
                        defaultValue={false}
                        rules={{ required: false }}
                        render={({ field }): React.ReactElement => (
                          <FormControlLabel
                            control={<Checkbox {...field} checked={field.value} />}
                            label={`音声で読み上げる`}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Controller
                        name={`notifyAtPomodoroComplete.sendNotification`}
                        control={control}
                        defaultValue={false}
                        rules={{ required: false }}
                        render={({ field }): React.ReactElement => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                {...field}
                                onChange={async (e, checked: boolean): Promise<void> => {
                                  if (await requestPermission(e, checked)) {
                                    field.onChange(checked);
                                  }
                                }}
                                checked={field.value}
                              />
                            }
                            label={`通知を送る`}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item>
                      <TextField
                        label="通知タイミング（分前）"
                        defaultValue={0}
                        type="number"
                        variant="outlined"
                        disabled
                      />
                      {/* <FormHelperText>0以上の値を入力してください。</FormHelperText> */}
                    </Grid>
                    {(notifyAtPomodoroCompleteSignal?.announce ||
                      notifyAtPomodoroCompleteSignal?.sendNotification) && (
                      <Grid item xs={12}>
                        <Controller
                          name={`notifyAtPomodoroComplete.template`}
                          control={control}
                          defaultValue={userPreference?.notifyAtPomodoroComplete?.template}
                          rules={{
                            required: '入力してください。',
                          }}
                          render={({ field, fieldState: { error } }): React.ReactElement => (
                            <>
                              <TextField
                                label="メッセージ"
                                {...field}
                                variant="outlined"
                                error={!!error}
                                helperText={error?.message}
                                fullWidth
                              />
                            </>
                          )}
                        />
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>
            )}
            {'Notification' in window && (
              <Grid item xs={12}>
                <Paper variant="outlined">
                  <Grid container spacing={2} padding={2}>
                    <Grid item xs={6}>
                      <Controller
                        name={`notifyBeforePomodoroComplete.announce`}
                        control={control}
                        defaultValue={false}
                        rules={{ required: false }}
                        render={({ field }): React.ReactElement => (
                          <FormControlLabel
                            control={<Checkbox {...field} checked={field.value} />}
                            label={`音声で読み上げる`}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Controller
                        name={`notifyBeforePomodoroComplete.sendNotification`}
                        control={control}
                        defaultValue={false}
                        rules={{ required: false }}
                        render={({ field }): React.ReactElement => (
                          <FormControlLabel
                            control={<Checkbox {...field} checked={field.value} />}
                            label={`通知を送る`}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item>
                      <Controller
                        name={`notifyBeforePomodoroCompleteTimeOffset`}
                        control={control}
                        defaultValue={userPreference?.notifyBeforePomodoroCompleteTimeOffset}
                        rules={{
                          required: '入力してください。',
                          min: { value: 0, message: '0以上の値を入力してください。' },
                        }}
                        render={({ field, fieldState: { error } }): React.ReactElement => (
                          <>
                            <TextField
                              label="通知タイミング(分前)"
                              {...field}
                              type="number"
                              error={!!error}
                              helperText={error?.message}
                              variant="outlined"
                            />
                            <FormHelperText>0以上の値を入力してください。</FormHelperText>
                          </>
                        )}
                      />
                    </Grid>
                    {(notifyBeforePomodoroCompleteSignal?.announce ||
                      notifyBeforePomodoroCompleteSignal?.sendNotification) && (
                      <Grid item xs={12}>
                        <Controller
                          name={`notifyBeforePomodoroComplete.template`}
                          control={control}
                          defaultValue={userPreference?.notifyBeforePomodoroComplete?.template}
                          rules={{
                            required: '入力してください。',
                          }}
                          render={({ field, fieldState: { error } }): React.ReactElement => (
                            <>
                              <TextField
                                label="メッセージ"
                                {...field}
                                variant="outlined"
                                error={!!error}
                                helperText={error?.message}
                                fullWidth
                              />
                            </>
                          )}
                        />
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Paper>
      </SettingFormBox>
    </>
  );
};
