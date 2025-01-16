import rendererContainer from '@renderer/inversify.config';
import { Grid, Paper, Alert, Button, FormLabel, TextField } from '@mui/material';
import { useGoogleAuth } from '@renderer/hooks/useGoogleAuth';
import { useGitHubAuth } from '@renderer/hooks/useGitHubAuth';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useContext, useEffect } from 'react';
import AppContext from '../AppContext';
import { useUserPreference } from '@renderer/hooks/useUserPreference';
import { UserPreference } from '@shared/data/UserPreference';
import { AppError } from '@shared/errors/AppError';
import { TYPES } from '@renderer/types';
import { IUserPreferenceProxy } from '@renderer/services/IUserPreferenceProxy';
import { SettingFormBox } from './SettingFormBox';
import { useAppSnackbar } from '@renderer/hooks/useAppSnackbar';
import { getLogger } from '@renderer/utils/LoggerUtil';

const logger = getLogger('AccountSetting');

export const AccountSetting = (): JSX.Element => {
  logger.info('AccountSetting');
  const { userDetails } = useContext(AppContext);
  const { userPreference, loading } = useUserPreference();

  const {
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

  // Google 認証の hook
  const {
    isAuthenticated: isGoogleAuthenticated,
    authError: googleAuthError,
    handleAuth: handleGoogleAuth,
    handleRevoke: handleGoogleRevoke,
  } = useGoogleAuth();

  // GitHub 認証の hook
  const {
    isAuthenticated: isGitHubAuthenticated,
    authError: githubAuthError,
    userCode: githubUserCode,
    isOpenUserCodeWindow: isOpenGitHubUserCodeWindow,
    handleAuth: handleGitHubAuth,
    handleShowUserCodeInputWindow: handleGitHubShowWindow,
    handleRevoke: handleGitHubRevoke,
  } = useGitHubAuth();

  // 保存ハンドラー
  const onSubmit: SubmitHandler<UserPreference> = async (data: UserPreference): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug('AccountSetting onSubmit');
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
                    <FormLabel>Google</FormLabel>
                  </Grid>
                  <Grid item>
                    <>
                      {!isGoogleAuthenticated && (
                        <>
                          <Button
                            variant="contained"
                            color="primary"
                            disabled={isGoogleAuthenticated === null}
                            onClick={handleGoogleAuth}
                          >
                            認証する
                          </Button>
                          {/* 認証エラー */}
                          {googleAuthError && <Alert severity="error">{googleAuthError}</Alert>}
                        </>
                      )}
                      {isGoogleAuthenticated && (
                        <Button
                          variant="outlined"
                          color="secondary"
                          style={{ marginLeft: '1ch' }}
                          onClick={handleGoogleRevoke}
                        >
                          認証解除
                        </Button>
                      )}
                    </>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper variant="outlined">
                <Grid container spacing={2} padding={2}>
                  <Grid item>
                    <FormLabel>GitHub</FormLabel>
                  </Grid>
                  <Grid item>
                    <>
                      {!isGitHubAuthenticated && (
                        <>
                          {!githubUserCode && (
                            <Button
                              variant="contained"
                              color="primary"
                              disabled={isGitHubAuthenticated === null || githubUserCode != null}
                              onClick={handleGitHubAuth}
                            >
                              認証する
                            </Button>
                          )}
                          {githubUserCode && (
                            <Grid container spacing={2}>
                              <Grid item>
                                <TextField
                                  variant="outlined"
                                  value={githubUserCode}
                                  label={'ユーザーコード'}
                                  size="small"
                                  InputProps={{ readOnly: true }}
                                ></TextField>
                              </Grid>
                              <Grid item>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  disabled={isOpenGitHubUserCodeWindow}
                                  onClick={handleGitHubShowWindow}
                                >
                                  コードを入力する
                                </Button>
                              </Grid>
                            </Grid>
                          )}
                          {/* 認証エラー */}
                          {githubAuthError && <Alert severity="error">{githubAuthError}</Alert>}
                        </>
                      )}
                      {isGitHubAuthenticated && (
                        <Button
                          variant="outlined"
                          color="secondary"
                          style={{ marginLeft: '1ch' }}
                          onClick={handleGitHubRevoke}
                        >
                          認証解除
                        </Button>
                      )}
                    </>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            {/* OPENAI API KEYは現状使われていないためコメントアウト */}
            {/* <Grid item xs={12}>
              <Paper variant="outlined" sx={{ padding: 2 }}>
                <Controller
                  name={`openAiKey`}
                  control={control}
                  rules={{
                    required: '入力してください。',
                  }}
                  render={({ field, fieldState: { error } }): React.ReactElement => (
                    <>
                      <TextField
                        label="OpenAI API KEY"
                        {...field}
                        error={!!error}
                        helperText={error?.message}
                        variant="outlined"
                        fullWidth
                        margin="none"
                      />
                    </>
                  )}
                />
              </Paper>
            </Grid> */}
          </Grid>
        </Paper>
      </SettingFormBox>
    </>
  );
};
