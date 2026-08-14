import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import { validateSignup } from '@/utils/validation';

export default function SignupScreen() {
  const { t } = useTranslation();
  const { signUp, isLoading } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async () => {
    setFormError('');
    const result = validateSignup(fullName, email, password, confirmPassword);
    if (!result.valid) {
      if (result.errors.fullName) setFormError(t('auth.nameRequired'));
      else if (result.errors.email) setFormError(t('auth.invalidEmail'));
      else if (result.errors.password) setFormError(t('auth.passwordTooShort'));
      else if (result.errors.confirmPassword) setFormError(t('auth.passwordMismatch'));
      return;
    }
    try {
      await signUp(email, password, fullName.trim());
      router.replace('/');
    } catch {
      setFormError(t('auth.signupFailed'));
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        {t('auth.signupTitle')}
      </Text>
      <TextInput
        label={t('auth.fullName')}
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
        testID="signup-name"
      />
      <TextInput
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        testID="signup-email"
      />
      <TextInput
        label={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        testID="signup-password"
      />
      <TextInput
        label={t('auth.confirmPassword')}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
        testID="signup-confirm-password"
      />
      {formError ? (
        <HelperText type="error" visible testID="signup-error">
          {formError}
        </HelperText>
      ) : null}
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}
        testID="signup-submit"
      >
        {t('auth.signupButton')}
      </Button>
      <Link href="/login" asChild>
        <Button mode="text">{t('auth.goToLogin')}</Button>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', gap: 12 },
  title: { marginBottom: 16 },
  input: { marginBottom: 4 },
  button: { marginTop: 12 },
});
