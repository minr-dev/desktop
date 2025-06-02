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

const CustomDialogContent = styled(DialogContent)`
  transition: width 0.5s ease;
`;

const CustomDialog = styled(Dialog)`
  & .MuiDialog-paper {
    transition: transform 0.5s ease, width 0.5s ease;
  }
`;

interface AutoRegisterProvisionalPlansProps {
  isOpen: boolean;
  onSubmit: (projectId: string) => Promise<void>;
  onClose: () => Promise<void>;
}

const AutoRegisterProvisionalPlansForm = (
  { isOpen, onSubmit, onClose }: AutoRegisterProvisionalPlansProps,
  ref
): JSX.Element => {
  const methods = useFormManager({ formId: 'auto-register-provisional-plans', isVisible: isOpen });
  const { handleSubmit, control } = methods;

  const handleFormSubmit = async (data): Promise<void> => {
    console.log('AutoRegisterProvisionalPlans: ', data);
    await onSubmit(data.projectId);
  };

  const handleCloseAutoRegisterProvisionalForm = async (): Promise<void> => {
    await onClose();
  };

  return (
    <CustomDialog
      ref={ref}
      open={isOpen}
      onClose={handleCloseAutoRegisterProvisionalForm}
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
          予定の自動登録
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
                    render={({ field: { onChange } }): JSX.Element => (
                      <FormControl component="fieldset">
                        <ProjectDropdownComponent onChange={onChange} />
                        <FormHelperText>
                          予定登録を行いたいプロジェクトを指定してください。
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
          仮予定を登録
        </Button>
        <Button
          onClick={handleCloseAutoRegisterProvisionalForm}
          color="secondary"
          variant="contained"
        >
          キャンセル
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default React.forwardRef(AutoRegisterProvisionalPlansForm);
