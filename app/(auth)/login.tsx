import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import { isValidEmail } from '@/utils/validation';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { signIn, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async () => {
    setFormError('');
    if (!isValidEmail(email)) {
      setFormError(t('auth.invalidEmail'));
      return;
    }
    if (password.length === 0) {
      setFormError(t('auth.passwordRequired'));
      return;
    }
    try {
      await signIn(email, password);
      router.replace('/');
    } catch {
      setFormError(t('auth.loginFailed'));
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        {t('auth.loginTitle')}
      </Text>
      <TextInput
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        testID="login-email"
      />
      <TextInput
        label={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        testID="login-password"
      />
      {formError ? (
        <HelperText type="error" visible testID="login-error">
          {formError}
        </HelperText>
      ) : null}
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}
        testID="login-submit"
      >
        {t('auth.loginButton')}
      </Button>
      <Link href="/signup" asChild>
        <Button mode="text">{t('auth.goToSignup')}</Button>
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
