import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, SafeAreaView, StatusBar } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const theme = {
  primary: '#E53935',
  secondary: '#FFC107',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  error: '#B00020',
  text: '#212121',
  onSurface: '#212121',
  accent: '#1E88E5',
};

export default function ExpenseScreen() {
  const route = useRoute();
  const { totalExpenses } = route.params;

  const [expenseCategories, setExpenseCategories] = useState([
    { id: '1', name: 'Rent', budget: 1200, spent: 900, icon: 'home' },
    { id: '2', name: 'Groceries', budget: 500, spent: 350, icon: 'shopping-cart' },
    { id: '3', name: 'Entertainment', budget: 300, spent: 150, icon: 'movie' },
  ]);

  const [recentTransactions, setRecentTransactions] = useState([
    { id: '1', name: 'Rent Payment', amount: -900, date: '2024-08-01' },
    { id: '2', name: 'Grocery Shopping', amount: -150, date: '2024-08-05' },
  ]);

  const [isModalVisible, setModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryBudget, setNewCategoryBudget] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

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
      icon: 'attach-money',
    };

    setExpenseCategories([...expenseCategories, newCategory]);
    setNewCategoryName('');
    setNewCategoryBudget('');
    setModalVisible(false);
  };

  const editCategory = () => {
    if (!newCategoryName || !newCategoryBudget) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    const updatedCategories = expenseCategories.map((category) =>
      category.id === editingCategory.id
        ? { ...category, name: newCategoryName, budget: parseFloat(newCategoryBudget) }
        : category
    );

    setExpenseCategories(updatedCategories);
    setNewCategoryName('');
    setNewCategoryBudget('');
    setEditingCategory(null);
    setEditModalVisible(false);
  };

  const deleteCategory = (categoryId) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setExpenseCategories(expenseCategories.filter(category => category.id !== categoryId)),
        },
      ],
    );
  };

  const renderExpenseCategory = ({ item }) => {
    const progress = item.spent / item.budget;

    return (
      <View style={styles.expenseItem}>
        <View style={styles.expenseHeader}>
          <Icon name={item.icon} size={24} color={theme.primary} />
          <Text style={styles.expenseText}>{item.name}</Text>
        </View>
        <Text style={styles.expenseAmount}>
          ${item.spent.toFixed(2)} / ${item.budget.toFixed(2)}
        </Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.categoryActions}>
          <TouchableOpacity
            style={styles.addExpenseButton}
            onPress={() => Alert.alert('Add Expense', `Feature to add to ${item.name} is not implemented yet.`)}
          >
            <Text style={styles.addExpenseButtonText}>Add Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editCategoryButton}
            onPress={() => {
              setEditingCategory(item);
              setNewCategoryName(item.name);
              setNewCategoryBudget(item.budget.toString());
              setEditModalVisible(true);
            }}
          >
            <Icon name="edit" size={24} color={theme.accent} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteCategoryButton}
            onPress={() => deleteCategory(item.id)}
          >
            <Icon name="delete" size={24} color={theme.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionItem}>
      <View>
        <Text style={styles.transactionText}>{item.name}</Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
      <Text style={[styles.transactionAmount, { color: theme.error }]}>
        ${Math.abs(item.amount).toFixed(2)}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={theme.primary} barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Expense Tracker</Text>
      </View>
      <View style={styles.totalExpensesContainer}>
        <Text style={styles.totalExpensesLabel}>Total Expenses</Text>
        <Text style={styles.totalExpensesAmount}>
          ${typeof totalExpenses === 'number' ? totalExpenses.toFixed(2) : totalExpenses}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Expense Categories</Text>
      <FlatList
        data={expenseCategories}
        renderItem={renderExpenseCategory}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />

      <TouchableOpacity style={styles.addCategoryButton} onPress={() => setModalVisible(true)}>
        <Icon name="add" size={24} color={theme.surface} />
        <Text style={styles.addCategoryButtonText}>Add New Category</Text>
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
              <TouchableOpacity style={styles.modalButton} onPress={addNewCategory}>
                <Text style={styles.modalButtonText}>Add Category</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Expense Category</Text>
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
              <TouchableOpacity style={styles.modalButton} onPress={editCategory}>
                <Text style={styles.modalButtonText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setEditModalVisible(false)}>
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
  totalExpensesContainer: { backgroundColor: theme.surface, padding: 20, alignItems: 'center', elevation: 2 },
  totalExpensesLabel: { fontSize: 18, color: theme.text },
  totalExpensesAmount: { fontSize: 36, fontWeight: 'bold', color: theme.primary, marginTop: 10 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginVertical: 15, marginHorizontal: 20, color: theme.text },
  list: { marginHorizontal: 20 },
  expenseItem: { backgroundColor: theme.surface, borderRadius: 8, padding: 15, marginBottom: 15, elevation: 2 },
  expenseHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  expenseText: { fontSize: 18, fontWeight: '600', marginLeft: 10, color: theme.text },
  expenseAmount: { fontSize: 16, marginBottom: 10, color: theme.text },
  progressBarContainer: { height: 8, backgroundColor: theme.background, borderRadius: 4, marginBottom: 15, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: theme.primary },
  categoryActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addExpenseButton: { backgroundColor: theme.secondary, borderRadius: 4, padding: 10, alignItems: 'center', flex: 1, marginRight: 5 },
  addExpenseButtonText: { color: theme.text, fontWeight: '600' },
  editCategoryButton: { padding: 10 },
  deleteCategoryButton: { padding: 10 },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, backgroundColor: theme.surface, borderRadius: 8, padding: 15, elevation: 2 },
  transactionText: { fontSize: 16, color: theme.text },
  transactionDate: { fontSize: 14, color: 'gray', marginTop: 5 },
  transactionAmount: { fontSize: 16, fontWeight: 'bold', color: theme.primary },
  addCategoryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.accent, borderRadius: 8, padding: 15, marginHorizontal: 20, marginBottom: 20 },
  addCategoryButtonText: { color: theme.surface, fontWeight: '600', marginLeft: 10 },
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
