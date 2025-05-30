import React, { useEffect } from 'react';
import { Controller } from 'react-hook-form';
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
import { useFormManager } from '@renderer/hooks/useFormManager';

const CustomDialogContent = styled(DialogContent)`
  transition: width 0.5s ease;
`;

const CustomDialog = styled(Dialog)`
  & .MuiDialog-paper {
    transition: transform 0.5s ease, width 0.5s ease;
  }
`;

export interface PlanTemplateApplyFormData {
  templateId: string;
}

interface PlanTemplateApplyFormProps {
  isOpen: boolean;
  onSubmit: (templateId: string) => void;
  onClose: () => void;
}

const logger = getLogger('PlanTemplateApplyForm');

/**
 * 予定のテンプレートを適用する際に表示するコンポーネント。
 *
 * @param {PlanTemplateApplyFormProps} props - コンポーネントのプロパティ。
 * @returns {JSX.Element} レンダリング結果。
 */
const PlanTemplateApplyForm = (
  { isOpen, onSubmit, onClose }: PlanTemplateApplyFormProps,
  ref
): JSX.Element => {
  logger.info('PlanTemplateApplyForm', isOpen);

  const { handleSubmit, control, reset } = useFormManager<PlanTemplateApplyFormData>({
    formId: 'plan-template-apply-form',
    isVisible: isOpen,
  });

  useEffect(() => {
    reset();
  }, [reset]);

  const handleFormSubmit = async (data: PlanTemplateApplyFormData): Promise<void> => {
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

export default React.forwardRef(PlanTemplateApplyForm);
