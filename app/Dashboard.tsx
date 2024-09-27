import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Alert, Image, Dimensions, TouchableOpacity } from 'react-native';
import { TextInput, Button, Card, Title, Paragraph, Modal, Portal, Provider as PaperProvider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { LinearGradient } from 'expo-linear-gradient';

import logo from '../assets/images/logo.png';

const { width } = Dimensions.get('window');

const theme = {
  colors: {
    primary: '#6200EE',
    accent: '#03DAC6',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#212121',
    error: '#B00020',
    income: '#4CAF50',
    expense: '#F44336',
  },
  roundness: 12,
};

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

  type DashboardNavigationProp = StackNavigationProp<RootStackParamList, 'InvestmentScreen'>;

  const navigation = useNavigation<DashboardNavigationProp>();
  
  const navigateToInvestmentScreen = () => {
    navigation.navigate('InvestmentScreen', { availableFunds: savings });
  };

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

  const navigateToSavingsScreen = () => {
    router.push({
      pathname: '/SavingsScreen',
      params: { 
        currentSavings: savings,
        totalIncome: totalIncome,
        fixedIncome: fixedIncome,
        variableIncome: variableIncome,
        totalExpenses: totalExpenses,
        transactions: JSON.stringify(transactions)
      },
    });
  };

  const navigateToIncomeScreen = () => {
    router.push({
      pathname: '/IncomeScreen',
      params: {
        totalIncome: totalIncome,
        fixedIncome: fixedIncome,
        variableIncome: variableIncome,
        transactions: JSON.stringify(transactions.filter(t => t.type === 'Income'))
      }
    });
  };

  const navigateToExpensesScreen = () => {
    router.push({
      pathname: '/ExpensesScreen',
      params: {
        totalExpenses: totalExpenses,
        transactions: JSON.stringify(transactions.filter(t => t.type === 'Expense'))
      }
    });
  };

  const renderTransactionItem = ({ item }) => (
    <Card style={styles.transactionItem}>
      <Card.Content>
        <View style={styles.transactionHeader}>
          <Icon
            name={item.type === 'Income' ? 'cash-plus' : 'cash-minus'}
            size={24}
            color={item.type === 'Income' ? theme.colors.income : theme.colors.expense}
          />
          <Title style={styles.transactionLabel}>{item.label}</Title>
        </View>
        <Paragraph style={styles.transactionDetails}>
          {`${item.type} - ${item.source}: $${item.amount.toFixed(2)}`}
        </Paragraph>
        <View style={styles.actionButtons}>
          <Button
            icon="pencil"
            mode="outlined"
            onPress={() => handleEditTransaction(item)}
            style={styles.editButton}
            labelStyle={styles.buttonLabel}
          >
            Edit
          </Button>
          <Button
            icon="delete"
            mode="outlined"
            onPress={() => handleDeleteTransaction(item.id)}
            style={styles.deleteButton}
            labelStyle={styles.buttonLabel}
          >
            Delete
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderInvestmentCard = () => (
    <TouchableOpacity onPress={navigateToInvestmentScreen}>
      <Card style={[styles.investmentCard, styles.cardShadow]}>
        <LinearGradient
          colors={['#00BCD4', '#0288D1', '#01579B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        >
          <Card.Content style={styles.investmentCardContent}>
            <View style={styles.investmentIconContainer}>
              <Icon name="chart-line-variant" size={48} color="#FFFFFF" />
            </View>
            <View style={styles.investmentTextContainer}>
              <Title style={styles.investmentCardTitle}>Investments</Title>
              <Paragraph style={styles.investmentCardAmount}>
                Available Funds: $10000
              </Paragraph>
              <View style={styles.investmentCardButton}>
                <Icon name="arrow-right" size={24} color="#FFFFFF" />
              </View>
            </View>
          </Card.Content>
        </LinearGradient>
      </Card>
    </TouchableOpacity>
  );

  return (
    <PaperProvider theme={theme}>
      <StatusBar style="auto" hidden={true}/>
      <View style={styles.container}>
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTransactionItem}
          ListHeaderComponent={
            <View style={styles.headerContainer}>
              <View style={styles.header}>
                <Image source={logo} style={styles.logoImage} />
                <Title style={styles.headerText}>Bachat</Title>
              </View>
              <Card style={styles.balanceCard} onPress={navigateToSavingsScreen}>
                <Card.Content style={styles.balanceContent}>
                  <Icon name="bank" size={36} color={theme.colors.income} style={styles.iconSpacing} />
                  <View>
                    <Title style={styles.balanceTitle}>Current Savings</Title>
                    <Paragraph style={styles.balanceAmount}>${savings.toFixed(2)}</Paragraph>
                  </View>
                </Card.Content>
              </Card>

              <View style={styles.incomeExpenseContainer}>
                <Card style={styles.incomeCard} onPress={navigateToIncomeScreen}>
                  <Card.Content style={styles.cardContent}>
                    <Icon name="cash" size={36} color={theme.colors.income} style={styles.iconSpacing} />
                    <View>
                      <Title style={styles.cardTitle}>Total Income</Title>
                      <Paragraph style={styles.cardAmount}>${totalIncome.toFixed(2)}</Paragraph>
                      <Paragraph style={styles.cardDetails}>Fixed: ${fixedIncome.toFixed(2)}</Paragraph>
                      <Paragraph style={styles.cardDetails}>Variable: ${variableIncome.toFixed(2)}</Paragraph>
                    </View>
                  </Card.Content>
                </Card>
                <Card style={styles.expenseCard} onPress={navigateToExpensesScreen}>
                  <Card.Content style={styles.cardContent}>
                    <Icon name="cash-minus" size={36} color={theme.colors.expense} style={styles.iconSpacing} />
                    <View>
                      <Title style={styles.cardTitle}>Total Expenses</Title>
                      <Paragraph style={styles.cardAmount}>${totalExpenses.toFixed(2)}</Paragraph>
                    </View>
                  </Card.Content>
                </Card>
              </View>

              {renderInvestmentCard()}

              <Button
                mode="contained"
                onPress={() => setModalVisible(true)}
                style={styles.addButton}
                icon="plus-circle"
                labelStyle={styles.buttonLabel}
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
              <Button mode={transactionType === 'Income' ? 'contained' : 'outlined'} onPress={() => setTransactionType('Income')} style={styles.transactionButton}>
                Income
              </Button>
              <Button mode={transactionType === 'Expense' ? 'contained' : 'outlined'} onPress={() => setTransactionType('Expense')} style={styles.transactionButton}>
                Expense
              </Button>
            </View>
            {transactionType === 'Income' && (
              <View style={styles.buttonGroup}>
                <Button mode={sourceType === 'Fixed' ? 'contained' : 'outlined'} onPress={() => setSourceType('Fixed')} style={styles.transactionButton}>
                  Fixed
                </Button>
                <Button mode={sourceType === 'Variable' ? 'contained' : 'outlined'} onPress={() => setSourceType('Variable')} style={styles.transactionButton}>
                  Variable
                </Button>
              </View>
            )}
            <Button mode="contained" onPress={handleAddOrUpdateTransaction} style={styles.saveButton}>
              {editingTransaction ? 'Update' : 'Add'} Transaction
            </Button>
          </Modal>
        </Portal>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECEFF1',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerContainer: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },balanceCard: {
    backgroundColor: '#E8F5E9',
    marginBottom: 16,
    padding: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  balanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingTop: 6,
  },
  incomeExpenseContainer: {
    marginBottom: 16,
  },
  incomeCard: {
    backgroundColor: '#E3F2FD',
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  expenseCard: {
    backgroundColor: '#FFEBEE',
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSpacing: {
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDetails: {
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#2196F3',
    marginTop: 16,
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
  },
  transactionItem: {
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionLabel: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionDetails: {
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    borderColor: '#64B5F6',
  },
  deleteButton: {
    borderColor: '#E57373',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 8,
  },
  dropDownContainer: {
    borderColor: '#212121',
    borderWidth: 1,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  transactionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  investmentCard: {
    marginVertical: 16,
    borderRadius: 15,
    overflow: 'hidden',
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  gradientBackground: {
    borderRadius: 15,
  },
  investmentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  investmentIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    padding: 12,
    marginRight: 16,
  },
  investmentTextContainer: {
    flex: 1,
  },
  investmentCardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  investmentCardAmount: {
    fontSize: 16,
    color: '#E0E0E0',
  },
  investmentCardButton: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
});