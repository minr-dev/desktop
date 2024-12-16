export interface ICsvCreateService<T> {
  createCsv(csvData: T[]): Promise<string>;
  convertArrayToString(datas: string[]): string;
}
