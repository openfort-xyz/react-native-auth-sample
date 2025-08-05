// styles.js
import { StyleSheet } from 'react-native';
import { Colors } from './theme';

export const commonStyles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: Colors.text,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    width: '80%',
  },
  title: {
    marginBottom: 12,
    fontSize: 20,
    fontWeight: 'bold',
  },
});
