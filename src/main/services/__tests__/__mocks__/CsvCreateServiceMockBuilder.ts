import { ICsvCreateService } from '@main/services/ICsvCreateService';

export class CsvCreateServiceMockBuilder<T> {
  private createCsv: jest.MockedFunction<
    (csvHeader: Record<keyof T, string>, csvData: T[]) => Promise<string>
  > = jest.fn();
  private convertArrayToString: jest.MockedFunction<(datas: string[]) => string> = jest.fn();

  withCreateCsv(result: string): CsvCreateServiceMockBuilder<T> {
    this.createCsv.mockResolvedValue(result);
    return this;
  }

  withConvertArrayToString(result: string): CsvCreateServiceMockBuilder<T> {
    this.convertArrayToString.mockReturnValue(result);
    return this;
  }

  build(): ICsvCreateService<T> {
    const mock: ICsvCreateService<T> = {
      createCsv: this.createCsv,
      convertArrayToString: this.convertArrayToString,
    };
    return mock;
  }
}
