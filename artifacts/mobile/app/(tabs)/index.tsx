import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useFinance } from '@/context/FinanceContext';
import { TransactionItem } from '@/components/TransactionItem';
import { EmptyState } from '@/components/EmptyState';
import { formatAmount, getCurrentMonth } from '@/types';

export default function Dashboard() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { transactions, lendenEntries, getMonthlyStats, getTotalBalance } = useFinance();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const currentMonth = getCurrentMonth();
  const stats = getMonthlyStats(currentMonth);
  const totalBalance = getTotalBalance();
  const recentTransactions = transactions.slice(0, 5);
  const pendingLenDen = lendenEntries.filter(e => !e.isSettled).slice(0, 3);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const initials = user?.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'U';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            {greeting()},
          </Text>
          <Text style={[styles.userName, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            {user?.name ?? 'User'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.avatar, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Text style={[styles.avatarText, { color: colors.primaryForeground, fontFamily: 'Inter_700Bold' }]}>
            {initials}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceSection}>
        <LinearGradient
          colors={isDark ? ['#0A2E28', '#0D3D32'] : ['#00C896', '#00A07A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <Text style={[styles.balanceLabel, { color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter_400Regular' }]}>
            Total Balance
          </Text>
          <Text style={[styles.balanceAmount, { color: '#FFFFFF', fontFamily: 'Inter_700Bold' }]}>
            {formatAmount(totalBalance, user?.currency ?? 'USD')}
          </Text>
          <View style={styles.balanceStats}>
            <View style={styles.balanceStat}>
              <View style={styles.balanceStatIcon}>
                <Ionicons name="arrow-down-circle" size={16} color="rgba(255,255,255,0.8)" />
              </View>
              <View>
                <Text style={[styles.balanceStatLabel, { fontFamily: 'Inter_400Regular' }]}>Income</Text>
                <Text style={[styles.balanceStatValue, { fontFamily: 'Inter_600SemiBold' }]}>
                  {formatAmount(stats.income, user?.currency ?? 'USD')}
                </Text>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={styles.balanceStat}>
              <View style={styles.balanceStatIcon}>
                <Ionicons name="arrow-up-circle" size={16} color="rgba(255,255,255,0.8)" />
              </View>
              <View>
                <Text style={[styles.balanceStatLabel, { fontFamily: 'Inter_400Regular' }]}>Expenses</Text>
                <Text style={[styles.balanceStatValue, { fontFamily: 'Inter_600SemiBold' }]}>
                  {formatAmount(stats.expense, user?.currency ?? 'USD')}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Quick Actions */}
      <View style={styles.actions}>
        {[
          { icon: 'remove-circle-outline', label: 'Expense', color: colors.expense, type: 'expense' },
          { icon: 'add-circle-outline', label: 'Income', color: colors.income, type: 'income' },
          { icon: 'people-outline', label: 'Len/Den', color: colors.lent, type: 'lenden' },
        ].map(action => (
          <TouchableOpacity
            key={action.label}
            style={[styles.actionBtn, { backgroundColor: colors.card }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (action.type === 'lenden') {
                router.push('/lenden/add');
              } else {
                router.push({ pathname: '/transaction/add', params: { type: action.type } });
              }
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: action.color + '18' }]}>
              <Ionicons name={action.icon as keyof typeof Ionicons.glyphMap} size={22} color={action.color} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Pending Len/Den */}
      {pendingLenDen.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
              Pending Len/Den
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/lenden')}>
              <Text style={[styles.seeAll, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>See all</Text>
            </TouchableOpacity>
          </View>
          {pendingLenDen.map(entry => (
            <View key={entry.id} style={[styles.pendingRow, { backgroundColor: colors.card }]}>
              <View style={[styles.pendingIcon, { backgroundColor: (entry.type === 'lent' ? colors.lent : colors.borrowed) + '18' }]}>
                <Ionicons
                  name={entry.type === 'lent' ? 'arrow-up' : 'arrow-down'}
                  size={14}
                  color={entry.type === 'lent' ? colors.lent : colors.borrowed}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.pendingPerson, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
                  {entry.person}
                </Text>
                <Text style={[styles.pendingType, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                  {entry.type === 'lent' ? 'You lent' : 'You borrowed'}
                </Text>
              </View>
              <Text style={[styles.pendingAmount, { color: entry.type === 'lent' ? colors.lent : colors.borrowed, fontFamily: 'Inter_600SemiBold' }]}>
                {formatAmount(entry.amount, user?.currency ?? 'USD')}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
            Recent Transactions
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
            <Text style={[styles.seeAll, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>See all</Text>
          </TouchableOpacity>
        </View>
        {recentTransactions.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
            <EmptyState icon="receipt-outline" title="No transactions yet" subtitle="Tap + to add your first transaction" />
          </View>
        ) : (
          recentTransactions.map(tx => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              onPress={() => router.push({ pathname: '/transaction/add', params: { id: tx.id } })}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  greeting: { fontSize: 14 },
  userName: { fontSize: 22, marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16 },
  balanceSection: { paddingHorizontal: 20, marginBottom: 20 },
  balanceCard: { borderRadius: 20, padding: 20, gap: 8 },
  balanceLabel: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  balanceAmount: { fontSize: 36, color: '#fff' },
  balanceStats: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 16 },
  balanceStat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  balanceStatIcon: { opacity: 0.8 },
  balanceStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  balanceStatValue: { fontSize: 14, color: '#fff' },
  divider: { width: 1, height: 32 },
  actions: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  actionBtn: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', gap: 6 },
  actionIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 12 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17 },
  seeAll: { fontSize: 14 },
  emptyCard: { borderRadius: 14, height: 120, justifyContent: 'center', alignItems: 'center' },
  pendingRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, gap: 10, marginBottom: 8 },
  pendingIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  pendingPerson: { fontSize: 14 },
  pendingType: { fontSize: 12 },
  pendingAmount: { fontSize: 14 },
});
