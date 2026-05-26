import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { formatAmount, formatDate } from '@/types';
import type { LenDenEntry } from '@/types';

interface LenDenCardProps {
  entry: LenDenEntry;
  onSettle?: () => void;
  onDelete?: () => void;
  onPress?: () => void;
}

export function LenDenCard({ entry, onSettle, onDelete, onPress }: LenDenCardProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const isLent = entry.type === 'lent';
  const color = isLent ? colors.lent : colors.borrowed;
  const icon = isLent ? 'arrow-up-circle' : 'arrow-down-circle';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconWrap, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.person, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]} numberOfLines={1}>
            {entry.person}
          </Text>
          <Text style={[styles.amount, { color, fontFamily: 'Inter_700Bold' }]}>
            {formatAmount(entry.amount, user?.currency ?? 'USD')}
          </Text>
        </View>
        {!!entry.note && (
          <Text style={[styles.note, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]} numberOfLines={1}>
            {entry.note}
          </Text>
        )}
        <View style={styles.bottomRow}>
          <Text style={[styles.date, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            {formatDate(entry.date)}
            {entry.dueDate ? ` · Due ${formatDate(entry.dueDate)}` : ''}
          </Text>
          <View style={styles.actions}>
            {onSettle && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: entry.isSettled ? colors.muted : color + '20' }]}
                onPress={onSettle}
              >
                <Ionicons
                  name={entry.isSettled ? 'checkmark-circle' : 'checkmark-circle-outline'}
                  size={16}
                  color={entry.isSettled ? colors.mutedForeground : color}
                />
                <Text style={[styles.actionText, { color: entry.isSettled ? colors.mutedForeground : color, fontFamily: 'Inter_500Medium' }]}>
                  {entry.isSettled ? 'Settled' : 'Settle'}
                </Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="trash-outline" size={16} color={colors.destructive} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 14,
    gap: 12,
    marginBottom: 10,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  person: {
    fontSize: 15,
    flex: 1,
    marginRight: 8,
  },
  amount: {
    fontSize: 16,
  },
  note: {
    fontSize: 13,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
  },
});
