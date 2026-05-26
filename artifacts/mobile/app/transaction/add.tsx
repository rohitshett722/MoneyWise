import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { CategoryPicker } from '@/components/CategoryPicker';
import { getCurrencySymbol } from '@/types';
import type { Category } from '@/types';

type TxType = 'expense' | 'income';

export default function AddTransaction() {
  const { colors } = useTheme();
  const { transactions, addTransaction, updateTransaction, deleteTransaction, categories } = useFinance();
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string; type?: string }>();

  const existing = params.id ? transactions.find(t => t.id === params.id) : null;

  const [txType, setTxType] = useState<TxType>(
    (existing?.type ?? params.type ?? 'expense') as TxType
  );
  const [amount, setAmount] = useState(existing ? existing.amount.toString() : '');
  const [note, setNote] = useState(existing?.note ?? '');
  const [date, setDate] = useState(existing?.date ?? new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    existing ? (categories.find(c => c.id === existing.categoryId) ?? null) : null
  );
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const symbol = getCurrencySymbol(user?.currency ?? 'USD');
  const isEdit = !!existing;

  async function handleSave() {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Select Category', 'Please select a category.');
      return;
    }
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert('Invalid Date', 'Date must be in YYYY-MM-DD format.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (isEdit && existing) {
      await updateTransaction(existing.id, {
        type: txType,
        amount: numAmount,
        categoryId: selectedCategory.id,
        note: note.trim(),
        date,
      });
    } else {
      await addTransaction({
        type: txType,
        amount: numAmount,
        categoryId: selectedCategory.id,
        note: note.trim(),
        date,
      });
    }
    router.back();
  }

  function handleDelete() {
    if (!existing) return;
    Alert.alert('Delete Transaction', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await deleteTransaction(existing.id);
          router.back();
        },
      },
    ]);
  }

  const isExpense = txType === 'expense';
  const typeColor = isExpense ? colors.expense : colors.income;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Type Toggle */}
        <View style={[styles.typeToggle, { backgroundColor: colors.muted }]}>
          {(['expense', 'income'] as TxType[]).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.typeBtn, txType === t && { backgroundColor: t === 'expense' ? colors.expense : colors.income }]}
              onPress={() => { setTxType(t); setSelectedCategory(null); }}
            >
              <Text style={[styles.typeText, {
                color: txType === t ? '#fff' : colors.mutedForeground,
                fontFamily: txType === t ? 'Inter_600SemiBold' : 'Inter_400Regular',
              }]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amount */}
        <View style={[styles.amountCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.symbolText, { color: typeColor, fontFamily: 'Inter_700Bold' }]}>{symbol}</Text>
          <TextInput
            style={[styles.amountInput, { color: typeColor, fontFamily: 'Inter_700Bold' }]}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            autoFocus={!isEdit}
          />
        </View>

        {/* Category */}
        <View style={styles.fields}>
          <TouchableOpacity
            style={[styles.field, { backgroundColor: colors.card }]}
            onPress={() => setShowCategoryPicker(true)}
          >
            <View style={[styles.fieldIcon, { backgroundColor: selectedCategory ? selectedCategory.color + '20' : colors.muted }]}>
              <Ionicons
                name={selectedCategory ? (selectedCategory.icon as keyof typeof Ionicons.glyphMap) : 'grid-outline'}
                size={20}
                color={selectedCategory ? selectedCategory.color : colors.mutedForeground}
              />
            </View>
            <Text style={[styles.fieldText, { color: selectedCategory ? colors.foreground : colors.mutedForeground, fontFamily: selectedCategory ? 'Inter_500Medium' : 'Inter_400Regular' }]}>
              {selectedCategory ? selectedCategory.name : 'Select Category'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>

          {/* Note */}
          <View style={[styles.field, { backgroundColor: colors.card }]}>
            <View style={[styles.fieldIcon, { backgroundColor: colors.muted }]}>
              <Ionicons name="document-text-outline" size={20} color={colors.mutedForeground} />
            </View>
            <TextInput
              style={[styles.noteInput, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
              value={note}
              onChangeText={setNote}
              placeholder="Add a note (optional)"
              placeholderTextColor={colors.mutedForeground}
              returnKeyType="done"
            />
          </View>

          {/* Date */}
          <View style={[styles.field, { backgroundColor: colors.card }]}>
            <View style={[styles.fieldIcon, { backgroundColor: colors.muted }]}>
              <Ionicons name="calendar-outline" size={20} color={colors.mutedForeground} />
            </View>
            <TextInput
              style={[styles.noteInput, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: typeColor }]}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={[styles.saveBtnText, { color: '#fff', fontFamily: 'Inter_600SemiBold' }]}>
            {isEdit ? 'Update Transaction' : 'Add Transaction'}
          </Text>
        </TouchableOpacity>

        {isEdit && (
          <TouchableOpacity style={[styles.deleteBtn, { borderColor: colors.destructive }]} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={18} color={colors.destructive} />
            <Text style={[styles.deleteBtnText, { color: colors.destructive, fontFamily: 'Inter_500Medium' }]}>
              Delete Transaction
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <CategoryPicker
        visible={showCategoryPicker}
        onSelect={setSelectedCategory}
        onClose={() => setShowCategoryPicker(false)}
        transactionType={txType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 16 },
  typeToggle: { flexDirection: 'row', borderRadius: 12, padding: 4, gap: 4 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  typeText: { fontSize: 15 },
  amountCard: { borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  symbolText: { fontSize: 32, marginRight: 4 },
  amountInput: { fontSize: 48, minWidth: 80, textAlign: 'center' },
  fields: { gap: 10 },
  field: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, gap: 12 },
  fieldIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  fieldText: { flex: 1, fontSize: 15 },
  noteInput: { flex: 1, fontSize: 15 },
  saveBtn: { height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  saveBtnText: { fontSize: 16 },
  deleteBtn: { height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8, borderWidth: 1.5 },
  deleteBtnText: { fontSize: 15 },
});
