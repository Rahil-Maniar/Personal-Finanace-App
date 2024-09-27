import { StockData } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY = 'Nj3jiIkGEpZ600ZCDjgPDSLprvOmGMl2';
const NEWS_API_KEY = 'cc39f99c6d964dce9b2d0f0ca39ea969';
const CACHE_KEY = 'STOCK_DATA_CACHE';
const UPDATE_INTERVAL = 432000; // 5 days in milliseconds (86400 * 5)
const MAX_DAILY_CALLS = 200;
const TOP_STOCKS = ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'FB', 'TSLA', 'NVDA', 'JPM', 'JNJ', 'V'];

interface CachedData {
  data: StockData[];
  lastUpdated: number;
  dailyCalls: number;
  lastCallDate: string;
}

export const fetchStockData = async (): Promise<StockData[]> => {
  try {
    const cachedData = await getCachedData();

    if (cachedData && !shouldUpdate(cachedData)) {
      return cachedData.data;
    }

    if (await hasReachedDailyLimit(cachedData)) {
      console.log('Daily API call limit reached. Using cached data.');
      return cachedData?.data || [];
    }

    const stockData = await fetchFreshData();
    await updateCache(stockData);
    return stockData;
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return [];
  }
};
export const fetchBondData = async (): Promise<BondData[]> => {
  // Simulating API call
  return [
    { symbol: 'T10Y2Y', name: '10-Year Treasury Constant Maturity Minus 2-Year', price: '99.50', yield: 1.5, maturityDate: '2031-09-15' },
    { symbol: 'DFII10', name: '10-Year Treasury Inflation-Indexed Security', price: '101.25', yield: 0.8, maturityDate: '2031-09-15' },
    { symbol: 'DGS5', name: '5-Year Treasury Constant Maturity Rate', price: '100.75', yield: 1.2, maturityDate: '2026-09-15' },
  ];
};

export const fetchMutualFundData = async (): Promise<MutualFundData[]> => {
  // Simulating API call
  return [
    { symbol: 'VFIAX', name: 'Vanguard 500 Index Fund', nav: '400.25', expenseRatio: 0.04, category: 'Large Blend' },
    { symbol: 'FXAIX', name: 'Fidelity 500 Index Fund', nav: '150.80', expenseRatio: 0.015, category: 'Large Blend' },
    { symbol: 'SWPPX', name: 'Schwab S&P 500 Index Fund', nav: '65.50', expenseRatio: 0.02, category: 'Large Blend' },
  ];
};

export const fetchCryptoData = async (): Promise<CryptoData[]> => {
  // Simulating API call
  return [
    { symbol: 'BTC', name: 'Bitcoin', price: '45000.00', change: 2.5, volume: 25000000000 },
    { symbol: 'ETH', name: 'Ethereum', price: '3000.00', change: -1.2, volume: 15000000000 },
    { symbol: 'ADA', name: 'Cardano', price: '2.50', change: 0.8, volume: 5000000000 },
  ];
};
export const fetchStockPrice = async (symbol: string): Promise<StockData | null> => {
  try {
    const response = await fetch(`https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${API_KEY}`);
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        symbol: data[0].symbol,
        name: data[0].name,
        price: data[0].price,
        change: data[0].changesPercentage
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching stock price:', error);
    return null;
  }
};

const getCachedData = async (): Promise<CachedData | null> => {
  const cachedString = await AsyncStorage.getItem(CACHE_KEY);
  return cachedString ? JSON.parse(cachedString) : null;
};

const shouldUpdate = (cachedData: CachedData): boolean => {
  return Date.now() - cachedData.lastUpdated > UPDATE_INTERVAL;
};

const hasReachedDailyLimit = async (cachedData: CachedData | null): Promise<boolean> => {
  const today = new Date().toDateString();
  if (cachedData && cachedData.lastCallDate === today) {
    return cachedData.dailyCalls >= MAX_DAILY_CALLS;
  }
  return false;
};

const fetchFreshData = async (): Promise<StockData[]> => {
  const stockDataPromises = TOP_STOCKS.map(fetchStockPrice);
  const stockData = (await Promise.all(stockDataPromises)).filter(Boolean) as StockData[];
  console.log('Fetched fresh stock data:', stockData);
  return stockData;
};

const updateCache = async (stockData: StockData[]): Promise<void> => {
  const cachedData = await getCachedData();
  const today = new Date().toDateString();
  const newCachedData: CachedData = {
    data: stockData,
    lastUpdated: Date.now(),
    dailyCalls: (cachedData && cachedData.lastCallDate === today ? cachedData.dailyCalls : 0) + 1,
    lastCallDate: today
  };
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(newCachedData));
};

export const fetchNews = async (): Promise<NewsItem[]> => {
  try {
    const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=${NEWS_API_KEY}`);
    const data = await response.json();
    
    return data.articles.slice(0, 5).map(article => ({
      title: article.title,
      url: article.url,
      source: article.source.name,
    }));
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};