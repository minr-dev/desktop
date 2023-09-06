import { Alert, Button, Grid, Paper } from '@mui/material';
import { useGithubAuth } from '@renderer/hooks/useGithubAuth';
import { useGoogleAuth } from '@renderer/hooks/useGoogleAuth';

const AccountPage = (): JSX.Element => {
  console.log('AccountPage');

  // Google 認証の hook
  const {
    isAuthenticated: isGoogleAuthenticated,
    authError: googleAuthError,
    handleAuth: handleGoogleAuth,
    handleRevoke: handleGoogleRevoke,
  } = useGoogleAuth();

  // Github 認証の hook
  const {
    isAuthenticated: isGithubAuthenticated,
    authError: githubAuthError,
    handleAuth: handleGithubAuth,
    handleRevoke: handleGithubRevoke,
  } = useGithubAuth();

  return (
    <>
      <p>Account</p>
      <Paper variant="outlined">
        <Grid container spacing={2} padding={2}>
          <Grid item xs={12}>
            <Paper variant="outlined">
              <Grid container spacing={2} padding={2}>
                <Grid item xs={12}>
                  <>
                    {!isGoogleAuthenticated && (
                      <>
                        <Button
                          variant="contained"
                          color="primary"
                          disabled={isGoogleAuthenticated === null}
                          onClick={handleGoogleAuth}
                        >
                          Google認証
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
                <Grid item xs={12}>
                  <>
                    {!isGithubAuthenticated && (
                      <>
                        <Button
                          variant="contained"
                          color="primary"
                          disabled={isGithubAuthenticated === null}
                          onClick={handleGithubAuth}
                        >
                          Github認証
                        </Button>
                        {/* 認証エラー */}
                        {githubAuthError && <Alert severity="error">{githubAuthError}</Alert>}
                      </>
                    )}
                    {isGithubAuthenticated && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        style={{ marginLeft: '1ch' }}
                        onClick={handleGithubRevoke}
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

export default AccountPage;
