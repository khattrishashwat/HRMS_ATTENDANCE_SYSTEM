export interface FinancialYear {
  id: number;
  financialYear: string;
  isCurrent: boolean;
}

export interface ListFinancialYearsApiResponse {
  code?: string;
  status?: string;
  message?: string;
  data: FinancialYear[];
}
