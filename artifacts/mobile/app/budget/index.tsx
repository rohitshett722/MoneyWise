import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { BudgetCard } from '@/components/BudgetCard';
import { EmptyState } from '@/components/EmptyState';
import { CategoryPicker } from '@/components/CategoryPicker';
import { getCurrencySymbol, getCurrentMonth, formatMonthYear, getPreviousMonth, getNextMonth } from '@/types';
import type { Category } from '@/types';

export default function Budgets() {
  const { colors } = useTheme();
  const { categories, budgets, setBudget, deleteBudget, getMonthlyStats, transactions } = useFinance();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const symbol = getCurrencySymbol(user?.currency ?? 'USD');
  const now = getCurrentMonth();
  const canGoForward = currentMonth < now;

  const monthBudgets = budgets.filter(b => b.month === currentMonth);

  function getSpentForCategory(categoryId: string): number {
    return transactions
      .filter(t => t.type === 'expense' && t.categoryId === categoryId && t.date.startsWith(currentMonth))
      .reduce((s, t) => s + t.amount, 0);
  }

  async function handleAddBudget() {
    if (!selectedCategory) { Alert.alert('Select Category', 'Please choose a category.'); return; }
    const num = parseFloat(budgetAmount);
    if (!budgetAmount || isNaN(num) || num <= 0) { Alert.alert('Invalid Amount', 'Enter a valid budget amount.'); return; }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await setBudget(selectedCategory.id, num, currentMonth);
    setAddModalVisible(false);
    setSelectedCategory(null);
    setBudgetAmount('');
  }

  const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'both');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Month Picker */}
      <View style={[styles.monthPicker, { backgroundColor: colors.card, marginTop: 16 }]}>
        <TouchableOpacity onPress={() => setCurrentMonth(getPreviousMonth(currentMonth))} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.monthText, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
          {formatMonthYear(currentMonth)}
        </Text>
        <TouchableOpacity onPress={() => canGoForward && setCurrentMonth(getNextMonth(currentMonth))} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-forward" size={22} color={canGoForward ? colors.foreground : colors.muted} />
        </TouchableOpacity>
      </View>

      {monthBudgets.length === 0 ? (
        <View style={{ flex: 1 }}>
          <EmptyState icon="wallet-outline" title="No budgets set" subtitle="Tap + to set a budget for a category" />
        </View>
      ) : (
        <FlatList
          data={monthBudgets}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const cat = categories.find(c => c.id === item.categoryId);
            if (!cat) return null;
            return (
              <BudgetCard
                category={cat}
                budget={item}
                spent={getSpentForCategory(item.categoryId)}
              />
            );
          }}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + 24 }]}
        onPress={() => setAddModalVisible(true)}
      >
        <Ionicons name="add" size={28} color={colors.primaryForeground} />
      </TouchableOpacity>

      {/* Add Budget Modal */}
      <Modal visible={addModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setAddModalVisible(false)}>
        <View style={[styles.modal, { backgroundColor: colors.background, paddingTop: insets.top + 16 }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setAddModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Set Budget</Text>
            <TouchableOpacity onPress={handleAddBudget}>
              <Text style={[styles.saveText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>Save</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={[styles.field, { backgroundColor: colors.card }]}
              onPress={() => setShowCategoryPicker(true)}
            >
              <View style={[styles.fieldIcon, { backgroundColor: selectedCategory ? selectedCategory.color + '20' : colors.muted }]}>
                <Ionicons
                  name={(selectedCategory?.icon ?? 'grid-outline') as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={selectedCategory ? selectedCategory.color : colors.mutedForeground}
                />
              </View>
              <Text style={[styles.fieldText, { color: selectedCategory ? colors.foreground : colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                {selectedCategory ? selectedCategory.name : 'Select Category'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>

            <View style={[styles.amountRow, { backgroundColor: colors.card }]}>
              <Text style={[styles.symbol, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>{symbol}</Text>
              <TextInput
                style={[styles.amountInput, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}
                value={budgetAmount}
                onChangeText={setBudgetAmount}
                placeholder="0.00"
                placeholderTextColor={colors.muted}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>
        <CategoryPicker
          visible={showCategoryPicker}
          onSelect={setSelectedCategory}
          onClose={() => setShowCategoryPicker(false)}
          transactionType="expense"
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  monthPicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20, padding: 14, borderRadius: 14, marginBottom: 8 },
  monthText: { fontSize: 16 },
  fab: { position: 'absolute', right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8 },
  modal: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  modalTitle: { fontSize: 18 },
  saveText: { fontSize: 16 },
  modalContent: { padding: 20, gap: 12 },
  field: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, gap: 12 },
  fieldIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  fieldText: { flex: 1, fontSize: 15 },
  amountRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, gap: 8 },
  symbol: { fontSize: 24 },
  amountInput: { flex: 1, fontSize: 32 },
});
