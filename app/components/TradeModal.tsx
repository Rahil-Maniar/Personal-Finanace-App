import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { StockData } from '../types';

interface TradeModalProps {
  visible: boolean;
  onClose: () => void;
  onTrade: (tradeType: 'buy' | 'sell', amount: number) => void;
  stock: StockData | null;
  balance: number;
}

const TradeModal: React.FC<TradeModalProps> = ({ visible, onClose, onTrade, stock, balance }) => {
  const [amount, setAmount] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');

  const handleTrade = () => {
    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    onTrade(tradeType, parsedAmount);
    setAmount('');
  };

  const totalCost = stock ? stock.price * parseInt(amount || '0', 10) : 0;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{stock?.symbol} - ${stock?.price.toFixed(2)}</Text>
          <Text style={styles.balanceText}>Available Balance: ${balance.toFixed(2)}</Text>
          
          <View style={styles.tradeTypeContainer}>
            <TouchableOpacity
              style={[styles.tradeTypeButton, tradeType === 'buy' && styles.activeTradeType]}
              onPress={() => setTradeType('buy')}
            >
              <Text style={styles.tradeTypeText}>Buy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tradeTypeButton, tradeType === 'sell' && styles.activeTradeType]}
              onPress={() => setTradeType('sell')}
            >
              <Text style={styles.tradeTypeText}>Sell</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.input}
            onChangeText={setAmount}
            value={amount}
            placeholder="Enter amount"
            keyboardType="numeric"
          />
          
          <Text style={styles.totalCost}>Total Cost: ${totalCost.toFixed(2)}</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.tradeButton]}
            onPress={handleTrade}
          >
            <Text style={styles.textStyle}>{tradeType === 'buy' ? 'Buy' : 'Sell'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.closeButton]}
            onPress={onClose}
          >
            <Text style={styles.textStyle}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  balanceText: {
    fontSize: 16,
    marginBottom: 15,
  },
  tradeTypeContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  tradeTypeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: '#DDDDDD',
  },
  activeTradeType: {
    backgroundColor: '#2ecc71',
  },
  tradeTypeText: {
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    width: 200,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  totalCost: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginBottom: 10,
    minWidth: 100,
  },
  tradeButton: {
    backgroundColor: '#2196F3',
  },
  closeButton: {
    backgroundColor: '#FF6347',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },
});

export default TradeModal;
