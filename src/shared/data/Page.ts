export class Page<T> {
  private _totalPages: number;

  constructor(readonly content: T[], readonly totalElements: number, readonly pageable: Pageable) {
    this._totalPages = Math.ceil(totalElements / pageable.pageSize);
  }

  toPageResponse(): PageResponse<T> {
    return {
      content: this.content,
      pageRequest: this.pageable.toPageRequest(),
      totalPages: this.totalPages,
      totalElements: this.totalElements,
    };
  }

  // 既存のPageResponseからPageを生成
  static fromPageResponse<T>(pageResponse: PageResponse<T>): Page<T> {
    return new Page(
      pageResponse.content,
      pageResponse.totalElements,
      Pageable.fromPageRequest(pageResponse.pageRequest)
    );
  }

  get totalPages(): number {
    return this._totalPages;
  }

  isFirstPage(): boolean {
    return this.pageable.pageNumber === 0;
  }

  isLastPage(): boolean {
    return this.pageable.pageNumber >= this.totalPages - 1;
  }

  hasNextPage(): boolean {
    return this.pageable.pageNumber < this.totalPages - 1;
  }

  hasPreviousPage(): boolean {
    return this.pageable.pageNumber > 0;
  }
}

export class Pageable {
  constructor(readonly pageNumber: number, readonly pageSize: number, readonly sort?: PageSort) {}

  // PageRequestオブジェクトを生成
  toPageRequest(): PageRequest {
    return {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      sort: this.sort,
    };
  }

  // PageRequestからPageableを生成
  static fromPageRequest(pageRequest: PageRequest): Pageable {
    return new Pageable(pageRequest.pageNumber, pageRequest.pageSize, pageRequest.sort);
  }

  // 次のページへ
  nextPage(): Pageable {
    return new Pageable(this.pageNumber + 1, this.pageSize, this.sort);
  }

  // 前のページへ
  previousPage(): Pageable {
    return new Pageable(Math.max(0, this.pageNumber - 1), this.pageSize, this.sort);
  }

  replacePageNumber(pageNumber: number): Pageable {
    return new Pageable(pageNumber, this.pageSize, this.sort);
  }

  replacePageSize(pageSize: number): Pageable {
    return new Pageable(this.pageNumber, pageSize, this.sort);
  }

  replaceSort(sort: PageSort): Pageable {
    return new Pageable(this.pageNumber, this.pageSize, sort);
  }
}

export type PageSortDirection = 'asc' | 'desc';

export interface PageSort {
  property: string;
  direction: PageSortDirection;
}

export interface PageRequest {
  pageNumber: number;
  pageSize: number;
  sort?: PageSort;
}

export interface PageResponse<T> {
  content: T[];
  pageRequest: PageRequest;
  totalPages: number;
  totalElements: number;
}
