// IncomeScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button, ProgressBarAndroid, Modal, TextInput, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function IncomeScreen() {
  const route = useRoute();
  const { totalIncome } = route.params;

  const [incomeSources, setIncomeSources] = useState([
    { id: '1', name: 'Job Salary', target: 5000, earned: 3500 },
    { id: '2', name: 'Freelancing', target: 1500, earned: 900 },
  ]);

  const [recentTransactions, setRecentTransactions] = useState([
    { id: '1', name: 'Salary Payment', amount: 2000 },
    { id: '2', name: 'Freelancing Project', amount: 500 },
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
        <Text style={styles.incomeText}>{item.name}</Text>
        <Text style={styles.incomeAmount}>
          ${item.earned} / ${item.target}
        </Text>
        <ProgressBarAndroid
          styleAttr="Horizontal"
          indeterminate={false}
          progress={progress}
          color="#4CAF50"
        />
        <Button
          title="Add Income"
          onPress={() => Alert.alert('Add Income', `Feature to add to ${item.name} is not implemented yet.`)}
        />
      </View>
    );
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionItem}>
      <Text style={styles.transactionText}>{item.name}</Text>
      <Text style={[styles.transactionAmount, { color: '#4CAF50' }]}>
        ${item.amount}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Total Income</Text>
      <Text style={styles.incomeAmountTotal}>${totalIncome}</Text>

      <Text style={styles.sectionTitle}>Income Sources</Text>
      <FlatList
        data={incomeSources}
        renderItem={renderIncomeSource}
        keyExtractor={(item) => item.id}
      />
      
      <Button title="Add New Income Source" onPress={() => setModalVisible(true)} />

      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      <FlatList
        data={recentTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
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
              <Button title="Add Source" onPress={addNewSource} />
              <Button title="Cancel" onPress={() => setModalVisible(false)} color="#F44336" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  text: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  incomeAmountTotal: { fontSize: 32, fontWeight: 'bold', color: '#4CAF50', textAlign: 'center', marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  incomeItem: { marginBottom: 20 },
  incomeText: { fontSize: 18, fontWeight: '600' },
  incomeAmount: { fontSize: 16, marginBottom: 5 },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  transactionText: { fontSize: 16 },
  transactionAmount: { fontSize: 16, fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '80%', padding: 20, backgroundColor: '#fff', borderRadius: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderBottomWidth: 1, marginBottom: 15, fontSize: 16, paddingVertical: 5 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
});
