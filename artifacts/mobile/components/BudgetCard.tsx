import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { formatAmount } from '@/types';
import type { Category, Budget } from '@/types';

interface BudgetCardProps {
  category: Category;
  budget: Budget;
  spent: number;
}

export function BudgetCard({ category, budget, spent }: BudgetCardProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const percentage = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0;
  const isOverBudget = spent > budget.amount;
  const barColor = isOverBudget ? colors.destructive : percentage > 80 ? colors.warning : colors.primary;
  const remaining = budget.amount - spent;

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: category.color + '20' }]}>
          <Ionicons name={category.icon as keyof typeof Ionicons.glyphMap} size={16} color={category.color} />
        </View>
        <View style={styles.titleArea}>
          <Text style={[styles.name, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
            {category.name}
          </Text>
          <Text style={[styles.budget, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            {formatAmount(spent, user?.currency ?? 'USD')} / {formatAmount(budget.amount, user?.currency ?? 'USD')}
          </Text>
        </View>
        <Text style={[styles.percentage, { color: barColor, fontFamily: 'Inter_600SemiBold' }]}>
          {Math.round(percentage)}%
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.muted }]}>
        <View style={[styles.fill, { width: `${percentage}%`, backgroundColor: barColor }]} />
      </View>
      <Text style={[styles.remaining, { color: isOverBudget ? colors.destructive : colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        {isOverBudget
          ? `Over by ${formatAmount(Math.abs(remaining), user?.currency ?? 'USD')}`
          : `${formatAmount(remaining, user?.currency ?? 'USD')} remaining`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 14,
    gap: 10,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleArea: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 14,
  },
  budget: {
    fontSize: 12,
  },
  percentage: {
    fontSize: 14,
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  remaining: {
    fontSize: 12,
  },
});
