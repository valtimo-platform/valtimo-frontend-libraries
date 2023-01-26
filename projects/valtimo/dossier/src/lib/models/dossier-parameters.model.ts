interface PaginationParameters {
  collectionSize: string;
  page: string;
  size: string;
  maxPaginationItemSize: string;
  sortStateName: string;
  sortStateDirection: string;
  isSorting: 'true' | 'false';
}

interface DossierParameters extends PaginationParameters {
  search?: string;
}

export {DossierParameters};
