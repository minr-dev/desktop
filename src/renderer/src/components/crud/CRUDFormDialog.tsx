import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { ReactNode } from 'react';
import { FieldValues, FormProvider, UseFormReturn } from 'react-hook-form';

type CRUDFormDialogProps<TFieldValue extends FieldValues> = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (formData: TFieldValue) => Promise<void>;
  methods: UseFormReturn<TFieldValue>;
  children: ReactNode;
};

export const CRUDFormDialog = <TFieldValue extends FieldValues>({
  isOpen,
  title,
  onClose,
  onSubmit,
  methods,
  children,
}: CRUDFormDialogProps<TFieldValue>): JSX.Element => {
  return (
    <FormProvider {...methods}>
      <Dialog
        open={isOpen}
        onClose={onClose}
        PaperProps={{ component: 'form', onSubmit: methods.handleSubmit(onSubmit) }}
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
      </Dialog>
    </FormProvider>
  );
};
