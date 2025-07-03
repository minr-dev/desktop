export interface ICsvCreateService<T> {
  createCsv(csvHeader: Record<keyof T, string>, csvData: T[]): Promise<string>;
  convertArrayToString(datas: string[]): string;
}
