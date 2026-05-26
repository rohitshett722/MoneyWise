import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export default function Index() {
  const { user, isLoading } = useAuth();
  const { colors } = useTheme();
  const [hasUsers, setHasUsers] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (user) return;
    AsyncStorage.getItem('@mw_users').then(json => {
      const users = json ? JSON.parse(json) : [];
      setHasUsers(users.length > 0);
    });
  }, [isLoading, user]);

  if (isLoading || (!user && hasUsers === null)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (user) return <Redirect href="/(tabs)" />;
  if (!hasUsers) return <Redirect href="/onboarding" />;
  return <Redirect href="/auth/login" />;
}
