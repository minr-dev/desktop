import { Button, Box } from '@mui/material';
import ReactDOM from 'react-dom';
interface ModalProps {
  onClose: () => void;
}

// アプリのバージョン番号
const version = '0.1.2';

/**
 * ヘルプ画面コンポーネント
 *
 * ヘルプのモーダルを表示する。
 *
 * (表示内容)
 * ・アプリのバージョン番号
 * ・最新版のアプリのダウンロードURL(github release)
 *
 * @param onClose モーダルを閉じる用メソッド
 * @returns {React.ReactPortal} レンダリング結果。
 */
const Help: React.FC<ModalProps> = ({ onClose }) => {
  return ReactDOM.createPortal(
    <>
      <Box
        position="fixed"
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
      >
        <Box
          sx={{
            zIndex: 2,
            width: '25%',
            padding: '1em',
            background: '#fff',
            color: 'rgba(0,0,0,255)',
            fontSize: '24px',
          }}
        >
          Version: {version}
          <Box
            sx={{
              fontSize: '12px',
            }}
          >
            <a
              href="https://github.com/minr-dev/desktop/releases"
              target="_blank"
              rel="noopener noreferrer"
            >
              最新版のダウンロードはこちらから
            </a>
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Button type="submit" variant="contained" color="primary" onClick={onClose}>
              閉じる
            </Button>
          </Box>
        </Box>
      </Box>
    </>,
    document.body
  );
};

export default Help;
