import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { User } from '@/types';
import { generateId } from '@/types';

const USERS_KEY = '@mw_users';
const SESSION_KEY = '@mw_session';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, currency: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'currency'>>) => Promise<void>;
  hasExistingUsers: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  async function loadSession() {
    try {
      const sessionJson = await AsyncStorage.getItem(SESSION_KEY);
      if (sessionJson) {
        setUser(JSON.parse(sessionJson) as User);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  async function hasExistingUsers(): Promise<boolean> {
    const usersJson = await AsyncStorage.getItem(USERS_KEY);
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];
    return users.length > 0;
  }

  async function login(email: string, password: string) {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      const users: User[] = usersJson ? JSON.parse(usersJson) : [];
      const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!found) return { success: false, error: 'Invalid email or password' };
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(found));
      setUser(found);
      return { success: true };
    } catch {
      return { success: false, error: 'Something went wrong. Try again.' };
    }
  }

  async function register(name: string, email: string, password: string, currency: string) {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      const users: User[] = usersJson ? JSON.parse(usersJson) : [];
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: 'Email already registered' };
      }
      const newUser: User = {
        id: generateId(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        currency,
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
      setUser(newUser);
      return { success: true };
    } catch {
      return { success: false, error: 'Something went wrong. Try again.' };
    }
  }

  async function logout() {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
  }

  async function updateProfile(updates: Partial<Pick<User, 'name' | 'currency'>>) {
    if (!user) return;
    const updated = { ...user, ...updates };
    const usersJson = await AsyncStorage.getItem(USERS_KEY);
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = updated;
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    setUser(updated);
  }

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout, updateProfile, hasExistingUsers }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
