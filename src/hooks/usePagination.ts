const usePagination = (): { page: number; setPage: (page: number) => void } => ({
  page: 1,
  setPage: (_page: number): void => {},
});

export default usePagination;
