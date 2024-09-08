import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';

const theme = {
  primary: '#4CAF50',
  secondary: '#FFC107',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  error: '#FF5252',
  text: '#333333',
  textLight: '#666666',
  border: '#E0E0E0',
};

type RootStackParamList = {
  SavingsScreen: undefined;
  InvestmentScreen: { availableFunds: number };
};

type SavingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SavingsScreen'>;

export default function SavingsScreen() {
  const navigation = useNavigation<SavingsScreenNavigationProp>();
  
  const [currentSavings, setCurrentSavings] = useState(0);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [addSavingsModalVisible, setAddSavingsModalVisible] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [savingsAmount, setSavingsAmount] = useState('');
  const [editGoalModalVisible, setEditGoalModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedGoals = await AsyncStorage.getItem('savingsGoals');
      const savedTransactions = await AsyncStorage.getItem('recentTransactions');
      const savedCurrentSavings = await AsyncStorage.getItem('currentSavings');

      if (savedGoals) setSavingsGoals(JSON.parse(savedGoals));
      if (savedTransactions) setRecentTransactions(JSON.parse(savedTransactions));
      if (savedCurrentSavings) {
        const parsedSavings = parseFloat(savedCurrentSavings);
        setCurrentSavings(isNaN(parsedSavings) ? 0 : parsedSavings);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('savingsGoals', JSON.stringify(savingsGoals));
      await AsyncStorage.setItem('recentTransactions', JSON.stringify(recentTransactions));
      await AsyncStorage.setItem('currentSavings', currentSavings.toString());
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const addNewGoal = () => {
    if (!newGoalName || !newGoalTarget) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    const newGoal = {
      id: Date.now().toString(),
      name: newGoalName,
      target: parseFloat(newGoalTarget),
      saved: 0,
      icon: 'savings',
    };

    setSavingsGoals([...savingsGoals, newGoal]);
    setNewGoalName('');
    setNewGoalTarget('');
    setModalVisible(false);
    saveData();
  };

  const editGoal = () => {
    if (!editingGoal.name || !editingGoal.target) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    const updatedGoals = savingsGoals.map(goal =>
      goal.id === editingGoal.id ? { ...goal, name: editingGoal.name, target: parseFloat(editingGoal.target) } : goal
    );

    setSavingsGoals(updatedGoals);
    setEditGoalModalVisible(false);
    setEditingGoal(null);
    saveData();
  };

  const deleteGoal = (goalId) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => {
            const updatedGoals = savingsGoals.filter(goal => goal.id !== goalId);
            setSavingsGoals(updatedGoals);
            saveData();
          },
          style: 'destructive'
        },
      ]
    );
  };

  const addSavings = () => {
    const amount = parseFloat(savingsAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    if (amount > currentSavings) {
      Alert.alert('Error', 'Insufficient savings to allocate.');
      return;
    }

    const updatedGoals = savingsGoals.map(goal =>
      goal.id === selectedGoalId ? { ...goal, saved: goal.saved + amount } : goal
    );

    const newTransaction = {
      id: Date.now().toString(),
      label: `Savings added to ${savingsGoals.find(goal => goal.id === selectedGoalId).name}`,
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      type: 'Expense'
    };

    setSavingsGoals(updatedGoals);
    setRecentTransactions([newTransaction, ...recentTransactions].slice(0, 10));
    setCurrentSavings(prevSavings => prevSavings - amount);
    setAddSavingsModalVisible(false);
    setSavingsAmount('');
    setSelectedGoalId(null);
    saveData();
  };

  const renderSavingsGoal = ({ item }) => {
    const progress = item.target > 0 ? item.saved / item.target : 0;
  
    return (
      <View key={item.id} style={styles.goalItem}>
        <View style={styles.goalHeader}>
          <Icon name={item.icon} size={24} color={theme.primary} />
          <Text style={styles.goalName}>{item.name}</Text>
          <View style={styles.goalActions}>
            <TouchableOpacity onPress={() => {
              setEditingGoal(item);
              setEditGoalModalVisible(true);
            }}>
              <Icon name="edit" size={24} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteGoal(item.id)}>
              <Icon name="delete" size={24} color={theme.error} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.goalAmount}>
          ${item.saved.toFixed(2)} / ${item.target.toFixed(2)}
        </Text>
        <View style={styles.progressBarContainer}>
          <LinearGradient
            colors={[theme.primary, theme.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBar, { width: `${progress * 100}%` }]}
          />
        </View>
        <TouchableOpacity
          style={styles.addSavingsButton}
          onPress={() => {
            setSelectedGoalId(item.id);
            setAddSavingsModalVisible(true);
          }}
        >
          <Icon name="add" size={20} color={theme.surface} />
          <Text style={styles.addSavingsButtonText}>Add Savings</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTransaction = ({ item }) => {
    const transactionAmount = typeof item.amount === 'number' ? item.amount : 0;
    const amountColor = item.type === 'Income' ? theme.primary : theme.error;
    const iconName = item.type === 'Income' ? 'arrow-upward' : 'arrow-downward';
  
    return (
      <View key={item.id} style={styles.transactionItem}>
        <View style={styles.transactionIcon}>
          <Icon name={iconName} size={24} color={amountColor} />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionLabel}>{item.label}</Text>
          <Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString()}</Text>
        </View>
        <Text style={[styles.transactionAmount, { color: amountColor }]}>
          {item.type === 'Income' ? '+' : '-'}${transactionAmount.toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={theme.primary} barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.surface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Savings Tracker</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.currentSavingsContainer}>
        <Icon name="account-balance-wallet" size={40} color={theme.primary} />
        <View style={styles.currentSavingsTextContainer}>
          <Text style={styles.currentSavingsLabel}>Current Savings</Text>
          <Text style={styles.currentSavingsAmount}>
            ${currentSavings.toFixed(2)}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Savings Goals</Text>
      <FlatList
        data={savingsGoals}
        renderItem={renderSavingsGoal}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />

      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      <FlatList
        data={recentTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />

      <TouchableOpacity style={styles.addGoalButton} onPress={() => setModalVisible(true)}>
        <Icon name="add" size={24} color={theme.surface} />
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Goal</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Goal Name"
              value={newGoalName}
              onChangeText={setNewGoalName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Target Amount"
              value={newGoalTarget}
              onChangeText={setNewGoalTarget}
              keyboardType="numeric"
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={addNewGoal}>
                <Text style={styles.modalButtonText}>Add Goal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={addSavingsModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Savings</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Amount"
              value={savingsAmount}
              onChangeText={setSavingsAmount}
              keyboardType="numeric"
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={addSavings}>
                <Text style={styles.modalButtonText}>Add Savings</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setAddSavingsModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={editGoalModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Goal</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Goal Name"
              value={editingGoal?.name}
              onChangeText={(text) => setEditingGoal({ ...editingGoal, name: text })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Target Amount"
              value={editingGoal?.target.toString()}
              onChangeText={(text) => setEditingGoal({ ...editingGoal, target: text })}
              keyboardType="numeric"
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={editGoal}>
                <Text style={styles.modalButtonText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditGoalModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.surface,
  },
  headerRight: {
    width: 40,
  },
  currentSavingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: 20,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentSavingsTextContainer: {
    marginLeft: 16,
  },
  currentSavingsLabel: {
    fontSize: 16,
    color: theme.textLight,
  },
  currentSavingsAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
    color: theme.text,
  },
  list: {
    paddingHorizontal: 16,
  },
  goalItem: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    flex: 1,
    marginLeft: 12,
  },
  goalActions: {
    flexDirection: 'row',
  },
  goalAmount: {
    fontSize: 16,
    color: theme.textLight,
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: theme.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  addSavingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    padding: 8,
    borderRadius: 8,
  },
  addSavingsButtonText: {
    color: theme.surface,
    marginLeft: 8,
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  transactionIcon: {
    marginRight: 16,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionLabel: {
    fontSize: 16,
    color: theme.text,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: theme.textLight,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addGoalButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: theme.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 24,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.text,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    backgroundColor: theme.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  modalButtonText: {
    color: theme.surface,
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: theme.error,
  },
});