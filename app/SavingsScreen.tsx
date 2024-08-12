import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button, ProgressBarAndroid, Modal, TextInput, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function SavingsScreen() {
  const route = useRoute();
  const { currentSavings } = route.params;

  const [savingsGoals, setSavingsGoals] = useState([
    { id: '1', name: 'Emergency Fund', target: 5000, saved: 1500 },
    { id: '2', name: 'Vacation', target: 2000, saved: 800 },
    { id: '3', name: 'New Car', target: 10000, saved: 2500 },
  ]);
  const [newGoalModalVisible, setNewGoalModalVisible] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');

  const handleAddGoal = () => {
    if (newGoalName && newGoalTarget) {
      const newGoal = {
        id: Date.now().toString(),
        name: newGoalName,
        target: parseFloat(newGoalTarget),
        saved: 0,
      };
      setSavingsGoals([...savingsGoals, newGoal]);
      setNewGoalName('');
      setNewGoalTarget('');
      setNewGoalModalVisible(false);
    }
  };

  const renderGoal = ({ item }) => {
    const progress = item.saved / item.target;
    return (
      <View style={styles.goalItem}>
        <Text style={styles.goalText}>{item.name}</Text>
        <Text style={styles.goalAmount}>
          ${item.saved} / ${item.target}
        </Text>
        <ProgressBarAndroid
          styleAttr="Horizontal"
          indeterminate={false}
          progress={progress}
          color="#4CAF50"
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Current Savings</Text>
      <Text style={styles.savingsAmount}>${currentSavings}</Text>

      <FlatList
        data={savingsGoals}
        renderItem={renderGoal}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<Text style={styles.sectionTitle}>Savings Goals</Text>}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setNewGoalModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Add Savings Goal</Text>
      </TouchableOpacity>

      <Modal
        visible={newGoalModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Savings Goal</Text>
            <TextInput
              style={styles.input}
              placeholder="Goal Name"
              value={newGoalName}
              onChangeText={setNewGoalName}
            />
            <TextInput
              style={styles.input}
              placeholder="Target Amount"
              keyboardType="numeric"
              value={newGoalTarget}
              onChangeText={setNewGoalTarget}
            />
            <Button title="Add Goal" onPress={handleAddGoal} />
            <Button title="Cancel" onPress={() => setNewGoalModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  text: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  savingsAmount: { fontSize: 32, fontWeight: 'bold', color: '#4CAF50', textAlign: 'center', marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  goalItem: { marginBottom: 20 },
  goalText: { fontSize: 18, fontWeight: '600' },
  goalAmount: { fontSize: 16, marginBottom: 5 },
  addButton: { marginTop: 20, padding: 10, backgroundColor: '#4CAF50', alignItems: 'center', borderRadius: 5 },
  addButtonText: { color: '#fff', fontSize: 18 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: 300 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { borderBottomWidth: 1, marginBottom: 20, fontSize: 16, padding: 5 },
});
