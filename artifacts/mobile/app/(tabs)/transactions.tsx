import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, FlatList, SectionList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useFinance } from '@/context/FinanceContext';
import { TransactionItem } from '@/components/TransactionItem';
import { EmptyState } from '@/components/EmptyState';
import { formatRelativeDate } from '@/types';
import type { Transaction } from '@/types';

type FilterType = 'all' | 'income' | 'expense';

export default function Transactions() {
  const { colors } = useTheme();
  const { transactions, deleteTransaction } = useFinance();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const { categories } = useFinance();

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (filter !== 'all') list = list.filter(t => t.type === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t => {
        const cat = categories.find(c => c.id === t.categoryId);
        return (
          cat?.name.toLowerCase().includes(q) ||
          t.note.toLowerCase().includes(q) ||
          t.amount.toString().includes(q)
        );
      });
    }
    return list;
  }, [transactions, filter, search, categories]);

  const sections = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filtered.forEach(t => {
      const key = formatRelativeDate(t.date);
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    return Object.entries(groups).map(([title, data]) => ({ title, data }));
  }, [filtered]);

  function confirmDelete(id: string) {
    Alert.alert('Delete Transaction', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          deleteTransaction(id);
        },
      },
    ]);
  }

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'income', label: 'Income' },
    { key: 'expense', label: 'Expense' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Transactions</Text>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: colors.card, marginHorizontal: 20 }]}>
        <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Search transactions..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === f.key ? colors.primary : colors.card,
              },
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: filter === f.key ? colors.primaryForeground : colors.foreground,
                  fontFamily: filter === f.key ? 'Inter_600SemiBold' : 'Inter_400Regular',
                },
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {sections.length === 0 ? (
        <View style={{ flex: 1 }}>
          <EmptyState
            icon="receipt-outline"
            title="No transactions found"
            subtitle={search ? 'Try a different search term' : 'Tap + to add your first transaction'}
          />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 100 }}
          renderSectionHeader={({ section }) => (
            <Text style={[styles.sectionHeader, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium', backgroundColor: colors.background }]}>
              {section.title}
            </Text>
          )}
          renderItem={({ item }) => (
            <TransactionItem
              transaction={item}
              onPress={() => router.push({ pathname: '/transaction/add', params: { id: item.id } })}
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
          router.push('/transaction/add');
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
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 16 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  filterText: { fontSize: 14 },
  sectionHeader: { fontSize: 13, paddingTop: 8, paddingBottom: 6 },
  fab: { position: 'absolute', right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8 },
});
