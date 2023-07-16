import {
  TextField,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Grid,
  Typography,
  Paper,
  Alert,
  Button,
  Box,
  Stack,
  Backdrop,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import React, { useState } from 'react';
import {
  useForm,
  SubmitHandler,
  Controller,
  useFieldArray,
  useWatch,
  Control,
  useController,
} from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useGoogleAuth } from '@renderer/hooks/useGoogleAuth';
import { CalendarType } from '@shared/dto/CalendarType';
import { UserPreference } from '@shared/dto/UserPreference';
import { UserPreferenceProxyImpl } from '@renderer/services/UserPreferenceProxyImpl';
import { GoogleCalendarProxyImpl } from '@renderer/services/GoogleCalendarProxyImpl';
import { useSnackbar } from 'notistack';

interface CalendarItemProps {
  index: number;
  control: Control<UserPreference, unknown>;
  onDelete: () => void;
}

const CalendarItem = ({ index, control, onDelete }: CalendarItemProps): JSX.Element => {
  const { field } = useController({
    name: `calendars.${index}.calendarId`,
    control,
  });
  const announceValue = useWatch({
    control,
    name: `calendars.${index}.announce`,
    defaultValue: false,
  });

  return (
    // 必ず fields オブジェクトの id をコンポーネントの key に割り当てる
    <React.Fragment key={index}>
      <Paper variant="outlined" style={{ marginTop: '1ch' }}>
        <Grid container spacing={2} padding={2}>
          <Grid item xs={11} md={11}>
            <Typography variant="h6">{`カレンダー(${index + 1})`}</Typography>
          </Grid>
          <Grid item xs={1} md={1} container justifyContent="flex-end" alignItems="flex-start">
            <IconButton onClick={onDelete} aria-label="delete">
              <DeleteIcon />
            </IconButton>
          </Grid>
          <Grid item xs={0}>
            <Controller
              name={`calendars.${index}.calendarId`}
              control={control}
              defaultValue={field.value}
              rules={{
                required: '入力してください',
              }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }): React.ReactElement => (
                <>
                  <TextField
                    onChange={onChange}
                    value={value}
                    label="カレンダーID"
                    error={!!error}
                    helperText={error?.message}
                    variant="outlined"
                  />
                </>
              )}
            />
          </Grid>
          <Grid item xs={0}>
            <FormControl style={{ width: '14ch' }}>
              <InputLabel id={`calendars.${index}.type-label`}>カレンダータイプ</InputLabel>
              <Controller
                name={`calendars.${index}.type`}
                control={control}
                defaultValue={CalendarType[field.value as keyof typeof CalendarType]}
                rules={{ required: '入力してください' }}
                render={({ field, fieldState: { error } }): React.ReactElement => (
                  <>
                    <Select
                      {...field}
                      labelId={`calendars.${index}.type-label`}
                      onChange={(e): void => {
                        field.onChange(e.target.value as CalendarType);
                      }}
                    >
                      <MenuItem value={CalendarType.OTHER}>共有</MenuItem>
                      <MenuItem value={CalendarType.PLANNED}>予定</MenuItem>
                      <MenuItem value={CalendarType.ACTUAL}>実績</MenuItem>
                    </Select>
                    {error && <FormHelperText error>{error.message}</FormHelperText>}
                  </>
                )}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} mt={1} mb={1}>
            <Controller
              name={`calendars.${index}.announce`}
              control={control}
              defaultValue={false}
              rules={{ required: false }}
              render={({ field }): React.ReactElement => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value} />}
                  label={`読み上げる`}
                />
              )}
            />
          </Grid>
          {announceValue && (
            <>
              <Grid item xs={0}>
                <Controller
                  name={`calendars.${index}.announceTimeOffset`}
                  control={control}
                  defaultValue={Number(field.value)}
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
              <Grid item xs={0}>
                <Controller
                  name={`calendars.${index}.muteWhileInMeeting`}
                  control={control}
                  defaultValue={false}
                  rules={{ required: false }}
                  render={({ field }): React.ReactElement => (
                    <>
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} />}
                        label={`会議中はミュートする（まだ未実装）`}
                      />
                    </>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name={`calendars.${index}.announceTextTemplate`}
                  control={control}
                  defaultValue={field.value}
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
    </React.Fragment>
  );
};

const PreferencePage = (): JSX.Element => {
  console.log('PreferencePage');
  const {
    control,
    setValue,
    handleSubmit,
    setError,
    formState: { errors: formErrors },
  } = useForm<UserPreference>({
    defaultValues: {
      syncGoogleCalendar: undefined,
      calendars: [],
    },
  });
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // UserPreferenceデータの取得
  React.useEffect(() => {
    const fetchUserPreference = async (): Promise<void> => {
      try {
        const userPreferenceProxy = new UserPreferenceProxyImpl();
        const userPreference = await userPreferenceProxy.get();
        if (userPreference) {
          setValue('syncGoogleCalendar', userPreference.syncGoogleCalendar);
          setValue('calendars', userPreference.calendars);
        } else {
          setValue('syncGoogleCalendar', false);
        }
      } catch (error) {
        console.error('Failed to load user preference', error);
      }
    };
    fetchUserPreference();
  }, [setValue]);

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
      type: CalendarType.OTHER,
      announce: false,
      announceTimeOffset: 10,
      announceTextTemplate: '{TITLE} まで {READ_TIME_OFFSET} 前です',
      muteWhileInMeeting: false,
    });
  }, [appendField]);

  // カレンダーの削除ハンドラー
  const handleCalendarDelete = (index: number) => () => {
    removeField(index);
  };

  // 「Googleカレンダーと連動する」を監視
  const syncGoogleCalendar = useWatch({
    control,
    name: 'syncGoogleCalendar',
    defaultValue: false,
  });
  // 「Googleカレンダーと連動する」がチェックされていて、
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

  // 保存中フラグ
  const [saving, setSaving] = useState(false);

  // 保存ハンドラー
  const onSubmit: SubmitHandler<UserPreference> = async (data: UserPreference): Promise<void> => {
    try {
      setSaving(true);
      // Google Calendar連動が有効なら認証チェックが必要
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
        const calendarProxy = new GoogleCalendarProxyImpl();
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
        const userPreferenceProxy = new UserPreferenceProxyImpl();
        await userPreferenceProxy.save(data);

        enqueueSnackbar('保存しました。', { variant: 'info' });
        navigate('/home');
      } else {
        // エラーメッセージを表示するためのコードを追加
        const errorMessages = Object.entries(formErrors).map(
          ([fieldName, error]) => `${fieldName}: ${error.message}`
        );
        console.log(errorMessages.join('\n'));
        setAlertMessage(errorMessages.join('\n'));
      }
    } finally {
      setSaving(false);
    }
  };

  // キャンセルハンドラー
  // キャンセル時はフォームをリセット
  const onCancel: SubmitHandler<UserPreference> = (): void => {
    navigate('/home');
  };

  // データがまだ読み込まれていない場合はローディングスピナーを表示
  if (syncGoogleCalendar === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <p>Preferences</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Paper variant="outlined">
          <Grid container spacing={2} padding={2}>
            <Grid item xs={12} md={12}>
              <Controller
                name="syncGoogleCalendar"
                defaultValue={false}
                control={control}
                rules={{ required: false }}
                render={({ field, fieldState: { error } }): React.ReactElement => (
                  <>
                    <FormControlLabel
                      {...field}
                      label="Google Calendar と連動する"
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
                <IconButton onClick={handleCalendarAdd} color="primary" aria-label="add">
                  <AddIcon />
                </IconButton>
              )}
            </Grid>
          </Grid>
        </Paper>
      </form>
      <Box
        sx={{
          position: 'fixed',
          left: 0,
          bottom: 0,
          width: '100%',
          bgcolor: 'background.default',
          boxShadow: 1,
          p: 1,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Grid container>
          <Grid
            item
            xs={12}
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Stack>
              {alertMessage && <Alert severity="error">{alertMessage}</Alert>}
              {/* デバッグのときにエラーを表示する */}
              {process.env.NODE_ENV !== 'production' &&
                Object.entries(formErrors).map(([fieldName, error]) => (
                  <Alert key={fieldName} severity="error">
                    {fieldName}: {error.message}
                  </Alert>
                ))}
            </Stack>
          </Grid>
          <Grid
            item
            xs={12}
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Button variant="contained" color="primary" onClick={handleSubmit(onSubmit)}>
              保存
            </Button>
            <Button
              variant="contained"
              color="secondary"
              style={{
                marginLeft: '10px',
                marginRight: '30px',
              }}
              onClick={handleSubmit(onCancel)}
            >
              キャンセル
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={saving}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default PreferencePage;
