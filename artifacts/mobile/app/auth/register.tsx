import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { CURRENCIES } from '@/types';

export default function Register() {
  const { colors } = useTheme();
  const { register } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrencies, setShowCurrencies] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedCurrency = CURRENCIES.find(c => c.code === currency)!;

  async function handleRegister() {
    if (!name.trim()) { Alert.alert('Missing Name', 'Please enter your name.'); return; }
    if (!email.trim()) { Alert.alert('Missing Email', 'Please enter your email.'); return; }
    if (password.length < 4) { Alert.alert('Weak Password', 'Password must be at least 4 characters.'); return; }
    setLoading(true);
    const result = await register(name.trim(), email.trim(), password, currency);
    setLoading(false);
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Registration Failed', result.error ?? 'Something went wrong.');
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            Start managing your finances today
          </Text>
        </View>

        <View style={styles.form}>
          {[
            { label: 'Full Name', value: name, onChange: setName, placeholder: 'John Doe', type: 'default' as const },
            { label: 'Email', value: email, onChange: setEmail, placeholder: 'you@example.com', type: 'email-address' as const },
          ].map(field => (
            <View key={field.label}>
              <Text style={[styles.label, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>{field.label}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border }]}
                value={field.value}
                onChangeText={field.onChange}
                placeholder={field.placeholder}
                placeholderTextColor={colors.mutedForeground}
                keyboardType={field.type}
                autoCapitalize={field.type === 'email-address' ? 'none' : 'words'}
              />
            </View>
          ))}

          <View>
            <Text style={[styles.label, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>Password</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.input, borderColor: colors.border }]}>
              <TextInput
                style={[styles.inputInner, { color: colors.foreground }]}
                value={password}
                onChangeText={setPassword}
                placeholder="At least 4 characters"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <Text style={[styles.label, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>Currency</Text>
            <TouchableOpacity
              style={[styles.inputWrap, { backgroundColor: colors.input, borderColor: colors.border }]}
              onPress={() => setShowCurrencies(v => !v)}
            >
              <Text style={[styles.inputInner, { color: colors.foreground, paddingVertical: 14, fontFamily: 'Inter_400Regular' }]}>
                {selectedCurrency.symbol} {selectedCurrency.name} ({selectedCurrency.code})
              </Text>
              <Ionicons name={showCurrencies ? 'chevron-up' : 'chevron-down'} size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
            {showCurrencies && (
              <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {CURRENCIES.map(c => (
                  <TouchableOpacity
                    key={c.code}
                    style={[styles.dropItem, { borderBottomColor: colors.border }]}
                    onPress={() => { setCurrency(c.code); setShowCurrencies(false); }}
                  >
                    <Text style={[styles.dropText, { color: currency === c.code ? colors.primary : colors.foreground, fontFamily: currency === c.code ? 'Inter_600SemiBold' : 'Inter_400Regular' }]}>
                      {c.symbol} {c.name} ({c.code})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={[styles.btnText, { color: colors.primaryForeground, fontFamily: 'Inter_600SemiBold' }]}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push('/auth/login')} style={styles.loginRow}>
          <Text style={[styles.loginText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            Already have an account?{' '}
            <Text style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold' }}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, gap: 24 },
  header: { gap: 8, paddingVertical: 8 },
  title: { fontSize: 26 },
  subtitle: { fontSize: 15 },
  form: { gap: 16 },
  label: { fontSize: 14, marginBottom: 6 },
  input: { height: 52, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, fontSize: 15, fontFamily: 'Inter_400Regular' },
  inputWrap: { height: 52, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  inputInner: { flex: 1, fontSize: 15 },
  dropdown: { borderRadius: 12, borderWidth: 1, marginTop: 4, overflow: 'hidden' },
  dropItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  dropText: { fontSize: 14 },
  btn: { height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  btnText: { fontSize: 16 },
  loginRow: { alignItems: 'center' },
  loginText: { fontSize: 14 },
});
