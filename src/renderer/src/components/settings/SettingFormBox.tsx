import { Grid, Alert, Button, Box, Stack, Backdrop } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import React, { ReactNode } from 'react';
import { FieldErrors } from 'react-hook-form';
import { UserPreference } from '@shared/data/UserPreference';
import { FormContainer } from '../common/form/FormContainer';
import rendererContainer from '../../inversify.config';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';

/**
 * SettingFormBoxのプロパティインターフェース。
 */
interface SettingFormBoxProps {
  /**
   * フォームデータを送信するための関数。
   */
  onSubmit: (formData) => Promise<void>;

  /**
   * フォームのキャンセル操作を行うための関数。
   */
  onCancel: () => void;

  /**
   * フォームの状態。
   */
  errors: FieldErrors<UserPreference>;

  /**
   * グローバルエラーメッセージ。
   * フォームの個別アイテムに紐づかないエラーを表示するために使用する。
   */
  alertMessage?: string;

  /**
   * フォームの子要素。
   */
  children: ReactNode;
}

const loggerFactory = rendererContainer.get<ILoggerFactory>('LoggerFactory');
const logger = loggerFactory.getLogger('SettingFormBox');

/**
 * 設定フォームの共通化コンポーネント。
 *
 * @param {SettingFormBoxProps} props - コンポーネントのプロパティ
 * @return {JSX.Element} レンダリングされる要素
 */
export const SettingFormBox = ({
  onSubmit,
  onCancel,
  errors,
  alertMessage,
  children,
}: SettingFormBoxProps): JSX.Element => {
  logger.info('SettingFormBox');

  // 保存中フラグ
  const [saving, setSaving] = React.useState(false);

  // 保存ハンドラーは不要になるかもしれませんが、何らかの追加処理が必要なら以下のようにします。
  const handleSettingFormSubmit = async (formData): Promise<void> => {
    if (logger.isDebugEnabled()) logger.debug('SettingFormBox handleSettingFormSubmit');
    try {
      setSaving(true);
      await onSubmit(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <FormContainer formId="setting-form" onSubmit={handleSettingFormSubmit}>
        {children}
        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            bgcolor: 'background.default',
            boxShadow: 1,
            p: 1,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Grid container>
            <Grid
              item
              xs={12}
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Stack>
                {alertMessage && <Alert severity="error">{alertMessage}</Alert>}
                {Object.entries(errors).length > 0 && (
                  <Alert severity="error">入力エラーを修正してください</Alert>
                )}
                {/** 
                    デバッグのときにエラーを表示する 
                    ネストされた項目のエラーメッセージは正常に表示されない
                */}
                {process.env.NODE_ENV !== 'production' &&
                  Object.entries(errors).map(([fieldName, error]) => (
                    <Alert key={fieldName} severity="error">
                      {fieldName}: {error.message}
                    </Alert>
                  ))}
              </Stack>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Button type="submit" variant="contained" color="primary">
                保存
              </Button>
              <Button
                variant="contained"
                color="secondary"
                style={{
                  marginLeft: '10px',
                  marginRight: '30px',
                }}
                onClick={onCancel}
              >
                キャンセル
              </Button>
            </Grid>
          </Grid>
        </Box>
      </FormContainer>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={saving}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};
