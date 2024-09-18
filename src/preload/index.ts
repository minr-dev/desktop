import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import container from './inversify.config';
import { ILogger } from '../shared/utils/ILogger';
import { TYPES } from './types';

// Custom APIs for renderer
const api = {};

const logger = container.get<ILogger>(TYPES.WinstonLogger);

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
    // renderer でユーザーパスを取得できないためブリッジの設定を行う
    contextBridge.exposeInMainWorld('loggerPath', {
      get: async () => {
        const paths = await ipcRenderer.invoke('get-user-path');
        return paths;
      },
    });
    // renderer で winston を呼び出せないためブリッジの設定を行う
    contextBridge.exposeInMainWorld('logger', {
      addFileTransport: (filePath: string) => logger.addFileTransport(filePath),
      info: (message: string, processtype: string, loggername: string) =>
        logger.info(message, processtype, loggername),
      warn: (message: string, processtype: string, loggername: string) =>
        logger.warn(message, processtype, loggername),
      error: (message: string, processtype: string, loggername: string) =>
        logger.error(message, processtype, loggername),
      debug: (message: string, processtype: string, loggername: string) =>
        logger.debug(message, processtype, loggername),
      isDebugEnabled: () => logger.isDebugEnabled(),
    });
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
