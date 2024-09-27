export interface Investment {
    name: string;
    value: number;
    color: string;
  }
  
  export interface StockData {
    symbol: string;
    price: number;
    change: number;
  }
  
  export interface NewsItem {
    title: string;
    url: string;
  }
  export interface BondData {
    symbol: string;
    name: string;
    price: string;
    yield: number;
    maturityDate: string;
  }
  
  export interface MutualFundData {
    symbol: string;
    name: string;
    nav: string;
    expenseRatio: number;
    category: string;
  }
  
  export interface CryptoData {
    symbol: string;
    name: string;
    price: string;
    change: number;
    volume: number;
  }
  export interface Transaction {
    id: string;
    type: 'buy' | 'sell';
    symbol: string;
    amount: number;
    price: number;
    date: Date;
  }
  
  export interface PortfolioPerformance {
    date: string;
    value: number;
  }
  export type InvestmentData = StockData | BondData | MutualFundData | CryptoData;