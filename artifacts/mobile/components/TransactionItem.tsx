import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { formatAmount, formatRelativeDate } from '@/types';
import type { Transaction } from '@/types';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

export function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const { colors } = useTheme();
  const { categories } = useFinance();
  const { user } = useAuth();
  const category = categories.find(c => c.id === transaction.categoryId);
  const isExpense = transaction.type === 'expense';
  const amountColor = isExpense ? colors.expense : colors.income;
  const prefix = isExpense ? '-' : '+';

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, { backgroundColor: category?.color + '20' ?? colors.muted }]}>
        <Ionicons
          name={(category?.icon ?? 'grid') as keyof typeof Ionicons.glyphMap}
          size={20}
          color={category?.color ?? colors.mutedForeground}
        />
      </View>
      <View style={styles.content}>
        <Text style={[styles.name, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]} numberOfLines={1}>
          {category?.name ?? 'Other'}
        </Text>
        {!!transaction.note && (
          <Text style={[styles.note, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]} numberOfLines={1}>
            {transaction.note}
          </Text>
        )}
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: amountColor, fontFamily: 'Inter_600SemiBold' }]}>
          {prefix}{formatAmount(transaction.amount, user?.currency ?? 'USD')}
        </Text>
        <Text style={[styles.date, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          {formatRelativeDate(transaction.date)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 12,
    marginBottom: 8,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
  },
  note: {
    fontSize: 12,
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amount: {
    fontSize: 15,
  },
  date: {
    fontSize: 12,
  },
});
