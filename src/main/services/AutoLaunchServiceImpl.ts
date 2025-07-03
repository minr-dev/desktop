import { app } from 'electron';
import { IAutoLaunchService } from './IAutoLaunchService';
import { injectable } from 'inversify';
import { is } from '@electron-toolkit/utils';
import { getLogger } from '@main/utils/LoggerUtil';

const logger = getLogger('AutoLaunchService');

@injectable()
export class AutoLaunchServiceImpl implements IAutoLaunchService {
  async setAutoLaunchEnabled(isEnabled: boolean): Promise<void> {
    logger.debug('setAutoLaunchEnabled', isEnabled);
    if (!app.isReady()) {
      await app.whenReady();
    }
    if (is.dev || !app.isPackaged) {
      logger.warn('Auto-launch setting is disabled in development.');
      return;
    }
    const setting = app.getLoginItemSettings();
    if (setting.openAtLogin != isEnabled) {
      app.setLoginItemSettings({ ...setting, openAtLogin: isEnabled });
    }
  }
}
