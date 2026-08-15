import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, HelperText, Avatar, Surface } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import { isValidEmail } from '@/utils/validation';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { signIn, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <View style={styles.screen}>
      <Surface style={styles.card} elevation={2}>
        <View style={styles.header}>
          <Avatar.Icon size={64} icon="brain" style={styles.avatar} />
          <Text variant="headlineSmall" style={styles.title}>
            {t('auth.loginTitle')}
          </Text>
        </View>
        <TextInput
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          left={<TextInput.Icon icon="email-outline" />}
          style={styles.input}
          testID="login-email"
        />
        <TextInput
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          left={<TextInput.Icon icon="lock-outline" />}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              accessibilityLabel={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              onPress={() => setShowPassword((prev) => !prev)}
            />
          }
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
          icon="login"
          style={styles.button}
          testID="login-submit"
        >
          {t('auth.loginButton')}
        </Button>
        <Link href="/signup" asChild>
          <Button mode="text">{t('auth.goToSignup')}</Button>
        </Link>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', padding: 24 },
  card: { borderRadius: 16, padding: 24, gap: 4 },
  header: { alignItems: 'center', gap: 8, marginBottom: 16 },
  avatar: { marginBottom: 4 },
  title: { textAlign: 'center' },
  input: { marginBottom: 4 },
  button: { marginTop: 12 },
});
