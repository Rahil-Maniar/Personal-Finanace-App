import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Animated, SafeAreaView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BalanceCard from './components/BalanceCard';
import InvestmentsCard from './components/InvestmentsCard';
import StockDataCard from './components/StockDataCard';
import NewsCard from './components/NewsCard';
import TradeModal from './components/TradeModal';
import { fetchStockData, fetchNews } from './api/dataFetchers';
import { generateMockPortfolioPerformance } from './utils/mockDataGenerator';
import { Investment, StockData, NewsItem, Transaction, PortfolioPerformance } from './types';

const InvestmentScreen: React.FC = () => {
  const [balance, setBalance] = useState(10000);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [scrollY] = useState(new Animated.Value(0));
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [portfolioPerformance, setPortfolioPerformance] = useState<PortfolioPerformance[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [tradeModalVisible, setTradeModalVisible] = useState(false);
  const [stockPrices, setStockPrices] = useState<{ [symbol: string]: number }>({});

  useEffect(() => {
    fetchStockData().then((data) => {
      setStockData(data);
      const prices: { [symbol: string]: number } = {};
      data.forEach((stock) => {
        prices[stock.symbol] = parseFloat(stock.price);
      });
      setStockPrices(prices);
    });
    fetchNews().then(setNewsItems);
    setPortfolioPerformance(generateMockPortfolioPerformance());
  }, []);

  const handleTrade = useCallback((tradeType: 'buy' | 'sell', amount: number) => {
    if (!selectedStock) return;

    const stockPrice = parseFloat(selectedStock.price);
    const totalCost = stockPrice * amount;

    if (tradeType === 'buy') {
      if (balance < totalCost) {
        Alert.alert('Insufficient Balance', 'You do not have enough balance to make this purchase.');
        return;
      }

      setBalance(prevBalance => prevBalance - totalCost);
      setInvestments(prevInvestments => {
        const existingInvestment = prevInvestments.find(inv => inv.name === selectedStock.symbol);
        if (existingInvestment) {
          const newShares = existingInvestment.value / existingInvestment.purchasePrice + amount;
          const newValue = newShares * stockPrice;
          const newAveragePurchasePrice = newValue / newShares;
          return prevInvestments.map(inv =>
            inv.name === selectedStock.symbol
              ? { ...inv, value: newValue, purchasePrice: newAveragePurchasePrice }
              : inv
          );
        } else {
          return [...prevInvestments, { 
            name: selectedStock.symbol, 
            value: totalCost, 
            color: getRandomColor(),
            purchasePrice: stockPrice
          }];
        }
      });
    } else if (tradeType === 'sell') {
      const existingInvestment = investments.find(inv => inv.name === selectedStock.symbol);
      if (!existingInvestment || existingInvestment.value < totalCost) {
        Alert.alert('Insufficient Stocks', 'You do not have enough stocks to sell.');
        return;
      }

      setBalance(prevBalance => prevBalance + totalCost);
      setInvestments(prevInvestments =>
        prevInvestments.map(inv => {
          if (inv.name === selectedStock.symbol) {
            const newValue = inv.value - totalCost;
            return newValue > 0 ? { ...inv, value: newValue } : null;
          }
          return inv;
        }).filter((inv): inv is Investment => inv !== null)
      );
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: tradeType,
      stockSymbol: selectedStock.symbol,
      amount,
      price: stockPrice,
      date: new Date(),
    };
    setTransactions(prevTransactions => [...prevTransactions, newTransaction]);

    setTradeModalVisible(false);
  }, [balance, investments, selectedStock]);

  const getRandomColor = () => {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
  };

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [120, 80],
    extrapolate: 'clamp',
  });

  const handleStockDataUpdate = useCallback((newStockData: StockData[]) => {
    setStockData(newStockData);
    const prices: { [symbol: string]: number } = {};
    newStockData.forEach((stock) => {
      prices[stock.symbol] = parseFloat(stock.price);
    });
    setStockPrices(prices);
  }, []);

  const renderItem = useCallback(({ item }) => {
    switch (item.type) {
      case 'balance':
        return <BalanceCard balance={balance} />;
      case 'investments':
        return <InvestmentsCard investments={investments} stockData={stockPrices} />;
      case 'stocks':
        return (
          <StockDataCard 
            stockData={stockData} 
            onStockPress={(stock) => {
              setSelectedStock(stock);
              setTradeModalVisible(true);
            }}
            onStockDataUpdate={handleStockDataUpdate}
          />
        );
      case 'news':
        return <NewsCard newsItems={newsItems} />;
      default:
        return null;
    }
  }, [balance, investments, stockData, newsItems, handleStockDataUpdate, stockPrices]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <LinearGradient
          colors={['#2c3e50', '#34495e', '#2c3e50']}
          style={StyleSheet.absoluteFill}
        />
        <Animated.Text style={[styles.headerText, { fontSize: headerHeight.interpolate({
          inputRange: [80, 120],
          outputRange: [24, 32],
          extrapolate: 'clamp',
        }) }]}>
          Investment Dashboard
        </Animated.Text>
      </Animated.View>
      
      <FlatList
        data={[
          { type: 'balance', id: 'balance' },
          { type: 'investments', id: 'investments' },
          { type: 'stocks', id: 'stocks' },
          { type: 'news', id: 'news' },
        ]}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />

      <TradeModal
        visible={tradeModalVisible}
        onClose={() => setTradeModalVisible(false)}
        onTrade={handleTrade}
        stock={selectedStock}
        balance={balance}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
  },
  header: {
    justifyContent: 'flex-end',
    paddingBottom: 20,
    paddingHorizontal: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  scrollView: {
    paddingTop: 120,
    paddingHorizontal: 20,
  },
});

export default InvestmentScreen;