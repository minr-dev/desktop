import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { ReactNode } from 'react';

type CRUDFormDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData) => void;
  children: ReactNode;
};

export const CRUDFormDialog = ({
  isOpen,
  onClose,
  onSubmit,
  children,
}: CRUDFormDialogProps): JSX.Element => {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <form
        onSubmit={(formData): void => {
          onSubmit(formData);
        }}
      >
        <DialogTitle>登録</DialogTitle>
        <DialogContent>{children}</DialogContent>
        <DialogActions>
          <Button type="submit" color="primary">
            保存
          </Button>
          <Button onClick={onClose} color="secondary">
            キャンセル
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
