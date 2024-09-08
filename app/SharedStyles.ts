import { StyleSheet } from 'react-native';

const theme = {
  primary: '#4CAF50',
  secondary: '#FFC107',
  background: '#F1F1F1',
  surface: '#FFFFFF',
  error: '#FF5252',
  text: '#333333',
  onSurface: '#666666',
  accent: '#1E88E5',
  shadowColor: '#000',
};

export const sharedStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.primary,
    marginBottom: 20,
  },
  button: {
    backgroundColor: theme.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: theme.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: theme.surface,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: theme.text,
    marginVertical: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme.surface,
    padding: 20,
    borderRadius: 10,
    width: '90%',
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: theme.background,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    color: theme.text,
    fontSize: 16,
  },
  modalButton: {
    backgroundColor: theme.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: theme.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: theme.error,
  },
});
