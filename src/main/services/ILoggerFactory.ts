import { IWinstonLogger } from "@shared/utils/IWinstonLogger";

export interface ILoggerFactory {
  getLogger(params: { loggerName: string; processType: string }): IWinstonLogger;
}
