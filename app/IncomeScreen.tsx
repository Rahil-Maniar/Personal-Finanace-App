import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, SafeAreaView, StatusBar } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const theme = {
  primary: '#2196F3',  // Blue
  secondary: '#FFC107',  // Amber for contrast
  background: '#F5F5F5',  // Light gray background
  surface: '#FFFFFF',
  error: '#F44336',  // Red for errors
  text: '#212121',  // Dark gray for text
  onSurface: '#212121',
  accent: '#4CAF50',  // Green accent
};

export default function IncomeScreen() {
  const route = useRoute();
  const { totalIncome } = route.params;

  const [incomeSources, setIncomeSources] = useState([
    { id: '1', name: 'Job Salary', target: 5000, earned: 3500 },
    { id: '2', name: 'Freelancing', target: 1500, earned: 900 },
  ]);

  const [recentTransactions, setRecentTransactions] = useState([
    { id: '1', name: 'Salary Payment', amount: 2000, date: '2024-08-01' },
    { id: '2', name: 'Freelancing Project', amount: 500, date: '2024-08-05' },
  ]);

  const [isModalVisible, setModalVisible] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceTarget, setNewSourceTarget] = useState('');

  const addNewSource = () => {
    if (!newSourceName || !newSourceTarget) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    const newSource = {
      id: Date.now().toString(),
      name: newSourceName,
      target: parseFloat(newSourceTarget),
      earned: 0,
    };

    setIncomeSources([...incomeSources, newSource]);
    setNewSourceName('');
    setNewSourceTarget('');
    setModalVisible(false);
  };

  const renderIncomeSource = ({ item }) => {
    const progress = item.earned / item.target;

    return (
      <View style={styles.incomeItem}>
        <View style={styles.incomeHeader}>
          <Icon name="account-balance-wallet" size={24} color={theme.primary} />
          <Text style={styles.incomeText}>{item.name}</Text>
        </View>
        <Text style={styles.incomeAmount}>
          ${item.earned.toFixed(2)} / ${item.target.toFixed(2)}
        </Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
        <TouchableOpacity
          style={styles.addIncomeButton}
          onPress={() => Alert.alert('Add Income', `Feature to add to ${item.name} is not implemented yet.`)}
        >
          <Text style={styles.addIncomeButtonText}>Add Income</Text>
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
      <Text style={[styles.transactionAmount, { color: theme.accent }]}>
        +${item.amount.toFixed(2)}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={theme.primary} barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Income Tracker</Text>
      </View>
      <View style={styles.totalIncomeContainer}>
        <Text style={styles.totalIncomeLabel}>Total Income</Text>
        <Text style={styles.totalIncomeAmount}>
          ${typeof totalIncome === 'number' ? totalIncome.toFixed(2) : totalIncome}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Income Sources</Text>
      <FlatList
        data={incomeSources}
        renderItem={renderIncomeSource}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
      
      <TouchableOpacity style={styles.addSourceButton} onPress={() => setModalVisible(true)}>
        <Icon name="add" size={24} color={theme.surface} />
        <Text style={styles.addSourceButtonText}>Add New Income Source</Text>
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
            <Text style={styles.modalTitle}>Add New Income Source</Text>
            <TextInput
              placeholder="Source Name"
              value={newSourceName}
              onChangeText={setNewSourceName}
              style={styles.input}
            />
            <TextInput
              placeholder="Target Amount"
              value={newSourceTarget}
              onChangeText={setNewSourceTarget}
              keyboardType="numeric"
              style={styles.input}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={addNewSource}>
                <Text style={styles.modalButtonText}>Add Source</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
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
  totalIncomeContainer: { backgroundColor: theme.surface, padding: 20, alignItems: 'center', elevation: 2 },
  totalIncomeLabel: { fontSize: 18, color: theme.text },
  totalIncomeAmount: { fontSize: 36, fontWeight: 'bold', color: theme.primary, marginTop: 10 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginVertical: 15, marginHorizontal: 20, color: theme.text },
  list: { marginHorizontal: 20 },
  incomeItem: { backgroundColor: theme.surface, borderRadius: 8, padding: 15, marginBottom: 15, elevation: 2 },
  incomeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  incomeText: { fontSize: 18, fontWeight: '600', marginLeft: 10, color: theme.text },
  incomeAmount: { fontSize: 16, marginBottom: 10, color: theme.text },
  progressBarContainer: { height: 8, backgroundColor: theme.background, borderRadius: 4, marginBottom: 15, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: theme.primary },
  addIncomeButton: { backgroundColor: theme.secondary, borderRadius: 4, padding: 10, alignItems: 'center' },
  addIncomeButtonText: { color: theme.text, fontWeight: '600' },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, backgroundColor: theme.surface, borderRadius: 8, padding: 15, elevation: 2 },
  transactionText: { fontSize: 16, color: theme.text },
  transactionDate: { fontSize: 14, color: 'gray', marginTop: 5 },
  transactionAmount: { fontSize: 16, fontWeight: 'bold', color: theme.primary },
  addSourceButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.accent, borderRadius: 8, padding: 15, marginHorizontal: 20, marginBottom: 20 },
  addSourceButtonText: { color: theme.surface, fontWeight: '600', marginLeft: 10 },
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