import { TYPES } from "@main/types";
import type { IWinstonLogger } from "@shared/utils/IWinstonLogger";
import { inject, injectable } from "inversify";
import { ILoggerFactory } from "./ILoggerFactory";

@injectable()
export class LoggerFactoryImpl implements ILoggerFactory{
  constructor(
    @inject(TYPES.WinstonLogger)
    private readonly winstonLogger: IWinstonLogger
  ) {}

  getLogger(params: { loggerName: string; processType: string }): IWinstonLogger {
    this.winstonLogger.setName(params.loggerName);
    this.winstonLogger.setProcessType(params.processType);
    return this.winstonLogger;
  }
}
