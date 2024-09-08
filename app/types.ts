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