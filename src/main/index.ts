import mainContainer from './inversify.config';
import { app, shell, BrowserWindow, powerMonitor } from 'electron';
import path, { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import dotenv from 'dotenv';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { TYPES } from './types';
import { IIpcHandlerInitializer } from './ipc/IIpcHandlerInitializer';
import { TaskScheduler } from './services/TaskScheduler';
import { ITaskProcessor } from './services/ITaskProcessor';
import { IpcService } from './services/IpcService';
import { initializeAutoUpdater, checkForUpdates } from './updater';

const envPath = path.join(app.getAppPath(), '.env');
dotenv.config({ path: envPath, debug: true });

let mainWindow: BrowserWindow | null = null;
const getMainWindow = (): BrowserWindow => {
  if (mainWindow === null) {
    throw new Error('mainWindow is null');
  }
  return mainWindow;
};

const handlers = mainContainer.getAll<IIpcHandlerInitializer>(TYPES.IpcHandlerInitializer);
for (const handler of handlers) {
  handler.init();
}

const taskScheduler = mainContainer.get<TaskScheduler>(TYPES.TaskScheduler);
const watcher = mainContainer.get<ITaskProcessor>(TYPES.WindowWatcher);
taskScheduler.addTaskProcessor(watcher, 1 * 60 * 1000);
const calendarSync = mainContainer.get<ITaskProcessor>(TYPES.CalendarSyncProcessor);
taskScheduler.addTaskProcessor(calendarSync, 5 * 60 * 1000);
const speakEventNotify = mainContainer.get<ITaskProcessor>(TYPES.SpeakEventNotifyProcessor);
taskScheduler.addTaskProcessor(speakEventNotify, 1 * 60 * 1000);
const speakTimeNotify = mainContainer.get<ITaskProcessor>(TYPES.SpeakTimeNotifyProcessor);
taskScheduler.addTaskProcessor(speakTimeNotify, 1 * 60 * 1000);

const ipcService = mainContainer.get<IpcService>(TYPES.IpcService);

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: !app.isPackaged && is.dev ? 1024 + 800 : 1024,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  ipcService.setWindow(mainWindow);
  taskScheduler.start();

  mainWindow.on('ready-to-show', () => {
    const win = getMainWindow();
    win.show();
    if (!app.isPackaged && is.dev) {
      win.webContents.openDevTools();
    }
    // DEBUG
    // win.webContents.openDevTools();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  if (!app.isPackaged && is.dev) {
    installExtension(REACT_DEVELOPER_TOOLS)
      .then((name) => console.log(`Added Extension: ${name}`))
      .catch((err) => console.log('An error occurred: ', err));
  }
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  taskScheduler.stop();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  initializeAutoUpdater();
  checkForUpdates();

  // スリープに入るイベント
  powerMonitor.on('suspend', () => {
    console.log('The system is going to sleep');
    // アクティビティの記録を停止する
    taskScheduler.stop();
  });

  // スリープから復帰したイベント
  powerMonitor.on('resume', () => {
    console.log('The system is resuming');
    // アクティビティの記録を再開する
    taskScheduler.start();
  });
});
