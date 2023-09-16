import { Grid, Paper, Alert, Button, FormLabel } from '@mui/material';
import { useGoogleAuth } from '@renderer/hooks/useGoogleAuth';
import { useGitHubAuth } from '@renderer/hooks/useGitHubAuth';

export const AccountSetting = (): JSX.Element => {
  console.log('AccountSetting');

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
    handleAuth: handleGitHubAuth,
    handleRevoke: handleGitHubRevoke,
  } = useGitHubAuth();

  return (
    <>
      <p>Account</p>
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
                        <Button
                          variant="contained"
                          color="primary"
                          disabled={isGitHubAuthenticated === null}
                          onClick={handleGitHubAuth}
                        >
                          認証する
                        </Button>
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
        </Grid>
      </Paper>
    </>
  );
};
