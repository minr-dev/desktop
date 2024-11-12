import { stringify } from 'csv-stringify/sync';

export const transformArrayToString = (datas: string[]): string => {
  // stringify で配列を引数にするには2次元配列である必要があるため変換を行う。
  const dataArray = [datas];
  const output: string = stringify(dataArray, { header: false, eof: false });
  return output;
};
