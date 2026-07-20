export type CustomerListRow = {
  id: string;
  name: string;
  phone: string;
  currentBalance: number;
  creditLimit: number;
  createdAt: string;
};

export type CustomerListResult = {
  items: CustomerListRow[];
  total: number;
};

export type CustomerTransactionDTO = {
  id: string;
  type: "credit_sale" | "payment" | "adjustment";
  amount: number;
  balanceAfter: number;
  note: string | null;
  saleId: string | null;
  createdAt: string;
};

export type CustomerDetail = {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  creditLimit: number;
  currentBalance: number;
  createdAt: string;
  transactions: CustomerTransactionDTO[];
};
