export type AccountingDebts = {
  id: number;
  total: number;
  month: number;
  year: number;
  honorary: number;
  debts: number;
};

export type DebtsCustomer = {
  debts: AccountingDebts[];
  name: string;
  rfc: string;
};
