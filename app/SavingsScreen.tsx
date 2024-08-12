import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, SafeAreaView, StatusBar } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const theme = {
  primary: '#4CAF50',  // Green
  secondary: '#FFC107',  // Amber for contrast
  background: '#F5F5F5',  // Light gray background
  surface: '#FFFFFF',
  error: '#B00020',  // Deep red for errors
  text: '#212121',  // Dark gray for text
  onSurface: '#212121',
  accent: '#1E88E5',  // Blue accent for variety
};

export default function SavingsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const [currentSavings, setCurrentSavings] = useState(route.params?.currentSavings || 0);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [addSavingsModalVisible, setAddSavingsModalVisible] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [savingsAmount, setSavingsAmount] = useState('');

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
      name: `Savings added to ${savingsGoals.find(goal => goal.id === selectedGoalId).name}`,
      amount: amount,
      date: new Date().toISOString().split('T')[0],
    };

    setSavingsGoals(updatedGoals);
    setRecentTransactions([newTransaction, ...recentTransactions].slice(0, 10));
    setCurrentSavings(prevSavings => (prevSavings ? parseFloat(prevSavings) - amount : 0));
    setAddSavingsModalVisible(false);
    setSavingsAmount('');
    setSelectedGoalId(null);
    saveData();
  };

  const renderSavingsGoal = ({ item }) => {
    const progress = item.saved / item.target;

    return (
      <View style={styles.goalItem}>
        <View style={styles.goalHeader}>
          <Icon name={item.icon} size={24} color={theme.primary} />
          <Text style={styles.goalText}>{item.name}</Text>
        </View>
        <Text style={styles.goalAmount}>
          ${item.saved.toFixed(2)} / ${item.target.toFixed(2)}
        </Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
        <TouchableOpacity
          style={styles.addSavingsButton}
          onPress={() => {
            setSelectedGoalId(item.id);
            setAddSavingsModalVisible(true);
          }}
        >
          <Text style={styles.addSavingsButtonText}>Add Savings</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionItem}>
      <View>
        <Text style={styles.transactionText}>{item.name}</Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
      <Text style={[styles.transactionAmount, { color: theme.primary }]}>
        +${item.amount.toFixed(2)}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={theme.primary} barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Savings Tracker</Text>
      </View>
      <View style={styles.currentSavingsContainer}>
        <Text style={styles.currentSavingsLabel}>Current Savings</Text>
        <Text style={styles.currentSavingsAmount}>
          ${typeof currentSavings === 'number' ? currentSavings.toFixed(2) : currentSavings}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Savings Goals</Text>
      <FlatList
        data={savingsGoals}
        renderItem={renderSavingsGoal}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
      
      <TouchableOpacity style={styles.addGoalButton} onPress={() => setModalVisible(true)}>
        <Icon name="add" size={24} color={theme.surface} />
        <Text style={styles.addGoalButtonText}>Add New Goal</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      <FlatList
        data={recentTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Savings Goal</Text>
            <TextInput
              placeholder="Goal Name"
              value={newGoalName}
              onChangeText={setNewGoalName}
              style={styles.input}
            />
            <TextInput
              placeholder="Target Amount"
              value={newGoalTarget}
              onChangeText={setNewGoalTarget}
              keyboardType="numeric"
              style={styles.input}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={addNewGoal}>
                <Text style={styles.modalButtonText}>Add Goal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
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
              placeholder="Amount"
              value={savingsAmount}
              onChangeText={setSavingsAmount}
              keyboardType="numeric"
              style={styles.input}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={addSavings}>
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setAddSavingsModalVisible(false)}>
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { backgroundColor: theme.primary, padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: theme.surface },
  currentSavingsContainer: { backgroundColor: theme.surface, padding: 20, alignItems: 'center', elevation: 2 },
  currentSavingsLabel: { fontSize: 18, color: theme.text },
  currentSavingsAmount: { fontSize: 36, fontWeight: 'bold', color: theme.primary, marginTop: 10 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginVertical: 15, marginHorizontal: 20, color: theme.text },
  list: { marginHorizontal: 20 },
  goalItem: { backgroundColor: theme.surface, borderRadius: 8, padding: 15, marginBottom: 15, elevation: 2 },
  goalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  goalText: { fontSize: 18, fontWeight: '600', marginLeft: 10, color: theme.text },
  goalAmount: { fontSize: 16, marginBottom: 10, color: theme.text },
  progressBarContainer: { height: 8, backgroundColor: theme.background, borderRadius: 4, marginBottom: 15, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: theme.primary },
  addSavingsButton: { backgroundColor: theme.secondary, borderRadius: 4, padding: 10, alignItems: 'center' },
  addSavingsButtonText: { color: theme.text, fontWeight: '600' },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, backgroundColor: theme.surface, borderRadius: 8, padding: 15, elevation: 2 },
  transactionText: { fontSize: 16, color: theme.text },
  transactionDate: { fontSize: 14, color: 'gray', marginTop: 5 },
  transactionAmount: { fontSize: 16, fontWeight: 'bold', color: theme.primary },
  addGoalButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.accent, borderRadius: 8, padding: 15, marginHorizontal: 20, marginBottom: 20 },
  addGoalButtonText: { color: theme.surface, fontWeight: '600', marginLeft: 10 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '80%', padding: 20, backgroundColor: theme.surface, borderRadius: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: theme.text },
  input: { borderBottomWidth: 1, borderBottomColor: theme.primary, marginBottom: 20, fontSize: 16, paddingVertical: 5 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalButton: { flex: 1, backgroundColor: theme.primary, borderRadius: 4, padding: 10, alignItems: 'center', marginHorizontal: 5 },
  modalButtonText: { color: theme.surface, fontWeight: '600' },
  cancelButton: { backgroundColor: theme.error },
  cancelButtonText: { color: theme.surface },
});