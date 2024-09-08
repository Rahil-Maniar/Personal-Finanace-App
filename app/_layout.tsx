import React from 'react';
import { Stack } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  return (
    <PaperProvider>
      <Stack>
        <Stack.Screen name="Dashboard" />
        <Stack.Screen name="SavingsScreen" />
        <Stack.Screen name="IncomeScreen" />
        <Stack.Screen name="ExpensesScreen" />
        <Stack.Screen 
          name="InvestmentScreen" 
          options={{
            title: "Investments",
            headerBackTitle: "Back"
          }}
        />
      </Stack>
    </PaperProvider>
  );
}