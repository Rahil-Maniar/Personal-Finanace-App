import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Animated } from 'react-native';
import { BondData } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface BondDataCardProps {
  bondData: BondData[];
  onBondPress: (bond: BondData) => void;
  onBondDataUpdate?: (newBondData: BondData[]) => void;
}

const BondDataCard: React.FC<BondDataCardProps> = ({ bondData, onBondPress, onBondDataUpdate }) => {
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
      // Implement bond data refresh logic here
      // const updatedBondData = await fetchBondData();
      // if (onBondDataUpdate) {
      //   onBondDataUpdate(updatedBondData);
      // }
      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Error refreshing bond data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatLastRefreshed = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderBondItem = ({ item }: { item: BondData }) => (
    <TouchableOpacity style={styles.bondItem} onPress={() => onBondPress(item)}>
      <View style={styles.bondInfo}>
        <Text style={styles.bondName}>{item.name}</Text>
        <Text style={styles.bondSymbol}>{item.symbol}</Text>
      </View>
      <View style={styles.bondDetailsInfo}>
        <Text style={styles.bondYield}>{item.yield}%</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.bondPrice}>${item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.cardHeaderText}>Bond Data</Text>
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
        data={bondData}
        renderItem={renderBondItem}
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
  bondItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  bondInfo: {
    flex: 1,
  },
  bondName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  bondSymbol: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  bondDetailsInfo: {
    alignItems: 'flex-end',
  },
  bondYield: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  priceContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#e6f9ee',
  },
  bondPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#27ae60',
  },
});

export default BondDataCard;