import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  Paper,
  styled,
} from '@mui/material';
import { useFormManager } from '@renderer/hooks/useFormManager';
import React from 'react';
import { Controller } from 'react-hook-form';
import { ProjectDropdownComponent } from '../project/ProjectDropdownComponent';
import { getLogger } from '@renderer/utils/LoggerUtil';

const logger = getLogger('GitHubSyncTaskDialog');

const CustomDialogContent = styled(DialogContent)`
  transition: width 0.5s ease;
`;

const CustomDialog = styled(Dialog)`
  & .MuiDialog-paper {
    transition: transform 0.5s ease, width 0.5s ease;
  }
`;

interface GitHubSyncTaskDialogProps {
  isOpen: boolean;
  onSubmit: (projectId: string) => Promise<void>;
  onClose: () => Promise<void>;
}

const GitHubSyncTaskDialog = (
  { isOpen, onSubmit, onClose }: GitHubSyncTaskDialogProps,
  ref
): JSX.Element => {
  const methods = useFormManager({ formId: 'sync-github-task', isVisible: isOpen });
  const { handleSubmit, control } = methods;

  const handleFormSubmit = async (data): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug('GitHub sync task: ', data);
    await onSubmit(data.projectId);
  };

  const handleGitHubSyncTaskDialog = async (): Promise<void> => {
    await onClose();
  };

  return (
    <CustomDialog
      ref={ref}
      open={isOpen}
      onClose={handleGitHubSyncTaskDialog}
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit(handleFormSubmit),
        style: {
          maxWidth: 600,
          transition: 'width 0.5s ease, transform 0.5s ease',
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          GitHubタスク同期
        </Box>
      </DialogTitle>
      <CustomDialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper variant="outlined">
              <Grid container spacing={2} padding={2}>
                <Grid item xs={12}>
                  <Controller
                    name={`projectId`}
                    control={control}
                    rules={{ required: '入力してください' }}
                    render={({ field: { onChange }, fieldState: { error } }): JSX.Element => (
                      <FormControl component="fieldset">
                        <ProjectDropdownComponent
                          onChange={onChange}
                          error={error}
                          filterByGitHubSync
                        />
                        <FormHelperText>
                          タスク同期を行いたいプロジェクトを指定してください。
                        </FormHelperText>
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </CustomDialogContent>
      <DialogActions>
        <Button type="submit" color="primary" variant="contained">
          同期する
        </Button>
        <Button onClick={handleGitHubSyncTaskDialog} color="secondary" variant="contained">
          キャンセル
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default React.forwardRef(GitHubSyncTaskDialog);
