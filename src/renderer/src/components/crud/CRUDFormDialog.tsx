import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { ReactNode } from 'react';
import { FormContainer } from '../common/form/FormContainer';

type CRUDFormDialogProps = {
  formId: string;
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (formData) => void;
  children: ReactNode;
};

export const CRUDFormDialog = ({
  formId,
  isOpen,
  title,
  onClose,
  onSubmit,
  children,
}: CRUDFormDialogProps): JSX.Element => {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <FormContainer
        formId={formId}
        onSubmit={(formData): void => {
          onSubmit(formData);
        }}
        isVisible={isOpen}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{children}</DialogContent>
        <DialogActions style={{ justifyContent: 'center' }}>
          <Button type="submit" color="primary" variant="contained">
            保存
          </Button>
          <Button onClick={onClose} color="secondary" variant="contained">
            キャンセル
          </Button>
        </DialogActions>
      </FormContainer>
    </Dialog>
  );
};
