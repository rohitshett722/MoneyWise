import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { getCurrencySymbol } from '@/types';

type LDType = 'lent' | 'borrowed';

export default function AddLenDen() {
  const { colors } = useTheme();
  const { lendenEntries, addLenDen, updateLenDen, deleteLenDen } = useFinance();
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string; type?: string }>();

  const existing = params.id ? lendenEntries.find(e => e.id === params.id) : null;
  const [ldType, setLdType] = useState<LDType>((existing?.type ?? params.type ?? 'lent') as LDType);
  const [amount, setAmount] = useState(existing ? existing.amount.toString() : '');
  const [person, setPerson] = useState(existing?.person ?? '');
  const [note, setNote] = useState(existing?.note ?? '');
  const [date, setDate] = useState(existing?.date ?? new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(existing?.dueDate ?? '');

  const symbol = getCurrencySymbol(user?.currency ?? 'USD');
  const isEdit = !!existing;
  const typeColor = ldType === 'lent' ? colors.lent : colors.borrowed;

  async function handleSave() {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.'); return;
    }
    if (!person.trim()) {
      Alert.alert('Missing Person', 'Please enter the person\'s name.'); return;
    }
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert('Invalid Date', 'Date must be in YYYY-MM-DD format.'); return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const entry = {
      type: ldType,
      amount: numAmount,
      person: person.trim(),
      note: note.trim(),
      date,
      dueDate: dueDate.trim() || undefined,
      isSettled: existing?.isSettled ?? false,
    };

    if (isEdit && existing) {
      await updateLenDen(existing.id, entry);
    } else {
      await addLenDen(entry);
    }
    router.back();
  }

  function handleDelete() {
    if (!existing) return;
    Alert.alert('Delete Entry', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await deleteLenDen(existing.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Type Toggle */}
        <View style={[styles.typeToggle, { backgroundColor: colors.muted }]}>
          {(['lent', 'borrowed'] as LDType[]).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.typeBtn, ldType === t && { backgroundColor: t === 'lent' ? colors.lent : colors.borrowed }]}
              onPress={() => setLdType(t)}
            >
              <Ionicons
                name={t === 'lent' ? 'arrow-up' : 'arrow-down'}
                size={16}
                color={ldType === t ? '#fff' : colors.mutedForeground}
              />
              <Text style={[styles.typeText, { color: ldType === t ? '#fff' : colors.mutedForeground, fontFamily: ldType === t ? 'Inter_600SemiBold' : 'Inter_400Regular' }]}>
                {t === 'lent' ? 'I Lent' : 'I Borrowed'}
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

        {/* Fields */}
        <View style={styles.fields}>
          {[
            { icon: 'person-outline', placeholder: 'Person\'s name', value: person, onChange: setPerson, keyboard: 'default' as const },
            { icon: 'document-text-outline', placeholder: 'Note (optional)', value: note, onChange: setNote, keyboard: 'default' as const },
            { icon: 'calendar-outline', placeholder: 'Date (YYYY-MM-DD)', value: date, onChange: setDate, keyboard: 'numbers-and-punctuation' as const },
            { icon: 'time-outline', placeholder: 'Due date (optional, YYYY-MM-DD)', value: dueDate, onChange: setDueDate, keyboard: 'numbers-and-punctuation' as const },
          ].map(field => (
            <View key={field.placeholder} style={[styles.field, { backgroundColor: colors.card }]}>
              <View style={[styles.fieldIcon, { backgroundColor: colors.muted }]}>
                <Ionicons name={field.icon as keyof typeof Ionicons.glyphMap} size={20} color={colors.mutedForeground} />
              </View>
              <TextInput
                style={[styles.input, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
                value={field.value}
                onChangeText={field.onChange}
                placeholder={field.placeholder}
                placeholderTextColor={colors.mutedForeground}
                keyboardType={field.keyboard}
                autoCapitalize={field.icon === 'person-outline' ? 'words' : 'none'}
              />
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: typeColor }]}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={[styles.saveBtnText, { color: '#fff', fontFamily: 'Inter_600SemiBold' }]}>
            {isEdit ? 'Update Entry' : 'Add Entry'}
          </Text>
        </TouchableOpacity>

        {isEdit && (
          <TouchableOpacity style={[styles.deleteBtn, { borderColor: colors.destructive }]} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={18} color={colors.destructive} />
            <Text style={[styles.deleteBtnText, { color: colors.destructive, fontFamily: 'Inter_500Medium' }]}>Delete Entry</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 16 },
  typeToggle: { flexDirection: 'row', borderRadius: 12, padding: 4, gap: 4 },
  typeBtn: { flex: 1, flexDirection: 'row', paddingVertical: 10, borderRadius: 9, alignItems: 'center', justifyContent: 'center', gap: 6 },
  typeText: { fontSize: 15 },
  amountCard: { borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  symbolText: { fontSize: 32, marginRight: 4 },
  amountInput: { fontSize: 48, minWidth: 80, textAlign: 'center' },
  fields: { gap: 10 },
  field: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, gap: 12 },
  fieldIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  input: { flex: 1, fontSize: 15 },
  saveBtn: { height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  saveBtnText: { fontSize: 16 },
  deleteBtn: { height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8, borderWidth: 1.5 },
  deleteBtnText: { fontSize: 15 },
});
