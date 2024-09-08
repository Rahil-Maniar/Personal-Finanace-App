import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, SafeAreaView, StatusBar } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const theme = {
  primary: '#E53935',
  secondary: '#FFC107',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  error: '#B00020',
  text: '#212121',
  onSurface: '#757575',
  accent: '#1E88E5',
  shadowColor: '#000',
};

export default function ExpenseScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const [totalExpenses, setTotalExpenses] = useState(route.params?.totalExpenses || 0);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryBudget, setNewCategoryBudget] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [addExpenseModalVisible, setAddExpenseModalVisible] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseName, setExpenseName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedCategories = await AsyncStorage.getItem('expenseCategories');
      const savedTransactions = await AsyncStorage.getItem('expenseTransactions');
      const savedTotalExpenses = await AsyncStorage.getItem('totalExpenses');

      if (savedCategories) setExpenseCategories(JSON.parse(savedCategories));
      if (savedTransactions) setRecentTransactions(JSON.parse(savedTransactions));
      if (savedTotalExpenses) setTotalExpenses(parseFloat(savedTotalExpenses));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('expenseCategories', JSON.stringify(expenseCategories));
      await AsyncStorage.setItem('expenseTransactions', JSON.stringify(recentTransactions));
      await AsyncStorage.setItem('totalExpenses', totalExpenses.toString());
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

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
    saveData();
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
    saveData();
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
          onPress: () => {
            setExpenseCategories(expenseCategories.filter(category => category.id !== categoryId));
            saveData();
          },
        },
      ],
    );
  };

  const addExpense = () => {
    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0 || !expenseName) {
      Alert.alert('Error', 'Please enter a valid amount and name for the expense.');
      return;
    }

    const updatedCategories = expenseCategories.map(category =>
      category.id === selectedCategoryId ? { ...category, spent: category.spent + amount } : category
    );

    const newTransaction = {
      id: Date.now().toString(),
      name: expenseName,
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      categoryId: selectedCategoryId,
    };

    setExpenseCategories(updatedCategories);
    setRecentTransactions([newTransaction, ...recentTransactions].slice(0, 10));
    setTotalExpenses(prevTotal => prevTotal + amount);
    setAddExpenseModalVisible(false);
    setExpenseAmount('');
    setExpenseName('');
    setSelectedCategoryId(null);
    saveData();
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
          <LinearGradient
            colors={[theme.primary, theme.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBar, { width: `${progress * 100}%` }]}
          />
        </View>
        <View style={styles.categoryActions}>
          <TouchableOpacity
            style={styles.addExpenseButton}
            onPress={() => {
              setSelectedCategoryId(item.id);
              setAddExpenseModalVisible(true);
            }}
          >
            <Icon name="add" size={20} color={theme.surface} />
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
        -${item.amount.toFixed(2)}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={theme.primary} barStyle="light-content" hidden={true}/>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.surface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Tracker</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.totalExpensesContainer}>
        <Icon name="account-balance-wallet" size={40} color={theme.primary} />
        <View>
          <Text style={styles.totalExpensesLabel}>Total Expenses</Text>
          <Text style={styles.totalExpensesAmount}>
            ${typeof totalExpenses === 'number' ? totalExpenses.toFixed(2) : '0.00'}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Expense Categories</Text>
      <FlatList
        data={expenseCategories}
        renderItem={renderExpenseCategory}
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

      <TouchableOpacity style={styles.addCategoryFAB} onPress={() => setModalVisible(true)}>
        <Icon name="add" size={24} color={theme.surface} />
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Expense Category</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Category Name"
              placeholderTextColor={theme.onSurface}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Budget Amount"
              placeholderTextColor={theme.onSurface}
              value={newCategoryBudget}
              onChangeText={setNewCategoryBudget}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={addNewCategory}>
                <Text style={styles.modalButtonText}>Add Category</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isEditModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Expense Category</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Category Name"
              placeholderTextColor={theme.onSurface}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Budget Amount"
              placeholderTextColor={theme.onSurface}
              value={newCategoryBudget}
              onChangeText={setNewCategoryBudget}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={editCategory}>
                <Text style={styles.modalButtonText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={addExpenseModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Expense</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Expense Name"
              placeholderTextColor={theme.onSurface}
              value={expenseName}
              onChangeText={setExpenseName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Amount"
              placeholderTextColor={theme.onSurface}
              value={expenseAmount}
              onChangeText={setExpenseAmount}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={addExpense}>
                <Text style={styles.modalButtonText}>Add Expense</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setAddExpenseModalVisible(false)}>
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
  container: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.primary, padding: 16, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  backButton: { padding: 8 },
  headerRight: { width: 40 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: theme.surface },
  totalExpensesContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, padding: 20, margin: 20, borderRadius: 15, shadowColor: theme.shadowColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  totalExpensesLabel: { fontSize: 16, color: theme.onSurface, marginBottom: 4 },
  totalExpensesAmount: { fontSize: 28, fontWeight: 'bold', color: theme.primary },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginVertical: 15, marginHorizontal: 20, color: theme.text },
  list: { marginHorizontal: 20 },
  expenseItem: { backgroundColor: theme.surface, borderRadius: 15, padding: 15, marginBottom: 15, shadowColor: theme.shadowColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  expenseHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  expenseText: { fontSize: 18, fontWeight: '600', marginLeft: 10, color: theme.text },
  expenseAmount: { fontSize: 16, marginBottom: 10, color: theme.text },
  progressBarContainer: { height: 12, backgroundColor: theme.background, borderRadius: 6, marginBottom: 15, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 6 },
  categoryActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addExpenseButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.accent, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12 },
  addExpenseButtonText: { color: theme.surface, fontWeight: '600', marginLeft: 5 },
  editCategoryButton: { padding: 8 },
  deleteCategoryButton: { padding: 8 },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, backgroundColor: theme.surface, borderRadius: 12, padding: 15, shadowColor: theme.shadowColor, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  transactionText: { fontSize: 16, color: theme.text },
  transactionDate: { fontSize: 14, color: theme.onSurface, marginTop: 5 },
  transactionAmount: { fontSize: 16, fontWeight: 'bold' },
  addCategoryFAB: { position: 'absolute', right: 20, bottom: 20, backgroundColor: theme.primary, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: theme.shadowColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 8 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '80%', padding: 20, backgroundColor: theme.surface, borderRadius: 20, shadowColor: theme.shadowColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: theme.text, textAlign: 'center' },
  modalInput: { borderBottomWidth: 1, borderBottomColor: theme.primary, marginBottom: 20, fontSize: 16, paddingVertical: 8, color: theme.text },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalButton: { flex: 1, backgroundColor: theme.primary, borderRadius: 8, padding: 12, alignItems: 'center', marginHorizontal: 5 },
  modalButtonText: { color: theme.surface, fontWeight: '600', fontSize: 16 },
  cancelButton: { backgroundColor: theme.error },
});