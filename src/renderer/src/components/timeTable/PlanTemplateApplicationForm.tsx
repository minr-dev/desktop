import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Grid,
  Dialog,
  DialogActions,
  Button,
  DialogContent,
  DialogTitle,
  Box,
} from '@mui/material';
import { styled } from '@mui/system';
import { getLogger } from '@renderer/utils/LoggerUtil';
import { PlanTemplateDropdownComponent } from '../planTemplate/PlanTemplateDropdownComponent';

const CustomDialogContent = styled(DialogContent)`
  transition: width 0.5s ease;
`;

const CustomDialog = styled(Dialog)`
  & .MuiDialog-paper {
    transition: transform 0.5s ease, width 0.5s ease;
  }
`;

export interface PlanTemplateApplicationFormData {
  templateId: string;
}

interface PlanTemplateApplicationFormProps {
  isOpen: boolean;
  onSubmit: (templateId: string) => void;
  onClose: () => void;
}

const logger = getLogger('PlanTemplateApplicationForm');

/**
 * 予定の自動登録でタスクの予定工数を実績が超過していた場合に表示するコンポーネント。
 *
 * @param {PlanTemplateApplicationFormProps} props - コンポーネントのプロパティ。
 * @returns {JSX.Element} レンダリング結果。
 */
const PlanTemplateApplicationForm = (
  { isOpen, onSubmit, onClose }: PlanTemplateApplicationFormProps,
  ref
): JSX.Element => {
  logger.info('PlanTemplateApplicationForm', isOpen);

  const { handleSubmit, control, reset } = useForm<PlanTemplateApplicationFormData>();

  useEffect(() => {
    reset();
  }, [reset]);

  const handleFormSubmit = async (data: PlanTemplateApplicationFormData): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug('EventForm handleFormSubmit called with:', data);
    onSubmit(data.templateId);
  };

  const handleCloseEventEntryForm = async (): Promise<void> => {
    onClose();
  };

  return (
    <CustomDialog
      ref={ref}
      open={isOpen}
      onClose={handleCloseEventEntryForm}
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit(handleFormSubmit),
        style: {
          maxWidth: 600,
          minWidth: 300,
          transition: 'width 0.5s ease, transform 0.5s ease',
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          予定テンプレート適用
        </Box>
      </DialogTitle>
      <CustomDialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              control={control}
              name={'templateId'}
              rules={{ required: '入力してください' }}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }): React.ReactElement => {
                return (
                  <PlanTemplateDropdownComponent value={value} error={error} onChange={onChange} />
                );
              }}
            />
          </Grid>
        </Grid>
      </CustomDialogContent>
      <DialogActions>
        <Button type="submit" color="primary" variant="contained">
          登録
        </Button>
        <Button onClick={handleCloseEventEntryForm} color="secondary" variant="contained">
          キャンセル
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default React.forwardRef(PlanTemplateApplicationForm);
