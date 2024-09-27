import { IWinstonLoggerProxy } from "@shared/utils/IWinstonLoggerProxy";

export interface ILoggerFactory {
  getLogger(params: { loggerName: string; processType: string }): IWinstonLoggerProxy;
}
