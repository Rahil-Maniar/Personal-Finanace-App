import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Animated } from 'react-native';
import { MutualFundData } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface MutualFundDataCardProps {
  mutualFundData: MutualFundData[];
  onMutualFundPress: (mutualFund: MutualFundData) => void;
  onMutualFundDataUpdate?: (newMutualFundData: MutualFundData[]) => void;
}

const MutualFundDataCard: React.FC<MutualFundDataCardProps> = ({ mutualFundData, onMutualFundPress, onMutualFundDataUpdate }) => {
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
      // Implement mutual fund data refresh logic here
      // const updatedMutualFundData = await fetchMutualFundData();
      // if (onMutualFundDataUpdate) {
      //   onMutualFundDataUpdate(updatedMutualFundData);
      // }
      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Error refreshing mutual fund data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatLastRefreshed = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMutualFundItem = ({ item }: { item: MutualFundData }) => (
    <TouchableOpacity style={styles.fundItem} onPress={() => onMutualFundPress(item)}>
      <View style={styles.fundInfo}>
        <Text style={styles.fundName}>{item.name}</Text>
        <Text style={styles.fundSymbol}>{item.symbol}</Text>
      </View>
      <View style={styles.fundDetailsInfo}>
        <Text style={styles.fundNAV}>${item.nav}</Text>
        <View style={styles.expenseRatioContainer}>
          <Text style={styles.expenseRatioText}>{item.expenseRatio}% ER</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.cardHeaderText}>Mutual Fund Data</Text>
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
        data={mutualFundData}
        renderItem={renderMutualFundItem}
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
  fundItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  fundInfo: {
    flex: 1,
  },
  fundName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  fundSymbol: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  fundDetailsInfo: {
    alignItems: 'flex-end',
  },
  fundNAV: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  expenseRatioContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#e8f4fd',
  },
  expenseRatioText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3498db',
  },
});

export default MutualFundDataCard;