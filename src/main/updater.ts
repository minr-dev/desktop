import { dialog } from 'electron';
import { autoUpdater } from 'electron-updater';

export const initializeAutoUpdater = (): void => {
  // 更新が利用可能な場合の処理
  autoUpdater.on('update-available', () => {
    // 更新が利用可能であることを通知
    dialog
      .showMessageBox({
        type: 'info',
        title: 'Update Available',
        message: '新しいバージョンが利用可能です。今すぐアップデートしますか？',
        buttons: ['はい', 'いいえ'],
      })
      .then((result) => {
        // "Yes" がクリックされた場合、更新をダウンロード
        if (result.response === 0) {
          autoUpdater.downloadUpdate();
        }
      });
  });

  // 更新のダウンロードが完了した場合の処理
  autoUpdater.on('update-downloaded', () => {
    dialog
      .showMessageBox({
        type: 'info',
        title: 'Update Ready',
        message: 'アップデートがダウンロードされました。アプリケーションが再起動します。',
        buttons: ['OK'],
      })
      .then(() => {
        // アプリケーションを再起動して更新を適用
        autoUpdater.quitAndInstall();
      });
  });
};

export const checkForUpdates = (): void => {
  autoUpdater.checkForUpdates();
};
