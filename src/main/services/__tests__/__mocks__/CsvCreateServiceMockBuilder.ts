import { ICsvCreateService } from '@main/services/ICsvCreateService';

export class CsvCreateServiceMockBuilder<T> {
  private createCsv: jest.MockedFunction<(eventEntryCsv: T[]) => Promise<string>> = jest.fn();

  withCreateCsv(result: string): CsvCreateServiceMockBuilder<T> {
    this.createCsv.mockResolvedValue(result);
    return this;
  }

  build(): ICsvCreateService<T> {
    const mock: ICsvCreateService<T> = {
      createCsv: this.createCsv,
    };
    return mock;
  }
}
