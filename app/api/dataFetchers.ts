import { StockData } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY = 'cJILQTBRVvz6aUI5jvuenTlAH7hjXLOj';
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