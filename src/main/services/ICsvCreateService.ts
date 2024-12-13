export interface ICsvCreateService<T> {
  createCsv(eventEntryCsv: T[]): Promise<string>;
  convertArrayToString(datas: string[]): string;
}
