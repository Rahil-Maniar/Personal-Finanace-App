import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface BalanceCardProps {
  balance: number;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ balance }) => (
  <LinearGradient colors={['#3498db', '#2980b9']} style={styles.card}>
    <View style={styles.cardContent}>
      <View>
        <Text style={styles.cardHeaderText}>Current Balance</Text>
        <Text style={styles.balanceText}>${balance.toFixed(2)}</Text>
      </View>
      <View style={styles.iconContainer}>
        <Ionicons name="wallet-outline" size={40} color="#FFF" />
      </View>
    </View>
  </LinearGradient>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  balanceText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 5,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    padding: 10,
  },
});

export default BalanceCard;