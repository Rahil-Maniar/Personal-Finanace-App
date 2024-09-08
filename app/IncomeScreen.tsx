import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, SafeAreaView, StatusBar } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const theme = {
  primary: '#2196F3',
  secondary: '#FFC107',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  error: '#F44336',
  text: '#212121',
  onSurface: '#757575',
  accent: '#4CAF50',
  shadowColor: '#000',
};

export default function IncomeScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const [totalIncome, setTotalIncome] = useState(route.params?.totalIncome || 0);
  const [incomeSources, setIncomeSources] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceTarget, setNewSourceTarget] = useState('');
  const [addIncomeModalVisible, setAddIncomeModalVisible] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState(null);
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeName, setIncomeName] = useState('');
  const [editSourceModalVisible, setEditSourceModalVisible] = useState(false);
  const [editingSource, setEditingSource] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedSources = await AsyncStorage.getItem('incomeSources');
      const savedTransactions = await AsyncStorage.getItem('incomeTransactions');
      const savedTotalIncome = await AsyncStorage.getItem('totalIncome');

      if (savedSources) setIncomeSources(JSON.parse(savedSources));
      if (savedTransactions) setRecentTransactions(JSON.parse(savedTransactions));
      if (savedTotalIncome) setTotalIncome(parseFloat(savedTotalIncome));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('incomeSources', JSON.stringify(incomeSources));
      await AsyncStorage.setItem('incomeTransactions', JSON.stringify(recentTransactions));
      await AsyncStorage.setItem('totalIncome', totalIncome.toString());
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

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
    saveData();
  };

  const updateSource = () => {
    if (!editingSource.name || !editingSource.target) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    const updatedSources = incomeSources.map(source =>
      source.id === editingSource.id ? { ...source, name: editingSource.name, target: parseFloat(editingSource.target) } : source
    );

    setIncomeSources(updatedSources);
    setEditSourceModalVisible(false);
    setEditingSource(null);
    saveData();
  };

  const deleteSource = (sourceId) => {
    Alert.alert(
      'Delete Source',
      'Are you sure you want to delete this income source?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            const updatedSources = incomeSources.filter(source => source.id !== sourceId);
            setIncomeSources(updatedSources);
            saveData();
          }
        },
      ]
    );
  };

  const addIncome = () => {
    const amount = parseFloat(incomeAmount);
    if (isNaN(amount) || amount <= 0 || !incomeName) {
      Alert.alert('Error', 'Please enter a valid amount and name for the income.');
      return;
    }

    const updatedSources = incomeSources.map(source =>
      source.id === selectedSourceId ? { ...source, earned: source.earned + amount } : source
    );

    const newTransaction = {
      id: Date.now().toString(),
      name: incomeName,
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      sourceId: selectedSourceId,
    };

    setIncomeSources(updatedSources);
    setRecentTransactions([newTransaction, ...recentTransactions].slice(0, 10));
    setTotalIncome(prevTotal => prevTotal + amount);
    setAddIncomeModalVisible(false);
    setIncomeAmount('');
    setIncomeName('');
    setSelectedSourceId(null);
    saveData();
  };

  const renderIncomeSource = ({ item }) => {
    const progress = item.earned / item.target;

    return (
      <View style={styles.incomeItem}>
        <View style={styles.incomeHeader}>
          <Icon name="account-balance-wallet" size={24} color={theme.primary} />
          <Text style={styles.incomeText}>{item.name}</Text>
          <View style={styles.sourceActions}>
            <TouchableOpacity onPress={() => {
              setEditingSource(item);
              setEditSourceModalVisible(true);
            }}>
              <Icon name="edit" size={24} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteSource(item.id)}>
              <Icon name="delete" size={24} color={theme.error} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.incomeAmount}>
          ${item.earned.toFixed(2)} / ${item.target.toFixed(2)}
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
          style={styles.addIncomeButton}
          onPress={() => {
            setSelectedSourceId(item.id);
            setAddIncomeModalVisible(true);
          }}
        >
          <Icon name="add" size={20} color={theme.surface} />
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.surface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Income Tracker</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.totalIncomeContainer}>
        <Icon name="account-balance-wallet" size={40} color={theme.primary} />
        <View>
          <Text style={styles.totalIncomeLabel}>Total Income</Text>
          <Text style={styles.totalIncomeAmount}>
            ${typeof totalIncome === 'number' ? totalIncome.toFixed(2) : '0.00'}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Income Sources</Text>
      <FlatList
        data={incomeSources}
        renderItem={renderIncomeSource}
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

      <TouchableOpacity style={styles.addSourceFAB} onPress={() => setModalVisible(true)}>
        <Icon name="add" size={24} color={theme.surface} />
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Income Source</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Source Name"
              placeholderTextColor={theme.onSurface}
              value={newSourceName}
              onChangeText={setNewSourceName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Target Amount"
              placeholderTextColor={theme.onSurface}
              value={newSourceTarget}
              onChangeText={setNewSourceTarget}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={addNewSource}>
                <Text style={styles.modalButtonText}>Add Source</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={addIncomeModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Income</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Income Name"
              placeholderTextColor={theme.onSurface}
              value={incomeName}
              onChangeText={setIncomeName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Amount"
              placeholderTextColor={theme.onSurface}
              value={incomeAmount}
              onChangeText={setIncomeAmount}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={addIncome}>
                <Text style={styles.modalButtonText}>Add Income</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setAddIncomeModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={editSourceModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Income Source</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Source Name"
              placeholderTextColor={theme.onSurface}
              value={editingSource?.name}
              onChangeText={(text) => setEditingSource({...editingSource, name: text})}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Target Amount"
              placeholderTextColor={theme.onSurface}
              value={editingSource?.target.toString()}
              onChangeText={(text) => setEditingSource({...editingSource, target: text})}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={updateSource}>
                <Text style={styles.modalButtonText}>Update Source</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setEditSourceModalVisible(false)}>
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
    backgroundColor: theme.background 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: theme.primary, 
    padding: 16, 
    borderBottomLeftRadius: 20, 
    borderBottomRightRadius: 20 
  },
  backButton: { 
    padding: 8 
  },
  headerRight: { 
    width: 40 
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: theme.surface 
  },
  totalIncomeContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: theme.surface, 
    padding: 20, 
    margin: 20, 
    borderRadius: 15, 
    shadowColor: theme.shadowColor, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 10, 
    elevation: 5 
  },
  totalIncomeLabel: { 
    fontSize: 16, 
    color: theme.onSurface, 
    marginBottom: 4 
  },
  totalIncomeAmount: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: theme.primary 
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginVertical: 15, 
    marginHorizontal: 20, 
    color: theme.text 
  },
  list: { 
    marginHorizontal: 20 
  },
  incomeItem: { 
    backgroundColor: theme.surface, 
    borderRadius: 15, 
    padding: 15, 
    marginBottom: 15, 
    shadowColor: theme.shadowColor, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 10, 
    elevation: 5 
  },
  incomeHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  incomeText: { 
    fontSize: 18, 
    fontWeight: '600', 
    marginLeft: 10, 
    color: theme.text,
    flex: 1
  },
  sourceActions: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  incomeAmount: { 
    fontSize: 16, 
    marginBottom: 10, 
    color: theme.text 
  },
  progressBarContainer: { 
    height: 12, 
    backgroundColor: theme.background, 
    borderRadius: 6, 
    marginBottom: 15, 
    overflow: 'hidden' 
  },
  progressBar: { 
    height: '100%', 
    borderRadius: 6 
  },
  addIncomeButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: theme.primary, 
    padding: 10, 
    borderRadius: 8 
  },
  addIncomeButtonText: { 
    color: theme.surface, 
    marginLeft: 5, 
    fontWeight: '600' 
  },
  transactionItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: theme.surface, 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 10 
  },
  transactionText: { 
    fontSize: 16, 
    color: theme.text 
  },
  transactionDate: { 
    fontSize: 14, 
    color: theme.onSurface 
  },
  transactionAmount: { 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  addSourceFAB: { 
    position: 'absolute', 
    right: 20, 
    bottom: 20, 
    backgroundColor: theme.primary, 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    alignItems: 'center', 
    justifyContent: 'center', 
    elevation: 8 
  },
  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0, 0, 0, 0.5)' 
  },
  modalContent: { 
    backgroundColor: theme.surface, 
    padding: 20, 
    borderRadius: 10, 
    width: '80%' 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 15, 
    color: theme.text 
  },
  modalInput: { 
    borderWidth: 1, 
    borderColor: theme.onSurface, 
    borderRadius: 5, 
    padding: 10, 
    marginBottom: 10, 
    color: theme.text 
  },
  modalButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  modalButton: { 
    flex: 1, 
    backgroundColor: theme.primary, 
    borderRadius: 4, 
    padding: 10, 
    alignItems: 'center', 
    marginHorizontal: 5 
  },
  modalButtonText: { 
    color: theme.surface, 
    fontWeight: '600' 
  },
  cancelButton: { 
    backgroundColor: theme.error 
  },
});