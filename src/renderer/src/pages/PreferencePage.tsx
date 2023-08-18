import rendererContainer from '../inversify.config';
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
import React from 'react';
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
import { UserPreference } from '@shared/dto/UserPreference';
import { useSnackbar } from 'notistack';
import { TYPES } from '@renderer/types';
import { IUserPreferenceProxy } from '@renderer/services/IUserPreferenceProxy';
import { ICalendarProxy } from '@renderer/services/ICalendarProxy';
import UserContext from '@renderer/components/UserContext';
import { useUserPreference } from '@renderer/hooks/useUserPreference';
import { EVENT_TYPE } from '@shared/dto/EventEntry';

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
                name={`calendars.${index}.eventType`}
                control={control}
                defaultValue={EVENT_TYPE[field.value as keyof typeof EVENT_TYPE]}
                rules={{ required: '入力してください' }}
                render={({ field, fieldState: { error } }): React.ReactElement => (
                  <>
                    <Select
                      {...field}
                      labelId={`calendars.${index}.type-label`}
                      onChange={(e): void => {
                        field.onChange(e.target.value as EVENT_TYPE);
                      }}
                    >
                      <MenuItem value={EVENT_TYPE.SHARED}>共有</MenuItem>
                      <MenuItem value={EVENT_TYPE.PLAN}>予定</MenuItem>
                      <MenuItem value={EVENT_TYPE.ACTUAL}>実績</MenuItem>
                    </Select>
                    {error && <FormHelperText error>{error.message}</FormHelperText>}
                  </>
                )}
              />
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
    </React.Fragment>
  );
};

const PreferencePage = (): JSX.Element => {
  console.log('PreferencePage');
  const { userDetails } = React.useContext(UserContext);
  const { userPreference, loading } = useUserPreference();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors: formErrors },
    reset,
  } = useForm<UserPreference>();
  React.useEffect(() => {
    if (userPreference) {
      reset(userPreference);
    }
  }, [reset, userPreference]);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

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

  // 「読み上げる」を監視
  const speakEvent = useWatch({
    control,
    name: `speakEvent`,
    defaultValue: userPreference?.speakEvent || false,
  });
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

  // 保存中フラグ
  const [saving, setSaving] = React.useState(false);

  // 保存ハンドラー
  const onSubmit: SubmitHandler<UserPreference> = async (data: UserPreference): Promise<void> => {
    if (!userDetails) {
      return;
    }
    try {
      setSaving(true);
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
        await userPreferenceProxy.save(updateData);

        enqueueSnackbar('保存しました。', { variant: 'info' });
        navigate('/');
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
    navigate('/');
  };

  // データがまだ読み込まれていない場合はローディングスピナーを表示
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <p>Preferences</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Paper variant="outlined">
          <Grid container spacing={2} padding={2}>
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
                          label={`読み上げる`}
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
                      <IconButton onClick={handleCalendarAdd} color="primary" aria-label="add">
                        <AddIcon />
                      </IconButton>
                    )}
                  </Grid>
                </Grid>
              </Paper>
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
              {Object.entries(formErrors).length > 0 && (
                <Alert severity="error">入力エラーを修正してください</Alert>
              )}
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
