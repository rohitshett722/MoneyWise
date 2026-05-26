import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { LenDenCard } from '@/components/LenDenCard';
import { EmptyState } from '@/components/EmptyState';
import { StatCard } from '@/components/StatCard';
import { formatAmount } from '@/types';

type Tab = 'lent' | 'borrowed';

export default function LenDen() {
  const { colors } = useTheme();
  const { lendenEntries, updateLenDen, deleteLenDen } = useFinance();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('lent');

  const lentEntries = useMemo(() => lendenEntries.filter(e => e.type === 'lent'), [lendenEntries]);
  const borrowedEntries = useMemo(() => lendenEntries.filter(e => e.type === 'borrowed'), [lendenEntries]);

  const totalLent = lentEntries.filter(e => !e.isSettled).reduce((s, e) => s + e.amount, 0);
  const totalBorrowed = borrowedEntries.filter(e => !e.isSettled).reduce((s, e) => s + e.amount, 0);

  const displayed = activeTab === 'lent' ? lentEntries : borrowedEntries;

  function handleSettle(id: string, current: boolean) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateLenDen(id, { isSettled: !current });
  }

  function handleDelete(id: string) {
    Alert.alert('Delete Entry', 'Remove this record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          deleteLenDen(id);
        },
      },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Len / Den</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.statsRow}>
        <StatCard
          label="Total Lent"
          value={formatAmount(totalLent, user?.currency ?? 'USD')}
          icon="arrow-up-circle-outline"
          color={colors.lent}
        />
        <StatCard
          label="Total Borrowed"
          value={formatAmount(totalBorrowed, user?.currency ?? 'USD')}
          icon="arrow-down-circle-outline"
          color={colors.borrowed}
        />
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.muted }]}>
        {(['lent', 'borrowed'] as Tab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && { backgroundColor: colors.card }]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab ? colors.foreground : colors.mutedForeground,
                  fontFamily: activeTab === tab ? 'Inter_600SemiBold' : 'Inter_400Regular',
                },
              ]}
            >
              {tab === 'lent' ? `Lent (${lentEntries.length})` : `Borrowed (${borrowedEntries.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {displayed.length === 0 ? (
        <View style={{ flex: 1 }}>
          <EmptyState
            icon={activeTab === 'lent' ? 'arrow-up-circle-outline' : 'arrow-down-circle-outline'}
            title={activeTab === 'lent' ? 'No lending records' : 'No borrowing records'}
            subtitle="Tap + to add a record"
          />
        </View>
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 100, paddingTop: 8 }}
          renderItem={({ item }) => (
            <LenDenCard
              entry={item}
              onSettle={() => handleSettle(item.id, item.isSettled)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + 80 }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push({ pathname: '/lenden/add', params: { type: activeTab } });
        }}
      >
        <Ionicons name="add" size={28} color={colors.primaryForeground} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, marginBottom: 16 },
  title: { fontSize: 28 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 16 },
  tabs: { flexDirection: 'row', marginHorizontal: 20, borderRadius: 12, padding: 4, marginBottom: 8 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center' },
  tabText: { fontSize: 14 },
  fab: { position: 'absolute', right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8 },
});
