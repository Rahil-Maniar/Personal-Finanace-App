import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Alert, Image } from 'react-native';
import { TextInput, Button, Card, Title, Paragraph, Modal, Portal } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import logo from '../assets/images/logo.png';

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [transactionType, setTransactionType] = useState('Income');
  const [sourceType, setSourceType] = useState('Fixed');
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isDropDownOpen, setDropDownOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const savedTransactions = await AsyncStorage.getItem('transactions');
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const saveTransactions = async (updatedTransactions) => {
    try {
      await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  };

  const fixedIncomeItems = ['Salary', 'Rental Income', 'Custom'];
  const variableIncomeItems = ['Freelance', 'Investments', 'Custom'];
  const expenseItems = ['Rent', 'Groceries', 'Utilities', 'Custom'];

  const getDropDownItems = () =>
    transactionType === 'Income'
      ? sourceType === 'Fixed'
        ? fixedIncomeItems
        : variableIncomeItems
      : expenseItems;

  const handleAddOrUpdateTransaction = () => {
    if (!amount || (!label && customLabel === '')) {
      return Alert.alert('Error', 'Please fill out all fields.');
    }

    const newTransaction = {
      id: editingTransaction ? editingTransaction.id : Date.now(),
      type: transactionType,
      source: sourceType,
      amount: parseFloat(amount),
      label: label === 'Custom' ? customLabel : label,
      date: new Date().toISOString(),
    };

    const updatedTransactions = editingTransaction
      ? transactions.map(t => (t.id === editingTransaction.id ? newTransaction : t))
      : [...transactions, newTransaction];

    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);

    setAmount('');
    setLabel('');
    setCustomLabel('');
    setEditingTransaction(null);
    setModalVisible(false);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setTransactionType(transaction.type);
    setSourceType(transaction.source);
    setAmount(transaction.amount.toString());
    setLabel(transaction.label === 'Custom' ? '' : transaction.label);
    setCustomLabel(transaction.label === 'Custom' ? transaction.label : '');
    setModalVisible(true);
  };

  const handleDeleteTransaction = (id) =>
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: () => {
          const updatedTransactions = transactions.filter(t => t.id !== id);
          setTransactions(updatedTransactions);
          saveTransactions(updatedTransactions);
        }
      },
    ]);

  const calculateTotal = (type, source = null) =>
    transactions
      .filter(transaction => transaction.type === type && (source ? transaction.source === source : true))
      .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalIncome = calculateTotal('Income');
  const fixedIncome = calculateTotal('Income', 'Fixed');
  const variableIncome = calculateTotal('Income', 'Variable');
  const totalExpenses = calculateTotal('Expense');
  const savings = totalIncome - totalExpenses;

  const renderTransactionItem = ({ item }) => (
    <Card style={[styles.transactionItem, { backgroundColor: '#333' }]}>
      <Card.Content>
        <Paragraph style={[styles.darkText, { color: '#FFFFFF' }]} numberOfLines={2} ellipsizeMode="tail">
          <Icon name={item.type === 'Income' ? 'cash' : 'cash-minus'} size={20} style={styles.iconSpacing} />
          {`${item.label}: ${item.type} - ${item.source}: $${item.amount.toFixed(2)}`}
        </Paragraph>
        <View style={styles.actionButtons}>
          <Button icon="pencil" mode="outlined" onPress={() => handleEditTransaction(item)} style={styles.editButton}>
            Edit
          </Button>
          <Button icon="delete" mode="outlined" onPress={() => handleDeleteTransaction(item.id)} style={styles.deleteButton}>
            Delete
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTransactionItem}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <View style={styles.header}>
              <Image source={logo} style={styles.logoImage} />
              <Title style={[styles.headerText, styles.darkText]}>Bachat</Title>
            </View>
            <Card style={styles.balanceCard} onPress={() => router.push({ pathname: '/SavingsScreen', params: { currentSavings: savings } })}>
              <Card.Content style={styles.balanceContent}>
                <Icon name="bank" size={30} color="#4CAF50" style={styles.iconSpacing} />
                <View>
                  <Title style={styles.darkText}>Current Savings</Title>
                  <Paragraph style={[styles.balanceAmount, styles.darkText]}>${savings.toFixed(2)}</Paragraph>
                </View>
              </Card.Content>
            </Card>
            <View style={styles.incomeExpenseContainer}>
              <Card style={[styles.incomeCard, styles.incomecard]} onPress={() => router.push({ pathname: '/IncomeScreen', params: { totalIncome, fixedIncome, variableIncome, transactions: transactions.filter(t => t.type === 'Income') } })}>
                <Card.Content style={styles.cardContent}>
                  <Icon name="cash" size={30} color="#2196F3" style={styles.iconSpacing} />
                  <View>
                    <Title style={styles.darkText}>Total Income</Title>
                    <Paragraph style={[styles.cardAmount, styles.darkText]}>${totalIncome.toFixed(2)}</Paragraph>
                    <Paragraph style={styles.darkText}>Fixed: ${fixedIncome.toFixed(2)}</Paragraph>
                    <Paragraph style={styles.darkText}>Variable: ${variableIncome.toFixed(2)}</Paragraph>
                  </View>
                </Card.Content>
              </Card>
              <Card style={[styles.expenseCard, styles.expenseCard]} onPress={() => router.push({ pathname: '/ExpensesScreen', params: { totalExpenses, transactions: transactions.filter(t => t.type === 'Expense') } })}>
                <Card.Content style={styles.cardContent}>
                  <Icon name="cash-minus" size={30} color="#F44336" style={styles.iconSpacing} />
                  <View>
                    <Title style={styles.darkText}>Total Expenses</Title>
                    <Paragraph style={[styles.cardAmount, styles.darkText]}>${totalExpenses.toFixed(2)}</Paragraph>
                  </View>
                </Card.Content>
              </Card>
            </View>
            <Button
              mode="contained"
              onPress={() => setModalVisible(true)}
              style={styles.addButton}
              icon="plus-circle"
            >
              Add Transaction
            </Button>
          </View>
        }
      />

      <Portal>
        <Modal visible={isModalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          <DropDownPicker
            open={isDropDownOpen}
            value={label}
            items={getDropDownItems().map(item => ({ label: item, value: item }))}
            setOpen={setDropDownOpen}
            setValue={setLabel}
            placeholder="Select or type a label"
            dropDownContainerStyle={styles.dropDownContainer}
            zIndex={3000}
            zIndexInverse={1000}
          />
          {label === 'Custom' && (
            <TextInput
              label="Custom Label"
              value={customLabel}
              onChangeText={setCustomLabel}
              style={styles.input}
              mode="outlined"
              placeholder="Enter a custom label"
              placeholderTextColor="#212121"
            />
          )}
          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            placeholder="Enter the amount"
            placeholderTextColor="#212121"
          />
          <View style={styles.buttonGroup}>
            <Button mode={transactionType === 'Income' ? 'contained' : 'outlined'} onPress={() => setTransactionType('Income')} style={transactionType === 'Income' && styles.activeButton}>
              Income
            </Button>
            <Button mode={transactionType === 'Expense' ? 'contained' : 'outlined'} onPress={() => setTransactionType('Expense')} style={transactionType === 'Expense' && styles.activeButton}>
              Expense
            </Button>
          </View>
          {transactionType === 'Income' && (
            <View style={styles.buttonGroup}>
              <Button mode={sourceType === 'Fixed' ? 'contained' : 'outlined'} onPress={() => setSourceType('Fixed')} style={sourceType === 'Fixed' && styles.activeButton}>
                Fixed
              </Button>
              <Button mode={sourceType === 'Variable' ? 'contained' : 'outlined'} onPress={() => setSourceType('Variable')} style={sourceType === 'Variable' && styles.activeButton}>
                Variable
              </Button>
            </View>
          )}
          <Button mode="contained" onPress={handleAddOrUpdateTransaction} style={styles.saveButton}>
            {editingTransaction ? 'Update Transaction' : 'Save Transaction'}
          </Button>
        </Modal>
      </Portal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoImage: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  balanceCard: {
    backgroundColor: '#E8F5E9',
    marginBottom: 16,
    overflow: 'hidden', // Ensures content stays within the card
  },
  balanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingTop: 6,
  },
  incomeExpenseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 5,
  },
  expenseCard: {
    flex: 1,
    backgroundColor: '#FFEBEE',
    marginLeft: 5,
    padding: 10,
    borderRadius: 8,
    overflow: 'hidden', // Ensures content stays within the card
  },
  incomeCard: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    marginRight: 5,
    padding: 10,
    borderRadius: 8,
    overflow: 'hidden', // Ensures content stays within the card
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    flexShrink: 1, // Ensures the text shrinks if necessary
  },
  addButton: {
    marginTop: 16,
  },
  darkText: {
    color: 'black',
    flexShrink: 1, // Ensures the text container shrinks if needed
    flexWrap: 'wrap', // Allows text to wrap within its container
  },
  iconSpacing: {
    marginRight: 8,
  },
  transactionItem: {
    marginBottom: 16,
    padding: 10,
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  editButton: {
    marginRight: 8,
  },
  deleteButton: {
    borderColor: '#F44336',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 20,
    color: '#212121',
  },
  input: {
    marginBottom: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  activeButton: {
    backgroundColor: '#4CAF50',
  },
  saveButton: {
    marginTop: 16,
  },
  dropDownContainer: {
    marginBottom: 16,
    zIndex: 1000,
  },
});
