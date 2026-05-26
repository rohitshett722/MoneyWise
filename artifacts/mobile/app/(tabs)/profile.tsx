import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { CURRENCIES } from '@/types';
import type { ThemeMode } from '@/types';

export default function Profile() {
  const { colors, themeMode, setThemeMode, isDark } = useTheme();
  const { user, logout, updateProfile } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(user?.name ?? '');
  const [editCurrency, setEditCurrency] = useState(user?.currency ?? 'USD');
  const [showCurrencies, setShowCurrencies] = useState(false);

  const initials = user?.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'U';

  async function handleSaveProfile() {
    if (!editName.trim()) { Alert.alert('Error', 'Name cannot be empty.'); return; }
    await updateProfile({ name: editName.trim(), currency: editCurrency });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditModalVisible(false);
  }

  function handleLogout() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth/login');
        },
      },
    ]);
  }

  const THEME_OPTIONS: { key: ThemeMode; label: string; icon: string }[] = [
    { key: 'light', label: 'Light', icon: 'sunny-outline' },
    { key: 'dark', label: 'Dark', icon: 'moon-outline' },
    { key: 'system', label: 'System', icon: 'phone-portrait-outline' },
  ];

  const SettingRow = ({ icon, label, onPress, right, color }: { icon: string; label: string; onPress?: () => void; right?: React.ReactNode; color?: string }) => (
    <TouchableOpacity
      style={[styles.settingRow, { borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.settingIcon, { backgroundColor: (color ?? colors.primary) + '18' }]}>
        <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color={color ?? colors.primary} />
      </View>
      <Text style={[styles.settingLabel, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>{label}</Text>
      {right ?? (onPress && <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />)}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Profile</Text>
      </View>

      {/* User Card */}
      <View style={[styles.userCard, { backgroundColor: colors.card }]}>
        <View style={[styles.avatarBig, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.primaryForeground, fontFamily: 'Inter_700Bold' }]}>{initials}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>{user?.name}</Text>
          <Text style={[styles.userEmail, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{user?.email}</Text>
          <Text style={[styles.userCurrency, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            {CURRENCIES.find(c => c.code === user?.currency)?.symbol} {user?.currency}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.editBtn, { backgroundColor: colors.secondary }]}
          onPress={() => { setEditName(user?.name ?? ''); setEditCurrency(user?.currency ?? 'USD'); setEditModalVisible(true); }}
        >
          <Ionicons name="pencil-outline" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Theme */}
      <View style={styles.sectionBlock}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>APPEARANCE</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.themeChip,
                  { backgroundColor: themeMode === opt.key ? colors.primary : colors.muted },
                ]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setThemeMode(opt.key); }}
              >
                <Ionicons name={opt.icon as keyof typeof Ionicons.glyphMap} size={16} color={themeMode === opt.key ? colors.primaryForeground : colors.mutedForeground} />
                <Text style={[styles.themeChipText, { color: themeMode === opt.key ? colors.primaryForeground : colors.foreground, fontFamily: themeMode === opt.key ? 'Inter_600SemiBold' : 'Inter_400Regular' }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Data Management */}
      <View style={styles.sectionBlock}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>DATA</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SettingRow icon="grid-outline" label="Categories" onPress={() => router.push('/categories/index')} />
          <SettingRow icon="wallet-outline" label="Budgets" onPress={() => router.push('/budget/index')} color={colors.warning} />
        </View>
      </View>

      {/* Account */}
      <View style={styles.sectionBlock}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>ACCOUNT</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SettingRow icon="log-out-outline" label="Sign Out" onPress={handleLogout} color={colors.destructive} />
        </View>
      </View>

      <Text style={[styles.version, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        MoneyWise v1.0.0
      </Text>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditModalVisible(false)}>
        <View style={[styles.modal, { backgroundColor: colors.background, paddingTop: insets.top + 16 }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSaveProfile}>
              <Text style={[styles.saveText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <Text style={[styles.label, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border }]}
              value={editName}
              onChangeText={setEditName}
              placeholder="Your name"
              placeholderTextColor={colors.mutedForeground}
            />
            <Text style={[styles.label, { color: colors.foreground, fontFamily: 'Inter_500Medium', marginTop: 16 }]}>Currency</Text>
            <TouchableOpacity
              style={[styles.inputRow, { backgroundColor: colors.input, borderColor: colors.border }]}
              onPress={() => setShowCurrencies(v => !v)}
            >
              <Text style={[{ flex: 1, fontSize: 15, color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>
                {CURRENCIES.find(c => c.code === editCurrency)?.symbol} {CURRENCIES.find(c => c.code === editCurrency)?.name} ({editCurrency})
              </Text>
              <Ionicons name={showCurrencies ? 'chevron-up' : 'chevron-down'} size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
            {showCurrencies && (
              <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {CURRENCIES.map(c => (
                  <TouchableOpacity
                    key={c.code}
                    style={[styles.dropItem, { borderBottomColor: colors.border }]}
                    onPress={() => { setEditCurrency(c.code); setShowCurrencies(false); }}
                  >
                    <Text style={[{ fontSize: 14, color: editCurrency === c.code ? colors.primary : colors.foreground, fontFamily: editCurrency === c.code ? 'Inter_600SemiBold' : 'Inter_400Regular' }]}>
                      {c.symbol} {c.name} ({c.code})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, marginBottom: 16 },
  title: { fontSize: 28 },
  userCard: { marginHorizontal: 20, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  avatarBig: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 22 },
  userInfo: { flex: 1, gap: 2 },
  userName: { fontSize: 18 },
  userEmail: { fontSize: 13 },
  userCurrency: { fontSize: 13, marginTop: 2 },
  editBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionBlock: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 12, marginBottom: 8, letterSpacing: 0.8 },
  card: { borderRadius: 14, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  settingIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  settingLabel: { flex: 1, fontSize: 15 },
  themeRow: { flexDirection: 'row', padding: 10, gap: 8 },
  themeChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  themeChipText: { fontSize: 13 },
  version: { textAlign: 'center', fontSize: 12, marginTop: 8, paddingBottom: 20 },
  modal: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  modalTitle: { fontSize: 18 },
  saveText: { fontSize: 16 },
  modalContent: { padding: 20 },
  label: { fontSize: 14, marginBottom: 6 },
  input: { height: 52, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, fontSize: 15, fontFamily: 'Inter_400Regular' },
  inputRow: { height: 52, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  dropdown: { borderRadius: 12, borderWidth: 1, marginTop: 4, overflow: 'hidden' },
  dropItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
});
