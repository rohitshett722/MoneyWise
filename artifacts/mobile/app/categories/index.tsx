import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useFinance } from '@/context/FinanceContext';
import type { Category } from '@/types';

const ICON_OPTIONS = ['restaurant', 'car', 'cart', 'film', 'heart', 'flash', 'book', 'briefcase', 'trending-up', 'laptop', 'grid', 'home', 'airplane', 'fitness', 'gift', 'game-controller', 'musical-notes', 'cafe', 'wine', 'paw'];
const COLOR_OPTIONS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FF6B9D', '#FFD93D', '#74B9FF', '#00C896', '#A29BFE', '#FDCB6E', '#8896A4', '#FF9F43', '#6C5CE7', '#00CEC9', '#E17055', '#0984E3', '#55EFC4', '#FD79A8'];

export default function Categories() {
  const { colors } = useTheme();
  const { categories, addCategory, deleteCategory } = useFinance();
  const insets = useSafeAreaInsets();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<'expense' | 'income' | 'both'>('expense');
  const [catIcon, setCatIcon] = useState('grid');
  const [catColor, setCatColor] = useState('#8896A4');

  async function handleAdd() {
    if (!catName.trim()) { Alert.alert('Missing Name', 'Enter a category name.'); return; }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addCategory({ name: catName.trim(), type: catType, icon: catIcon, color: catColor });
    setAddModalVisible(false);
    setCatName('');
    setCatType('expense');
    setCatIcon('grid');
    setCatColor('#8896A4');
  }

  function handleDelete(cat: Category) {
    if (cat.isDefault) { Alert.alert('Cannot Delete', 'Default categories cannot be deleted.'); return; }
    Alert.alert('Delete Category', `Delete "${cat.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); deleteCategory(cat.id); } },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={categories}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 80 }}
        renderItem={({ item }) => (
          <View style={[styles.catRow, { backgroundColor: colors.card }]}>
            <View style={[styles.iconWrap, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={20} color={item.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.catName, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>{item.name}</Text>
              <Text style={[styles.catType, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)} {item.isDefault ? '· Default' : ''}
              </Text>
            </View>
            {!item.isDefault && (
              <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="trash-outline" size={18} color={colors.destructive} />
              </TouchableOpacity>
            )}
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + 24 }]}
        onPress={() => setAddModalVisible(true)}
      >
        <Ionicons name="add" size={28} color={colors.primaryForeground} />
      </TouchableOpacity>

      {/* Add Category Modal */}
      <Modal visible={addModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setAddModalVisible(false)}>
        <View style={[styles.modal, { backgroundColor: colors.background, paddingTop: insets.top + 16 }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setAddModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>New Category</Text>
            <TouchableOpacity onPress={handleAdd}>
              <Text style={[styles.saveText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>Add</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <TextInput
              style={[styles.nameInput, { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border }]}
              value={catName}
              onChangeText={setCatName}
              placeholder="Category name"
              placeholderTextColor={colors.mutedForeground}
            />

            {/* Type */}
            <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>TYPE</Text>
            <View style={styles.typeRow}>
              {(['expense', 'income', 'both'] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, { backgroundColor: catType === t ? colors.primary : colors.muted }]}
                  onPress={() => setCatType(t)}
                >
                  <Text style={[styles.typeChipText, { color: catType === t ? colors.primaryForeground : colors.foreground, fontFamily: catType === t ? 'Inter_600SemiBold' : 'Inter_400Regular' }]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Color */}
            <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>COLOR</Text>
            <View style={styles.colorGrid}>
              {COLOR_OPTIONS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorDot, { backgroundColor: c, borderWidth: catColor === c ? 3 : 0, borderColor: colors.foreground }]}
                  onPress={() => setCatColor(c)}
                />
              ))}
            </View>

            {/* Icon */}
            <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>ICON</Text>
            <View style={styles.iconGrid}>
              {ICON_OPTIONS.map(ic => (
                <TouchableOpacity
                  key={ic}
                  style={[styles.iconChip, { backgroundColor: catIcon === ic ? catColor + '30' : colors.muted, borderWidth: catIcon === ic ? 2 : 0, borderColor: catColor }]}
                  onPress={() => setCatIcon(ic)}
                >
                  <Ionicons name={ic as keyof typeof Ionicons.glyphMap} size={20} color={catIcon === ic ? catColor : colors.mutedForeground} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  catRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, gap: 12, marginBottom: 8 },
  iconWrap: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  catName: { fontSize: 15 },
  catType: { fontSize: 12, marginTop: 2 },
  fab: { position: 'absolute', right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8 },
  modal: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  modalTitle: { fontSize: 18 },
  saveText: { fontSize: 16 },
  modalContent: { padding: 20, gap: 12 },
  nameInput: { height: 52, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, fontSize: 15, fontFamily: 'Inter_400Regular' },
  label: { fontSize: 11, letterSpacing: 0.8, marginTop: 4 },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeChip: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  typeChipText: { fontSize: 14 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconChip: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
});
