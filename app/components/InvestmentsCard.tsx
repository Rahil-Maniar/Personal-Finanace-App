import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Define the shape of an individual investment
export interface Investment {
  name: string;
  value: number;
  color: string;
  purchasePrice: number;
}

// Define the props for the InvestmentsCard component
interface InvestmentsCardProps {
  investments: Investment[];
  stockData: { [symbol: string]: number };
  onInvestmentPress?: (investment: Investment) => void;
}

const InvestmentsCard: React.FC<InvestmentsCardProps> = ({ 
  investments, 
  stockData, 
  onInvestmentPress 
}) => {
  // Calculate the total value of all investments
  const totalInvestmentValue = useMemo(() => {
    return investments.reduce((total, investment) => {
      const currentPrice = stockData[investment.name] || investment.purchasePrice;
      return total + (investment.value / investment.purchasePrice * currentPrice);
    }, 0);
  }, [investments, stockData]);

  // Prepare the investment data for rendering
  const investmentData = useMemo(() => {
    if (totalInvestmentValue === 0) return [];
    return investments.map((investment) => {
      const currentPrice = stockData[investment.name] || investment.purchasePrice;
      const shares = investment.value / investment.purchasePrice;
      const currentValue = shares * currentPrice;
      const percentage = (currentValue / totalInvestmentValue) * 100;
      const profitLoss = currentValue - investment.value;
      const profitLossPercentage = (profitLoss / investment.value) * 100;

      return {
        ...investment,
        currentValue,
        shares,
        percentage,
        profitLoss,
        profitLossPercentage
      };
    }).sort((a, b) => b.currentValue - a.currentValue);
  }, [investments, stockData, totalInvestmentValue]);

  // Render an individual investment item
  const renderInvestmentItem = useCallback((investment: ReturnType<typeof investmentData>[number]) => (
    <TouchableOpacity 
      key={investment.name} 
      style={styles.investmentItem}
      onPress={() => onInvestmentPress && onInvestmentPress(investment)}
    >
      <LinearGradient
        colors={[investment.color, investment.color + '80']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.investmentGradient}
      >
        <View style={styles.investmentHeader}>
          <Text style={styles.investmentSymbol}>{investment.name}</Text>
          <Text style={styles.investmentShares}>{investment.shares.toFixed(2)} shares</Text>
        </View>
        <View style={styles.investmentBody}>
          <Text style={styles.investmentValue}>${investment.currentValue.toFixed(2)}</Text>
          <Text style={[
            styles.investmentPercentage,
            { color: investment.profitLoss >= 0 ? '#27ae60' : '#e74c3c' }
          ]}>
            {investment.profitLoss >= 0 ? '▲' : '▼'} {Math.abs(investment.profitLossPercentage).toFixed(2)}%
          </Text>
        </View>
        <View style={styles.investmentFooter}>
          <Text style={styles.investmentProfitLoss}>
            {investment.profitLoss >= 0 ? '+' : '-'}${Math.abs(investment.profitLoss).toFixed(2)}
          </Text>
          <Text style={styles.investmentAllocation}>
            {investment.percentage.toFixed(1)}% of portfolio
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  ), [onInvestmentPress]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Your Investments</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#2c3e50" />
        </TouchableOpacity>
      </View>
      <View style={styles.totalValue}>
        <Text style={styles.totalValueLabel}>Total Value</Text>
        <Text style={styles.totalValueAmount}>${totalInvestmentValue.toFixed(2)}</Text>
      </View>
      {investmentData.length === 0 ? (
        <Text style={styles.noInvestmentsText}>No investments yet. Start investing!</Text>
      ) : (
        <ScrollView 
          style={styles.investmentsList}
          showsVerticalScrollIndicator={false}
        >
          {investmentData.map(renderInvestmentItem)}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  moreButton: {
    padding: 5,
  },
  totalValue: {
    marginBottom: 20,
  },
  totalValueLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  totalValueAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  noInvestmentsText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 20,
  },
  investmentsList: {
    maxHeight: 400,
  },
  investmentItem: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  investmentGradient: {
    padding: 15,
  },
  investmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  investmentSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  investmentShares: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  investmentBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  investmentValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  investmentPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  investmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  investmentProfitLoss: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  investmentAllocation: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
  },
});

export default InvestmentsCard;