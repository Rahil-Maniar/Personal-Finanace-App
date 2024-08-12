// ExpenseScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button, ProgressBarAndroid, Modal, TextInput, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function ExpenseScreen() {
  const route = useRoute();
  const { totalExpenses } = route.params;

  const [expenseCategories, setExpenseCategories] = useState([
    { id: '1', name: 'Rent', budget: 1200, spent: 900 },
    { id: '2', name: 'Groceries', budget: 500, spent: 350 },
    { id: '3', name: 'Entertainment', budget: 300, spent: 150 },
  ]);

  const [recentTransactions, setRecentTransactions] = useState([
    { id: '1', name: 'Rent Payment', amount: -900 },
    { id: '2', name: 'Grocery Shopping', amount: -150 },
  ]);

  const [isModalVisible, setModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryBudget, setNewCategoryBudget] = useState('');

  const addNewCategory = () => {
    if (!newCategoryName || !newCategoryBudget) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    const newCategory = {
      id: Date.now().toString(),
      name: newCategoryName,
      budget: parseFloat(newCategoryBudget),
      spent: 0,
    };

    setExpenseCategories([...expenseCategories, newCategory]);
    setNewCategoryName('');
    setNewCategoryBudget('');
    setModalVisible(false);
  };

  const renderExpenseCategory = ({ item }) => {
    const progress = item.spent / item.budget;

    return (
      <View style={styles.expenseItem}>
        <Text style={styles.expenseText}>{item.name}</Text>
        <Text style={styles.expenseAmount}>
          ${item.spent} / ${item.budget}
        </Text>
        <ProgressBarAndroid
          styleAttr="Horizontal"
          indeterminate={false}
          progress={progress}
          color="#F44336"
        />
        <Button
          title="Add Expense"
          onPress={() => Alert.alert('Add Expense', `Feature to add to ${item.name} is not implemented yet.`)}
        />
      </View>
    );
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionItem}>
      <Text style={styles.transactionText}>{item.name}</Text>
      <Text style={[styles.transactionAmount, { color: '#F44336' }]}>
        ${item.amount}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Total Expenses</Text>
      <Text style={styles.expenseAmountTotal}>${totalExpenses}</Text>

      <Text style={styles.sectionTitle}>Expense Categories</Text>
      <FlatList
        data={expenseCategories}
        renderItem={renderExpenseCategory}
        keyExtractor={(item) => item.id}
      />
      
      <Button title="Add New Expense Category" onPress={() => setModalVisible(true)} />

      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      <FlatList
        data={recentTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
      />

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Expense Category</Text>
            <TextInput
              placeholder="Category Name"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              style={styles.input}
            />
            <TextInput
              placeholder="Budget Amount"
              value={newCategoryBudget}
              onChangeText={setNewCategoryBudget}
              keyboardType="numeric"
              style={styles.input}
            />
            <View style={styles.modalButtons}>
              <Button title="Add Category" onPress={addNewCategory} />
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
  expenseAmountTotal: { fontSize: 32, fontWeight: 'bold', color: '#F44336', textAlign: 'center', marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  expenseItem: { marginBottom: 20 },
  expenseText: { fontSize: 18, fontWeight: '600' },
  expenseAmount: { fontSize: 16, marginBottom: 5 },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  transactionText: { fontSize: 16 },
  transactionAmount: { fontSize: 16, fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '80%', padding: 20, backgroundColor: '#fff', borderRadius: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderBottomWidth: 1, marginBottom: 15, fontSize: 16, paddingVertical: 5 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
});
