import { PortfolioPerformance } from '../types';

export const generateMockPortfolioPerformance = (): PortfolioPerformance[] => {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.random() * 2000 + 8000,
    };
  }).reverse();
};