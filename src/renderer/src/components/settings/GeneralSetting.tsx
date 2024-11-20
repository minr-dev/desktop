import rendererContainer from '@renderer/inversify.config';
import {
  TextField,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  FormControl,
  Grid,
  Paper,
  useTheme,
  FormLabel,
  RadioGroup,
  Radio,
  PaletteMode,
  Button,
  IconButton,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers';
import React, { useContext, useEffect } from 'react';
import { useForm, SubmitHandler, Controller, useWatch, useFieldArray } from 'react-hook-form';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { UserPreference } from '@shared/data/UserPreference';
import { TYPES } from '@renderer/types';
import { IUserPreferenceProxy } from '@renderer/services/IUserPreferenceProxy';
import AppContext from '@renderer/components/AppContext';
import { useUserPreference } from '@renderer/hooks/useUserPreference';
import { SettingFormBox } from './SettingFormBox';
import { AppError } from '@shared/errors/AppError';
import { useAppSnackbar } from '@renderer/hooks/useAppSnackbar';
import { getLogger } from '@renderer/utils/LoggerUtil';

const logger = getLogger('GeneralSetting');

export const GeneralSetting = (): JSX.Element => {
  logger.info('GeneralSetting');
  const theme = useTheme();
  const { userDetails, setThemeMode } = useContext(AppContext);
  const { userPreference, loading } = useUserPreference();

  const {
    control,
    handleSubmit,
    formState: { errors: formErrors },
    reset,
  } = useForm<UserPreference>();
  const {
    fields: breakTimes,
    append: appendField,
    remove: removeField,
  } = useFieldArray({
    name: 'dailyBreakTimeSlots',
    control: control,
  });
  const { enqueueAppSnackbar } = useAppSnackbar();

  useEffect(() => {
    if (userPreference) {
      reset(userPreference);
    }
  }, [reset, userPreference]);

  // 「予定を読み上げる」を監視
  const speakEvent = useWatch({
    control,
    name: `speakEvent`,
    defaultValue: userPreference?.speakEvent || false,
  });
  // 「時間を読み上げる」を監視
  const speakTimeSignal = useWatch({
    control,
    name: `speakTimeSignal`,
    defaultValue: userPreference?.speakTimeSignal || false,
  });

  // 保存ハンドラー
  const onSubmit: SubmitHandler<UserPreference> = async (data: UserPreference): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug('GeneralSetting onSubmit');
    if (!userDetails) {
      throw new AppError('userDetails is null');
    }
    if (Object.keys(formErrors).length === 0) {
      // エラーがない場合の処理
      if (logger.isDebugEnabled()) logger.debug('フォームデータの送信:', data);
      const userPreferenceProxy = rendererContainer.get<IUserPreferenceProxy>(
        TYPES.UserPreferenceProxy
      );
      const userPreference = await userPreferenceProxy.getOrCreate(userDetails.userId);
      const updateData = { ...userPreference, ...data };
      updateData.startHourLocal = Number(updateData.startHourLocal);
      updateData.dailyWorkHours = Number(updateData.dailyWorkHours);
      updateData.speakEvent = Boolean(updateData.speakEvent);
      updateData.speakEventTimeOffset = Number(updateData.speakEventTimeOffset);
      updateData.speakTimeSignal = Boolean(updateData.speakTimeSignal);
      updateData.timeSignalInterval = Number(updateData.timeSignalInterval);
      updateData.muteWhileInMeeting = Boolean(updateData.muteWhileInMeeting);
      await userPreferenceProxy.save(updateData);
      setThemeMode(updateData.theme as PaletteMode);

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

  // カレンダーの追加ハンドラー
  const handleBreakTimeAdd = React.useCallback((): void => {
    appendField({
      start: new Date('1970-01-01T12:00:00+0900'),
      end: new Date('1970-01-01T13:00:00+0900'),
    });
  }, [appendField]);

  // カレンダーの削除ハンドラー
  const handleBreakTimeDelete = (index: number) => () => {
    removeField(index);
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
                      name="theme"
                      control={control}
                      defaultValue={userPreference?.theme || theme.palette.mode}
                      rules={{ required: true }}
                      render={({ field }): React.ReactElement => (
                        <FormControl component="fieldset">
                          <FormLabel component="legend">テーマ</FormLabel>
                          <RadioGroup {...field}>
                            <FormControlLabel value="dark" control={<Radio />} label="Dark" />
                            <FormControlLabel value="light" control={<Radio />} label="Light" />
                          </RadioGroup>
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper variant="outlined">
                <Grid container spacing={2} padding={2}>
                  <Grid item>
                    <Controller
                      name="startHourLocal"
                      control={control}
                      defaultValue={userPreference?.startHourLocal}
                      rules={{
                        required: '入力してください。',
                        min: { value: 0, message: '0以上の値を入力してください。' },
                        max: { value: 23, message: '23以下の値を入力してください。' },
                      }}
                      render={({ field, fieldState: { error } }): React.ReactElement => (
                        <>
                          <FormLabel component="legend">1日の開始時間</FormLabel>
                          <TextField
                            {...field}
                            type="number"
                            error={!!error}
                            helperText={error?.message}
                            variant="outlined"
                            InputProps={{
                              inputProps: {
                                min: 0,
                                max: 23,
                              },
                            }}
                          />
                          <FormHelperText>0～23の値を入力してください。</FormHelperText>
                        </>
                      )}
                    ></Controller>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ padding: 2 }}>
                <Grid container spacing={2} padding={2}>
                  <Grid item xs={5.5}>
                    <Controller
                      name="dailyWorkStartTime"
                      control={control}
                      defaultValue={userPreference?.dailyWorkStartTime}
                      rules={{
                        required: '入力してください',
                      }}
                      render={({ field: { onChange, value } }): React.ReactElement => (
                        <>
                          <FormLabel component="legend">作業開始時刻</FormLabel>
                          <TimePicker
                            value={value}
                            onChange={onChange}
                            ampm={false}
                            format="HH:mm"
                          />
                        </>
                      )}
                    />
                  </Grid>
                  <Grid item xs={5.5}>
                    <Controller
                      name="dailyWorkHours"
                      control={control}
                      defaultValue={userPreference?.dailyWorkHours}
                      rules={{
                        required: '入力してください',
                      }}
                      render={({ field, fieldState: { error } }): React.ReactElement => (
                        <>
                          <FormLabel component="legend">1日の作業時間</FormLabel>
                          <TextField
                            {...field}
                            type="number"
                            error={!!error}
                            helperText={error?.message}
                            variant="outlined"
                            InputProps={{
                              inputProps: {
                                min: 0,
                                max: 23,
                              },
                            }}
                          />
                        </>
                      )}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Grid container padding={2}>
                    <Grid item xs={12}>
                      <FormLabel>休憩時間</FormLabel>
                    </Grid>
                    <Grid item xs={12}>
                      {breakTimes.map((breakTime, index) => (
                        <Paper variant="outlined" style={{ marginTop: '1ch' }} key={breakTime.id}>
                          <Grid item xs={12}>
                            <Grid container spacing={2} padding={2}>
                              <Grid item xs={5.5}>
                                <Controller
                                  name={`dailyBreakTimeSlots.${index}.start`}
                                  control={control}
                                  defaultValue={userPreference?.dailyBreakTimeSlots[index]?.start}
                                  render={({ field: { onChange, value } }): React.ReactElement => (
                                    <TimePicker
                                      label="休憩開始時刻"
                                      value={value}
                                      onChange={onChange}
                                      ampm={false}
                                      format="HH:mm"
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid item xs={5.5}>
                                <Controller
                                  name={`dailyBreakTimeSlots.${index}.end`}
                                  control={control}
                                  defaultValue={userPreference?.dailyBreakTimeSlots[index]?.end}
                                  render={({ field: { onChange, value } }): React.ReactElement => (
                                    <TimePicker
                                      label="休憩終了時刻"
                                      value={value}
                                      onChange={onChange}
                                      ampm={false}
                                      format="HH:mm"
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid
                                item
                                xs={1}
                                md={1}
                                container
                                justifyContent="flex-end"
                                alignItems="flex-start"
                              >
                                <IconButton
                                  onClick={handleBreakTimeDelete(index)}
                                  aria-label="delete"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Paper>
                      ))}
                    </Grid>
                  </Grid>
                  <Button
                    variant={'contained'}
                    sx={{
                      marginTop: '1rem',
                      whiteSpace: 'nowrap',
                    }}
                    onClick={handleBreakTimeAdd}
                    color="primary"
                  >
                    <AddCircleIcon />
                    追加
                  </Button>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper variant="outlined">
                <Grid container spacing={2} padding={2}>
                  <Grid item xs={12}>
                    <Controller
                      name={`speakEvent`}
                      control={control}
                      defaultValue={false}
                      rules={{ required: false }}
                      render={({ field }): React.ReactElement => (
                        <FormControlLabel
                          control={<Checkbox {...field} checked={field.value} />}
                          label={`予定を読み上げる`}
                        />
                      )}
                    />
                  </Grid>
                  {speakEvent && (
                    <>
                      <Grid item>
                        <Controller
                          name={`speakEventTimeOffset`}
                          control={control}
                          defaultValue={userPreference?.speakEventTimeOffset}
                          rules={{
                            required: '入力してください。',
                          }}
                          render={({ field, fieldState: { error } }): React.ReactElement => (
                            <>
                              <TextField
                                label="読み上げ時間差（秒）"
                                {...field}
                                type="number"
                                error={!!error}
                                helperText={error?.message}
                                variant="outlined"
                              />
                              <FormHelperText>{`${field.value} 秒前に読み上げ開始する時間`}</FormHelperText>
                            </>
                          )}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Controller
                          name={`speakEventTextTemplate`}
                          control={control}
                          defaultValue={userPreference?.speakEventTextTemplate}
                          rules={{
                            required: '入力してください。',
                          }}
                          render={({ field, fieldState: { error } }): React.ReactElement => (
                            <>
                              <TextField
                                label="読み上げフォーマット"
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
                    </>
                  )}
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper variant="outlined">
                <Grid container spacing={2} padding={2}>
                  <Grid item xs={12}>
                    <Controller
                      name={`speakTimeSignal`}
                      control={control}
                      defaultValue={false}
                      rules={{ required: false }}
                      render={({ field }): React.ReactElement => (
                        <FormControlLabel
                          control={<Checkbox {...field} checked={field.value} />}
                          label={`時間を読み上げる`}
                        />
                      )}
                    />
                  </Grid>
                  {speakTimeSignal && (
                    <>
                      <Grid item>
                        <Controller
                          name={`timeSignalInterval`}
                          control={control}
                          defaultValue={userPreference?.timeSignalInterval}
                          rules={{
                            required: '入力してください。',
                            min: { value: 0, message: '0以上の値を入力してください。' },
                            max: { value: 59, message: '59以下の値を入力してください。' },
                          }}
                          render={({ field, fieldState: { error } }): React.ReactElement => (
                            <>
                              <TextField
                                label="読み上げ間隔（分）"
                                {...field}
                                type="number"
                                error={!!error}
                                helperText={error?.message}
                                variant="outlined"
                              />
                              <FormHelperText>0～59の値を入力してください。</FormHelperText>
                            </>
                          )}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Controller
                          name={`timeSignalTextTemplate`}
                          control={control}
                          defaultValue={userPreference?.timeSignalTextTemplate}
                          rules={{
                            required: '入力してください。',
                          }}
                          render={({ field, fieldState: { error } }): React.ReactElement => (
                            <>
                              <TextField
                                label="読み上げフォーマット"
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
                    </>
                  )}
                </Grid>
              </Paper>
            </Grid>
            {/* {(speakEvent || speakTimeSignal) && (
              <Grid item xs={12}>
                <Paper variant="outlined">
                  <Grid container spacing={2} padding={2}>
                    <Grid item>
                      <Controller
                        name={`muteWhileInMeeting`}
                        control={control}
                        defaultValue={false}
                        rules={{ required: false }}
                        render={({ field }): React.ReactElement => (
                          <>
                            <FormControlLabel
                              control={<Checkbox {...field} checked={field.value} />}
                              label={`会議中はミュートする`}
                            />
                            <FormHelperText>{`アクティブなWindowタイトルが Zoom と Meet の場合にミュート`}</FormHelperText>
                          </>
                        )}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )} */}
          </Grid>
        </Paper>
      </SettingFormBox>
    </>
  );
};
