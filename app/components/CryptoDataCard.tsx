import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Animated } from 'react-native';
import { CryptoData } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface CryptoDataCardProps {
  cryptoData: CryptoData[];
  onCryptoPress: (crypto: CryptoData) => void;
  onCryptoDataUpdate?: (newCryptoData: CryptoData[]) => void;
}

const CryptoDataCard: React.FC<CryptoDataCardProps> = ({ cryptoData, onCryptoPress, onCryptoDataUpdate }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
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
      // Implement crypto data refresh logic here
      // const updatedCryptoData = await fetchCryptoData();
      // if (onCryptoDataUpdate) {
      //   onCryptoDataUpdate(updatedCryptoData);
      // }
      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Error refreshing crypto data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatLastRefreshed = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderCryptoItem = ({ item }: { item: CryptoData }) => (
    <TouchableOpacity style={styles.cryptoItem} onPress={() => onCryptoPress(item)}>
      <View style={styles.cryptoInfo}>
        <Text style={styles.cryptoName}>{item.name}</Text>
        <Text style={styles.cryptoSymbol}>{item.symbol}</Text>
      </View>
      <View style={styles.cryptoPriceInfo}>
        <Text style={styles.cryptoPrice}>${item.price}</Text>
        <View style={[styles.changeContainer, item.change >= 0 ? styles.positive : styles.negative]}>
          <Text style={styles.changeText}>
            {item.change >= 0 ? '+' : ''}{item.change}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.cardHeaderText}>Crypto Data</Text>
        <TouchableOpacity style={styles.iconButton} onPress={handleRefresh} disabled={isRefreshing}>
          <Ionicons name="refresh" size={24} color={isRefreshing ? "#bdc3c7" : "#3498db"} />
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
      <FlatList
        data={cryptoData}
        renderItem={renderCryptoItem}
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
  iconButton: {
    padding: 5,
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
  cryptoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  cryptoInfo: {
    flex: 1,
  },
  cryptoName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  cryptoSymbol: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  cryptoPriceInfo: {
    alignItems: 'flex-end',
  },
  cryptoPrice: {
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
  changeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
});

export default CryptoDataCard;