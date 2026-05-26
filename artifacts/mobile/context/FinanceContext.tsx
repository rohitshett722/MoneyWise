import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { Transaction, Category, Budget, LenDenEntry } from '@/types';
import { generateId, getCurrentMonth } from '@/types';

const getKey = (userId: string, key: string) => `@mw_${userId}_${key}`;

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Dining', icon: 'restaurant', color: '#FF6B6B', type: 'expense', isDefault: true },
  { id: 'transport', name: 'Transport', icon: 'car', color: '#4ECDC4', type: 'expense', isDefault: true },
  { id: 'shopping', name: 'Shopping', icon: 'cart', color: '#45B7D1', type: 'expense', isDefault: true },
  { id: 'entertainment', name: 'Entertainment', icon: 'film', color: '#96CEB4', type: 'expense', isDefault: true },
  { id: 'health', name: 'Health', icon: 'heart', color: '#FF6B9D', type: 'expense', isDefault: true },
  { id: 'bills', name: 'Bills', icon: 'flash', color: '#FFD93D', type: 'expense', isDefault: true },
  { id: 'education', name: 'Education', icon: 'book', color: '#74B9FF', type: 'expense', isDefault: true },
  { id: 'salary', name: 'Salary', icon: 'briefcase', color: '#00C896', type: 'income', isDefault: true },
  { id: 'investment', name: 'Investment', icon: 'trending-up', color: '#A29BFE', type: 'income', isDefault: true },
  { id: 'freelance', name: 'Freelance', icon: 'laptop', color: '#FDCB6E', type: 'income', isDefault: true },
  { id: 'other', name: 'Other', icon: 'grid', color: '#8896A4', type: 'both', isDefault: true },
];

interface MonthlyStats {
  income: number;
  expense: number;
  net: number;
}

interface CategorySpending {
  category: Category;
  amount: number;
  percentage: number;
}

interface FinanceContextValue {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  lendenEntries: LenDenEntry[];
  isLoaded: boolean;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (cat: Omit<Category, 'id' | 'isDefault'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  setBudget: (categoryId: string, amount: number, month: string) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  addLenDen: (entry: Omit<LenDenEntry, 'id' | 'createdAt'>) => Promise<void>;
  updateLenDen: (id: string, updates: Partial<LenDenEntry>) => Promise<void>;
  deleteLenDen: (id: string) => Promise<void>;
  getMonthlyStats: (month: string) => MonthlyStats;
  getCategorySpending: (month: string) => CategorySpending[];
  getMonthlyTrend: () => { month: string; income: number; expense: number }[];
  getTotalBalance: () => number;
  getBudgetForCategory: (categoryId: string, month: string) => Budget | undefined;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children, userId }: { children: ReactNode; userId: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [lendenEntries, setLendenEntries] = useState<LenDenEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!userId) {
      setIsLoaded(false);
      setTransactions([]);
      setCategories(DEFAULT_CATEGORIES);
      setBudgets([]);
      setLendenEntries([]);
      return;
    }
    loadAll(userId);
  }, [userId]);

  async function loadAll(uid: string) {
    setIsLoaded(false);
    const [txJson, catJson, budJson, ldJson] = await Promise.all([
      AsyncStorage.getItem(getKey(uid, 'transactions')),
      AsyncStorage.getItem(getKey(uid, 'categories')),
      AsyncStorage.getItem(getKey(uid, 'budgets')),
      AsyncStorage.getItem(getKey(uid, 'lenden')),
    ]);
    if (!catJson) {
      await AsyncStorage.setItem(getKey(uid, 'categories'), JSON.stringify(DEFAULT_CATEGORIES));
    }
    setTransactions(txJson ? JSON.parse(txJson) : []);
    setCategories(catJson ? JSON.parse(catJson) : DEFAULT_CATEGORIES);
    setBudgets(budJson ? JSON.parse(budJson) : []);
    setLendenEntries(ldJson ? JSON.parse(ldJson) : []);
    setIsLoaded(true);
  }

  async function saveTransactions(updated: Transaction[]) {
    setTransactions(updated);
    await AsyncStorage.setItem(getKey(userId, 'transactions'), JSON.stringify(updated));
  }

  async function saveCategories(updated: Category[]) {
    setCategories(updated);
    await AsyncStorage.setItem(getKey(userId, 'categories'), JSON.stringify(updated));
  }

  async function saveBudgets(updated: Budget[]) {
    setBudgets(updated);
    await AsyncStorage.setItem(getKey(userId, 'budgets'), JSON.stringify(updated));
  }

  async function saveLenDen(updated: LenDenEntry[]) {
    setLendenEntries(updated);
    await AsyncStorage.setItem(getKey(userId, 'lenden'), JSON.stringify(updated));
  }

  async function addTransaction(tx: Omit<Transaction, 'id' | 'createdAt'>) {
    const newTx: Transaction = { ...tx, id: generateId(), createdAt: new Date().toISOString() };
    await saveTransactions([newTx, ...transactions]);
  }

  async function updateTransaction(id: string, updates: Partial<Transaction>) {
    await saveTransactions(transactions.map(t => t.id === id ? { ...t, ...updates } : t));
  }

  async function deleteTransaction(id: string) {
    await saveTransactions(transactions.filter(t => t.id !== id));
  }

  async function addCategory(cat: Omit<Category, 'id' | 'isDefault'>) {
    const newCat: Category = { ...cat, id: generateId(), isDefault: false };
    await saveCategories([...categories, newCat]);
  }

  async function deleteCategory(id: string) {
    await saveCategories(categories.filter(c => c.id !== id));
  }

  async function setBudget(categoryId: string, amount: number, month: string) {
    const existing = budgets.find(b => b.categoryId === categoryId && b.month === month);
    if (existing) {
      await saveBudgets(budgets.map(b => b.id === existing.id ? { ...b, amount } : b));
    } else {
      await saveBudgets([...budgets, { id: generateId(), categoryId, amount, month }]);
    }
  }

  async function deleteBudget(id: string) {
    await saveBudgets(budgets.filter(b => b.id !== id));
  }

  async function addLenDen(entry: Omit<LenDenEntry, 'id' | 'createdAt'>) {
    const newEntry: LenDenEntry = { ...entry, id: generateId(), createdAt: new Date().toISOString() };
    await saveLenDen([newEntry, ...lendenEntries]);
  }

  async function updateLenDen(id: string, updates: Partial<LenDenEntry>) {
    await saveLenDen(lendenEntries.map(e => e.id === id ? { ...e, ...updates } : e));
  }

  async function deleteLenDen(id: string) {
    await saveLenDen(lendenEntries.filter(e => e.id !== id));
  }

  function getMonthlyStats(month: string): MonthlyStats {
    const monthTxs = transactions.filter(t => t.date.startsWith(month));
    const income = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, net: income - expense };
  }

  function getCategorySpending(month: string): CategorySpending[] {
    const expenses = transactions.filter(t => t.date.startsWith(month) && t.type === 'expense');
    const totalExp = expenses.reduce((s, t) => s + t.amount, 0);
    const byCategory: Record<string, number> = {};
    expenses.forEach(t => {
      byCategory[t.categoryId] = (byCategory[t.categoryId] ?? 0) + t.amount;
    });
    return Object.entries(byCategory)
      .map(([catId, amount]) => ({
        category: categories.find(c => c.id === catId) ?? { id: catId, name: 'Other', icon: 'grid', color: '#8896A4', type: 'both' as const, isDefault: false },
        amount,
        percentage: totalExp > 0 ? (amount / totalExp) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  function getMonthlyTrend() {
    const months: { month: string; income: number; expense: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const stats = getMonthlyStats(month);
      months.push({ month, income: stats.income, expense: stats.expense });
    }
    return months;
  }

  function getTotalBalance(): number {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return totalIncome - totalExpense;
  }

  function getBudgetForCategory(categoryId: string, month: string): Budget | undefined {
    return budgets.find(b => b.categoryId === categoryId && b.month === month);
  }

  const value = useMemo(() => ({
    transactions, categories, budgets, lendenEntries, isLoaded,
    addTransaction, updateTransaction, deleteTransaction,
    addCategory, deleteCategory,
    setBudget, deleteBudget,
    addLenDen, updateLenDen, deleteLenDen,
    getMonthlyStats, getCategorySpending, getMonthlyTrend,
    getTotalBalance, getBudgetForCategory,
  }), [transactions, categories, budgets, lendenEntries, isLoaded]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
