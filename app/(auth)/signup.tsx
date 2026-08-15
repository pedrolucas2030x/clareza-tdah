import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, HelperText, Avatar, Surface } from 'react-native-paper';
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
  const [showPassword, setShowPassword] = useState(false);
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
    <View style={styles.screen}>
      <Surface style={styles.card} elevation={2}>
        <View style={styles.header}>
          <Avatar.Icon size={64} icon="brain" style={styles.avatar} />
          <Text variant="headlineSmall" style={styles.title}>
            {t('auth.signupTitle')}
          </Text>
        </View>
        <TextInput
          label={t('auth.fullName')}
          value={fullName}
          onChangeText={setFullName}
          left={<TextInput.Icon icon="account-outline" />}
          style={styles.input}
          testID="signup-name"
        />
        <TextInput
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          left={<TextInput.Icon icon="email-outline" />}
          style={styles.input}
          testID="signup-email"
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
          testID="signup-password"
        />
        <TextInput
          label={t('auth.confirmPassword')}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
          left={<TextInput.Icon icon="lock-check-outline" />}
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
          icon="account-plus-outline"
          style={styles.button}
          testID="signup-submit"
        >
          {t('auth.signupButton')}
        </Button>
        <Link href="/login" asChild>
          <Button mode="text">{t('auth.goToLogin')}</Button>
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
