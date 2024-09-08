import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Animated } from 'react-native';
import { StockData } from '../types';
import { fetchStockData, fetchStockPrice } from '../api/dataFetchers';

interface StockDataCardProps {
  stockData: StockData[];
  onStockPress: (stock: StockData) => void;
  onStockDataUpdate: (newStockData: StockData[]) => void;
}

const StockDataCard: React.FC<StockDataCardProps> = ({ stockData, onStockPress, onStockDataUpdate }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newStockSymbol, setNewStockSymbol] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [refreshedMessageOpacity] = useState(new Animated.Value(0));

  useEffect(() => {
    if (lastRefreshed) {
      showRefreshedMessage();
    }
  }, [lastRefreshed]);

  const showRefreshedMessage = () => {
    Animated.sequence([
      Animated.timing(refreshedMessageOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(refreshedMessageOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const updatedStockData = await fetchStockData();
      onStockDataUpdate(updatedStockData);
      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Error refreshing stock data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddNewStock = async () => {
    if (newStockSymbol.trim()) {
      try {
        const newStockData = await fetchStockPrice(newStockSymbol.trim());
        if (newStockData) {
          onStockDataUpdate([...stockData, newStockData]);
          setNewStockSymbol('');
        }
      } catch (error) {
        console.error('Error adding new stock:', error);
      }
    }
  };

  const formatLastRefreshed = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.cardHeaderText}>Stock Data</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh} disabled={isRefreshing}>
          <Text style={styles.refreshButtonText}>{isRefreshing ? 'Refreshing...' : 'Refresh'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.refreshInfoContainer}>
        {lastRefreshed && (
          <Text style={styles.lastRefreshedText}>
            Last refreshed: {formatLastRefreshed(lastRefreshed)}
          </Text>
        )}
        <Animated.Text style={[styles.refreshedMessage, { opacity: refreshedMessageOpacity }]}>
          Prices Refreshed!
        </Animated.Text>
      </View>
      {stockData.map((stock, index) => (
        <TouchableOpacity key={index} style={styles.stockItem} onPress={() => onStockPress(stock)}>
          <View style={styles.stockInfo}>
            <Text style={styles.stockSymbol}>{stock.symbol}</Text>
            <Text style={styles.stockPrice}>
              ${typeof stock.price === 'number' ? stock.price.toFixed(2) : parseFloat(stock.price).toFixed(2)}
            </Text>
          </View>
          <View style={[
            styles.changeContainer, 
            typeof stock.change === 'number' 
              ? (stock.change >= 0 ? styles.positive : styles.negative) 
              : styles.neutral
          ]}>
            <Text style={styles.changeText}>
              {typeof stock.change === 'number' 
                  ? `${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}%`
                  : `${parseFloat(stock.change) >= 0 ? '+' : ''}${parseFloat(stock.change).toFixed(2)}%`
              }
            </Text>
          </View>
        </TouchableOpacity>
      ))}
      <View style={styles.addStockContainer}>
        <TextInput
          style={styles.input}
          value={newStockSymbol}
          onChangeText={setNewStockSymbol}
          placeholder="Enter stock symbol"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddNewStock}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  refreshButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  refreshInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  lastRefreshedText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  refreshedMessage: {
    fontSize: 12,
    color: '#27ae60',
    fontWeight: 'bold',
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#2c3e50',
  },
  stockPrice: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  changeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  positive: {
    backgroundColor: '#27ae60',
  },
  negative: {
    backgroundColor: '#c0392b',
  },
  neutral: {
    backgroundColor: '#95a5a6',
  },
  changeText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  addStockContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#bdc3c7',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default StockDataCard;