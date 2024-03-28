import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { ReactNode } from 'react';

type CRUDFormDialogProps = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (formData) => void;
  children: ReactNode;
};

export const CRUDFormDialog = ({
  isOpen,
  title,
  onClose,
  onSubmit,
  children,
}: CRUDFormDialogProps): JSX.Element => {
  return (
    <Dialog open={isOpen} onClose={onClose} PaperProps={{ component: 'form', onSubmit: onSubmit }}>
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
    </Dialog>
  );
};
