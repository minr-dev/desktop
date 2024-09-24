import { IpcChannel } from '@shared/constants';
import type { ILoggerProxy } from '@shared/utils/ILoggerProxy';
import { injectable } from 'inversify';
// import winston, { format } from 'winston';
// import 'winston-daily-rotate-file';
// import Transport from 'winston-transport';

@injectable()
export class WinstonLoggerProxyImpl implements ILoggerProxy {
  // private formatter;
  // private stringTransport;

  constructor() {
    // const processType = 'renderer';
    // const name = 'undefined';
    // this.stringTransport = new StringTransport({
    //   level: 'debug',
    //   format: winston.format.combine(
    //     winston.format.printf(({ level, message }) => {
    //       return `[${level}]<${processType}><${name}>: ${message}`;
    //     })
    //   )
    // });
    // this.formatter = winston.createLogger({
    //   transports: [this.stringTransport]
    // });
  }

  async info(message: string): Promise<void> {
    // this.formatter.info(message);
    // const formatMessage = this.stringTransport.getLogMessage();
    // return await window.electron.ipcRenderer.invoke(IpcChannel.WINSTON_LOGGER_INFO, formatMessage);
    return await window.electron.ipcRenderer.invoke(IpcChannel.WINSTON_LOGGER_INFO, message);
  }

  async warn(message: string): Promise<void> {
    // this.formatter.warn(message);
    // const formatMessage = this.stringTransport.getLogMessage();
    // return await window.electron.ipcRenderer.invoke(IpcChannel.WINSTON_LOGGER_WARN, formatMessage);
    return await window.electron.ipcRenderer.invoke(IpcChannel.WINSTON_LOGGER_WARN, message);
  }

  async error(message: string): Promise<void> {
    // this.formatter.error(message);
    // const formatMessage = this.stringTransport.getLogMessage();
    // return await window.electron.ipcRenderer.invoke(IpcChannel.WINSTON_LOGGER_ERROR, formatMessage);
    return await window.electron.ipcRenderer.invoke(IpcChannel.WINSTON_LOGGER_ERROR, message);
  }

  async debug(message: string): Promise<void> {
    // this.formatter.debug(message);
    // const formatMessage = this.stringTransport.getLogMessage();
    // return await window.electron.ipcRenderer.invoke(IpcChannel.WINSTON_LOGGER_DEBUG, formatMessage);
    return await window.electron.ipcRenderer.invoke(IpcChannel.WINSTON_LOGGER_DEBUG, message);
  }

  async isDebugEnabled(): Promise<boolean> {
    return await window.electron.ipcRenderer.invoke(IpcChannel.WINSTON_LOGGER_ISDEBUGENABLED);
  }
}

// export class StringTransport extends Transport {
//   private MESSAGE = Symbol.for('message');
//   private logMessage: string;
//   private logFormat;

//   constructor(opts) {
//     super(opts);
//     this.logMessage = '';
//     this.logFormat = format.combine(
//       opts.format || format.simple()
//     );
//   }

//   log(info, callback) {
//     setImmediate(() => {
//       this.emit('logged', info);
//     });
//     const formatMessage = this.logFormat.transform(info);
//     this.logMessage = formatMessage[this.MESSAGE];
//     callback();
//   }

//   getLogMessage() {
//     return this.logMessage;
//   }
// }
