// types.ts
export interface Account {
    id: string;
    name: string;
    balance: number;
  }
  
  export interface Transaction {
    id: string;
    date: string;
    category: string;
    amount: number;
  }
  
  export interface FinanceData {
    accounts: Account[];
    transactions: Transaction[];
  }
  