import { Ionicons } from '@expo/vector-icons';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useFinance } from '@/context/FinanceContext';
import type { Category } from '@/types';

interface CategoryPickerProps {
  visible: boolean;
  onSelect: (category: Category) => void;
  onClose: () => void;
  transactionType: 'expense' | 'income';
}

export function CategoryPicker({ visible, onSelect, onClose, transactionType }: CategoryPickerProps) {
  const { colors } = useTheme();
  const { categories } = useFinance();
  const insets = useSafeAreaInsets();

  const filtered = categories.filter(c => c.type === transactionType || c.type === 'both');

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 16, borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Category</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {filtered.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.item, { backgroundColor: colors.card }]}
              onPress={() => { onSelect(cat); onClose(); }}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrap, { backgroundColor: cat.color + '20' }]}>
                <Ionicons name={cat.icon as keyof typeof Ionicons.glyphMap} size={22} color={cat.color} />
              </View>
              <Text style={[styles.catName, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
                {cat.name}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 20,
  },
  list: {
    padding: 16,
    gap: 8,
  },
  item: {
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
  catName: {
    flex: 1,
    fontSize: 16,
  },
});
