import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, Animated, SafeAreaView, Alert, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import BalanceCard from './components/BalanceCard';
import InvestmentsCard from './components/InvestmentsCard';
import StockDataCard from './components/StockDataCard';
import BondDataCard from './components/BondDataCard';
import MutualFundDataCard from './components/MutualFundDataCard';
import CryptoDataCard from './components/CryptoDataCard';
import NewsCard from './components/NewsCard';
import TradeModal from './components/TradeModal';
import { fetchStockData, fetchBondData, fetchMutualFundData, fetchCryptoData, fetchNews } from './api/dataFetchers';
import { generateMockPortfolioPerformance } from './utils/mockDataGenerator';
import { Investment, StockData, MutualFundData, CryptoData, NewsItem, Transaction, PortfolioPerformance } from './types';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.collapsibleSection}>
      <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={24} color="#2c3e50" />
      </TouchableOpacity>
      {isExpanded && children}
    </View>
  );
};

const InvestmentScreen: React.FC<InvestmentScreenProps> = () => {
  const [balance, setBalance] = useState(10000);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [bondData, setBondData] = useState<BondData[]>([]);
  const [mutualFundData, setMutualFundData] = useState<MutualFundData[]>([]);
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [scrollY] = useState(new Animated.Value(0));
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [portfolioPerformance, setPortfolioPerformance] = useState<PortfolioPerformance[]>([]);
  const [selectedInvestment, setSelectedInvestment] = useState<StockData | BondData | MutualFundData | CryptoData | null>(null);
  const [tradeModalVisible, setTradeModalVisible] = useState(false);
  const [investmentPrices, setInvestmentPrices] = useState<{ [symbol: string]: number }>({});

  useEffect(() => {
    fetchStockData().then(setStockData);
    fetchBondData().then(setBondData);
    fetchMutualFundData().then(setMutualFundData);
    fetchCryptoData().then(setCryptoData);
    fetchNews().then(setNewsItems);
    setPortfolioPerformance(generateMockPortfolioPerformance());
  }, []);

  useEffect(() => {
    const prices: { [symbol: string]: number } = {};
    [...stockData, ...bondData, ...mutualFundData, ...cryptoData].forEach((investment) => {
      prices[investment.symbol] = parseFloat(investment.price);
    });
    setInvestmentPrices(prices);
  }, [stockData, bondData, mutualFundData, cryptoData]);

  const handleTrade = useCallback((tradeType: 'buy' | 'sell', amount: number) => {
    if (!selectedInvestment) return;

    const investmentPrice = parseFloat(selectedInvestment.price);
    const totalCost = investmentPrice * amount;

    if (tradeType === 'buy') {
      if (balance < totalCost) {
        Alert.alert('Insufficient Balance', 'You do not have enough balance to make this purchase.');
        return;
      }

      setBalance(prevBalance => prevBalance - totalCost);
      setInvestments(prevInvestments => {
        const existingInvestment = prevInvestments.find(inv => inv.name === selectedInvestment.symbol);
        if (existingInvestment) {
          const newShares = existingInvestment.value / existingInvestment.purchasePrice + amount;
          const newValue = newShares * investmentPrice;
          const newAveragePurchasePrice = newValue / newShares;
          return prevInvestments.map(inv =>
            inv.name === selectedInvestment.symbol
              ? { ...inv, value: newValue, purchasePrice: newAveragePurchasePrice }
              : inv
          );
        } else {
          return [...prevInvestments, { 
            name: selectedInvestment.symbol, 
            value: totalCost, 
            color: getRandomColor(),
            purchasePrice: investmentPrice
          }];
        }
      });

      // Update the owned amount for the specific investment type
      const updateInvestmentData = (data: any[]) =>
        data.map(item =>
          item.symbol === selectedInvestment.symbol
            ? { ...item, owned: (item.owned || 0) + amount }
            : item
        );

      if ('sector' in selectedInvestment) {
        setStockData(updateInvestmentData);
      } else if ('yield' in selectedInvestment) {
        setBondData(updateInvestmentData);
      } else if ('category' in selectedInvestment) {
        setMutualFundData(updateInvestmentData);
      } else if ('marketCap' in selectedInvestment) {
        setCryptoData(updateInvestmentData);
      }

      setInvestmentPrices(prevPrices => ({
        ...prevPrices,
        [selectedInvestment.symbol]: investmentPrice
      }));
    } else if (tradeType === 'sell') {
      const existingInvestment = investments.find(inv => inv.name === selectedInvestment.symbol);
      if (!existingInvestment || existingInvestment.value < totalCost) {
        Alert.alert('Insufficient Investments', 'You do not have enough of this investment to sell.');
        return;
      }

      setBalance(prevBalance => prevBalance + totalCost);
      setInvestments(prevInvestments =>
        prevInvestments.map(inv => {
          if (inv.name === selectedInvestment.symbol) {
            const newValue = inv.value - totalCost;
            return newValue > 0 ? { ...inv, value: newValue } : null;
          }
          return inv;
        }).filter((inv): inv is Investment => inv !== null)
      );

      // Update the owned amount for the specific investment type
      const updateInvestmentData = (data: any[]) =>
        data.map(item =>
          item.symbol === selectedInvestment.symbol
            ? { ...item, owned: Math.max((item.owned || 0) - amount, 0) }
            : item
        );

      if ('sector' in selectedInvestment) {
        setStockData(updateInvestmentData);
      } else if ('yield' in selectedInvestment) {
        setBondData(updateInvestmentData);
      } else if ('category' in selectedInvestment) {
        setMutualFundData(updateInvestmentData);
      } else if ('marketCap' in selectedInvestment) {
        setCryptoData(updateInvestmentData);
      }
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: tradeType,
      investmentSymbol: selectedInvestment.symbol,
      amount,
      price: investmentPrice,
      date: new Date(),
    };
    setTransactions(prevTransactions => [...prevTransactions, newTransaction]);

    setTradeModalVisible(false);
  }, [balance, investments, selectedInvestment, setStockData, setBondData, setMutualFundData, setCryptoData, setInvestmentPrices]);

  const getRandomColor = () => {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
  };

  const handleInvestmentPress = useCallback((investment: StockData | BondData | MutualFundData | CryptoData) => {
    setSelectedInvestment(investment);
    setTradeModalVisible(true);
  }, []);

  const renderItem = useCallback(({ item }) => {
    switch (item.type) {
      case 'balance':
        return <BalanceCard balance={balance} />;
      case 'investments':
        return <InvestmentsCard investments={investments} stockData={investmentPrices} />;
      case 'stocks':
        return (
          <CollapsibleSection title="Stocks">
            <StockDataCard 
              stockData={stockData} 
              onStockPress={handleInvestmentPress}
            />
          </CollapsibleSection>
        );
      case 'bonds':
        return (
          <CollapsibleSection title="Bonds">
            <BondDataCard 
              bondData={bondData} 
              onBondPress={handleInvestmentPress}
            />
          </CollapsibleSection>
        );
      case 'mutualFunds':
        return (
          <CollapsibleSection title="Mutual Funds">
            <MutualFundDataCard 
              mutualFundData={mutualFundData} 
              onMutualFundPress={handleInvestmentPress}
            />
          </CollapsibleSection>
        );
      case 'crypto':
        return (
          <CollapsibleSection title="Cryptocurrencies">
            <CryptoDataCard 
              cryptoData={cryptoData} 
              onCryptoPress={handleInvestmentPress}
            />
          </CollapsibleSection>
        );
      case 'news':
        return (
          <CollapsibleSection title="News">
            <NewsCard newsItems={newsItems} />
          </CollapsibleSection>
        );
      default:
        return null;
    }
  }, [balance, investments, stockData, bondData, mutualFundData, cryptoData, newsItems, investmentPrices, handleInvestmentPress]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[
        styles.header,
        {
          height: scrollY.interpolate({
            inputRange: [0, 100],
            outputRange: [120, 80],
            extrapolate: 'clamp',
          }),
        },
      ]}>
        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={['rgba(44, 62, 80, 0.8)', 'rgba(52, 73, 94, 0.8)']}
            style={StyleSheet.absoluteFill}
          />
        </BlurView>
        <View style={styles.headerContent}>
          <Animated.Text style={[
            styles.headerText,
            {
              fontSize: scrollY.interpolate({
                inputRange: [0, 100],
                outputRange: [28, 20],
                extrapolate: 'clamp',
              }),
            },
          ]}>
            Investment Dashboard
          </Animated.Text>
          <Ionicons name="cash" size={30} color="#FFFFFF" />
        </View>
      </Animated.View>
      <FlatList
        data={[
          { type: 'balance', id: 'balance' },
          { type: 'investments', id: 'investments' },
          { type: 'stocks', id: 'stocks' },
          { type: 'bonds', id: 'bonds' },
          { type: 'mutualFunds', id: 'mutualFunds' },
          { type: 'crypto', id: 'crypto' },
          { type: 'news', id: 'news' },
        ]}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollView}
      />
      <TradeModal
        visible={tradeModalVisible}
        onClose={() => setTradeModalVisible(false)}
        onTrade={handleTrade}
        investment={selectedInvestment}
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
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerText: {
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'left',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
  scrollView: {
    paddingTop: 140,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  collapsibleSection: {
    marginBottom: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
});

export default InvestmentScreen;