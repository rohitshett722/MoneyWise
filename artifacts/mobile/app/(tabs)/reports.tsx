import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { DonutChart, BarChart, ChartLegend } from '@/components/Charts';
import { EmptyState } from '@/components/EmptyState';
import { formatAmount, formatMonthYear, getCurrentMonth, getNextMonth, getPreviousMonth } from '@/types';

export default function Reports() {
  const { colors } = useTheme();
  const { getMonthlyStats, getCategorySpending, getMonthlyTrend } = useFinance();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());

  const stats = getMonthlyStats(currentMonth);
  const categorySpending = getCategorySpending(currentMonth);
  const trend = getMonthlyTrend();

  const topCategories = categorySpending.slice(0, 5);
  const donutData = topCategories.map(cs => ({
    value: cs.amount,
    color: cs.category.color,
    label: cs.category.name,
  }));

  const now = getCurrentMonth();
  const canGoForward = currentMonth < now;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Reports</Text>
      </View>

      {/* Month Picker */}
      <View style={[styles.monthPicker, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => setCurrentMonth(getPreviousMonth(currentMonth))} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.monthText, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
          {formatMonthYear(currentMonth)}
        </Text>
        <TouchableOpacity
          onPress={() => canGoForward && setCurrentMonth(getNextMonth(currentMonth))}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-forward" size={22} color={canGoForward ? colors.foreground : colors.muted} />
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        {[
          { label: 'Income', value: stats.income, color: colors.income, icon: 'trending-up-outline' },
          { label: 'Expense', value: stats.expense, color: colors.expense, icon: 'trending-down-outline' },
          { label: 'Net', value: stats.net, color: stats.net >= 0 ? colors.income : colors.expense, icon: 'wallet-outline' },
        ].map(item => (
          <View key={item.label} style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={18} color={item.color} />
            <Text style={[styles.summaryValue, { color: item.color, fontFamily: 'Inter_700Bold' }]} numberOfLines={1} adjustsFontSizeToFit>
              {formatAmount(Math.abs(item.value), user?.currency ?? 'USD')}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Expense Breakdown */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
          Expense Breakdown
        </Text>
        {categorySpending.length === 0 ? (
          <View style={{ height: 120 }}>
            <EmptyState icon="pie-chart-outline" title="No expenses this month" />
          </View>
        ) : (
          <View style={styles.chartContainer}>
            <DonutChart data={donutData} size={180} />
            <View style={styles.legendWrap}>
              <ChartLegend
                items={topCategories.map(cs => ({
                  color: cs.category.color,
                  label: cs.category.name,
                  value: formatAmount(cs.amount, user?.currency ?? 'USD'),
                }))}
              />
            </View>
          </View>
        )}
      </View>

      {/* 6-Month Trend */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
          6-Month Trend
        </Text>
        <BarChart data={trend} width={320} height={180} />
        <View style={styles.barLegend}>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: colors.income }]} />
            <Text style={[styles.legendText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>Income</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: colors.expense }]} />
            <Text style={[styles.legendText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>Expenses</Text>
          </View>
        </View>
      </View>

      {/* Category Detail */}
      {categorySpending.length > 0 && (
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
            Category Details
          </Text>
          {categorySpending.map(cs => (
            <View key={cs.category.id} style={styles.catRow}>
              <View style={[styles.catIcon, { backgroundColor: cs.category.color + '20' }]}>
                <Ionicons name={cs.category.icon as keyof typeof Ionicons.glyphMap} size={16} color={cs.category.color} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.catTop}>
                  <Text style={[styles.catName, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
                    {cs.category.name}
                  </Text>
                  <Text style={[styles.catAmount, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
                    {formatAmount(cs.amount, user?.currency ?? 'USD')}
                  </Text>
                </View>
                <View style={[styles.catBar, { backgroundColor: colors.muted }]}>
                  <View style={[styles.catBarFill, { width: `${cs.percentage}%`, backgroundColor: cs.category.color }]} />
                </View>
                <Text style={[styles.catPct, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                  {cs.percentage.toFixed(1)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, marginBottom: 16 },
  title: { fontSize: 28 },
  monthPicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20, padding: 14, borderRadius: 14, marginBottom: 16 },
  monthText: { fontSize: 16 },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 16 },
  summaryCard: { flex: 1, padding: 12, borderRadius: 14, gap: 4, alignItems: 'center' },
  summaryValue: { fontSize: 14 },
  summaryLabel: { fontSize: 11 },
  section: { marginHorizontal: 20, borderRadius: 16, padding: 16, marginBottom: 16, gap: 12 },
  sectionTitle: { fontSize: 16 },
  chartContainer: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  legendWrap: { flex: 1 },
  barLegend: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12 },
  catRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 6 },
  catIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  catTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  catName: { fontSize: 14, flex: 1 },
  catAmount: { fontSize: 14 },
  catBar: { height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 2 },
  catBarFill: { height: '100%', borderRadius: 2 },
  catPct: { fontSize: 11 },
});
