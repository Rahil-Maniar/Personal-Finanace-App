import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface BalanceCardProps {
  balance: number;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ balance }) => (
  <LinearGradient
    colors={['#2c3e50', '#3498db']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.card}
  >
    <View style={styles.cardContent}>
      <View>
        <Text style={styles.cardHeaderText}>Current Balance</Text>
        <Text style={styles.balanceText}>${balance.toFixed(2)}</Text>
      </View>
      <View style={styles.iconContainer}>
        <Ionicons name="wallet" size={40} color="#ecf0f1" />
      </View>
    </View>
    <View style={styles.cardFooter}>
      <Text style={styles.footerText}>Last updated: Today</Text>
      <View style={styles.chipContainer}>
        <Text style={styles.chipText}>Active</Text>
      </View>
    </View>
  </LinearGradient>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#bdc3c7',
    marginBottom: 8,
  },
  balanceText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ecf0f1',
    letterSpacing: 1,
  },
  iconContainer: {
    backgroundColor: 'rgba(236, 240, 241, 0.1)',
    borderRadius: 50,
    padding: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#bdc3c7',
  },
  chipContainer: {
    backgroundColor: '#27ae60',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ecf0f1',
  },
});

export default BalanceCard;