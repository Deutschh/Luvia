import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '../theme/colors';

type AppInputProps = TextInputProps;

export function AppInput(props: AppInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      style={styles.input}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    minHeight: 52,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    color: colors.text,
    fontSize: 15,
    marginTop: 12,
  },
});