import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Investment } from '../types';

interface InvestmentsCardProps {
  investments: Investment[];
  stockData: { [symbol: string]: number }; // Current stock prices
}

const InvestmentsCard: React.FC<InvestmentsCardProps> = ({ investments, stockData }) => {
  const totalInvestmentValue = useMemo(() => {
    if (!investments || !stockData) return 0;
    return investments.reduce((total, investment) => {
      const currentPrice = stockData[investment.name] || investment.purchasePrice;
      const shares = investment.value / (investment.purchasePrice || 1);
      return total + (shares * currentPrice);
    }, 0);
  }, [investments, stockData]);

  const investmentData = useMemo(() => {
    if (!investments || !stockData || totalInvestmentValue === 0) return [];
    return investments.map((investment) => {
      const currentPrice = stockData[investment.name] || investment.purchasePrice;
      const shares = investment.value / (investment.purchasePrice || 1);
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

  if (!investments || investments.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardHeaderText}>Investments</Text>
        <Text style={styles.noInvestmentsText}>No investments yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardHeaderText}>Investments</Text>
      <View style={styles.chartContainer}>
        {investmentData.map((investment, index) => (
          <View 
            key={investment.name} 
            style={[
              styles.chartBar, 
              { 
                backgroundColor: investment.color,
                width: `${investment.percentage}%`,
                zIndex: investmentData.length - index,
              }
            ]} 
          />
        ))}
      </View>
      <ScrollView style={styles.investmentsList} nestedScrollEnabled={true}>
        {investmentData.map((investment, index) => (
          <View key={index} style={styles.investmentItem}>
            <View style={[styles.investmentColor, { backgroundColor: investment.color }]} />
            <View style={styles.investmentDetails}>
              <Text style={styles.investmentText}>{investment.name}</Text>
              <Text style={styles.investmentValue}>
                ${investment.currentValue.toFixed(2)} ({investment.shares.toFixed(2)} shares)
              </Text>
              <Text style={[
                styles.profitLoss,
                investment.profitLoss >= 0 ? styles.profit : styles.loss
              ]}>
                {investment.profitLoss >= 0 ? '+' : '-'}${Math.abs(investment.profitLoss).toFixed(2)} ({investment.profitLossPercentage.toFixed(2)}%)
              </Text>
            </View>
            <Text style={styles.percentage}>{investment.percentage.toFixed(1)}%</Text>
          </View>
        ))}
      </ScrollView>
      <Text style={styles.totalValue}>Total Value: ${totalInvestmentValue.toFixed(2)}</Text>
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
  cardHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  noInvestmentsText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  chartContainer: {
    height: 20,
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#ecf0f1',
    borderRadius: 10,
    overflow: 'hidden',
  },
  chartBar: {
    height: '100%',
  },
  investmentsList: {
    maxHeight: 200,
  },
  investmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  investmentColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  investmentDetails: {
    flex: 1,
  },
  investmentText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#34495e',
  },
  investmentValue: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  profitLoss: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  profit: {
    color: '#27ae60',
  },
  loss: {
    color: '#c0392b',
  },
  percentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#34495e',
    width: 50,
    textAlign: 'right',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#2c3e50',
  },
});

export default InvestmentsCard;