import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Animated, FlatList } from 'react-native';
import { StockData } from '../types';
import { fetchStockData, fetchStockPrice } from '../api/dataFetchers';
import { Ionicons } from '@expo/vector-icons';

interface StockDataCardProps {
  stockData: StockData[];
  onStockPress: (stock: StockData) => void;
  onStockDataUpdate?: (newStockData: StockData[]) => void;
}

const StockDataCard: React.FC<StockDataCardProps> = ({ stockData, onStockPress, onStockDataUpdate }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newStockSymbol, setNewStockSymbol] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [refreshedMessageOpacity] = useState(new Animated.Value(0));
  const [addStockVisible, setAddStockVisible] = useState(false);

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
      if (onStockDataUpdate) {
        onStockDataUpdate(updatedStockData);
      }
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
        if (newStockData && onStockDataUpdate) {
          onStockDataUpdate([newStockData]);
          setNewStockSymbol('');
          setAddStockVisible(false);
        }
      } catch (error) {
        console.error('Error adding new stock:', error);
      }
    }
  };

  const formatLastRefreshed = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderStockItem = ({ item }: { item: StockData }) => (
    <TouchableOpacity style={styles.stockItem} onPress={() => onStockPress(item)}>
      <View style={styles.stockInfo}>
        <Text style={styles.stockSymbol}>{item.symbol}</Text>
        <Text style={styles.stockName} numberOfLines={1}>{item.name}</Text>
      </View>
      <View style={styles.stockPriceInfo}>
        <Text style={styles.stockPrice}>
          ${typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(item.price).toFixed(2)}
        </Text>
        <View style={[
          styles.changeContainer, 
          typeof item.change === 'number' 
            ? (item.change >= 0 ? styles.positive : styles.negative) 
            : styles.neutral
        ]}>
          <Text style={styles.changeText}>
            {typeof item.change === 'number' 
                ? `${item.change >= 0 ? '+' : ''}${item.change.toFixed(2)}%`
                : `${parseFloat(item.change) >= 0 ? '+' : ''}${parseFloat(item.change).toFixed(2)}%`
            }
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.cardHeaderText}>Stock Data</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setAddStockVisible(!addStockVisible)}>
            <Ionicons name={addStockVisible ? "remove" : "add"} size={24} color="#3498db" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleRefresh} disabled={isRefreshing}>
            <Ionicons name="refresh" size={24} color={isRefreshing ? "#bdc3c7" : "#3498db"} />
          </TouchableOpacity>
        </View>
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
      {addStockVisible && (
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
      )}
      <FlatList
        data={stockData}
        renderItem={renderStockItem}
        keyExtractor={(item) => item.symbol}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 5,
    marginLeft: 10,
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
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  stockInfo: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  stockName: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  stockPriceInfo: {
    alignItems: 'flex-end',
  },
  stockPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  changeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  positive: {
    backgroundColor: '#e6f9ee',
  },
  negative: {
    backgroundColor: '#fde7e7',
  },
  neutral: {
    backgroundColor: '#f0f0f0',
  },
  changeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  addStockContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
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