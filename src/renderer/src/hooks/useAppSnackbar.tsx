import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { OptionsObject, SnackbarKey, useSnackbar } from 'notistack';

type EnqueueAppSnackbarType = (message: string, options?: OptionsObject | undefined) => void;

/**
 * アプリ共通の Snackbar のフック。
 *
 * - 閉じるボタンが付いている
 * - enqueueSnackbarと同じように使える。
 *
 * @returns { enqueueAppSnackbar: EnqueueAppSnackbarType } カスタムenqueueSnackbar関数。
 */
export const useAppSnackbar = (): { enqueueAppSnackbar: EnqueueAppSnackbarType } => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const enqueueAppSnackbar = (message: string, options?: OptionsObject): void => {
    enqueueSnackbar(message, {
      ...options,
      action: (key: SnackbarKey) => (
        <IconButton size="small" color="inherit" onClick={(): void => closeSnackbar(key)}>
          <CloseIcon fontSize="small" />
        </IconButton>
      ),
    });
  };

  return { enqueueAppSnackbar };
};
