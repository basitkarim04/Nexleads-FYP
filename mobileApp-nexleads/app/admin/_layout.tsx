import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { tokenStorage } from '../../src/utils/token';
import { Colors } from '../../src/theme/colors';

export default function AdminLayout() {
  const { token, user } = useSelector((s: RootState) => s.auth);

  useEffect(() => {
    async function guard() {
      const storedToken = await tokenStorage.getToken();
      if (!storedToken && !token) {
        router.replace('/auth/login');
        return;
      }
      if (user && user.type !== 'Admin') {
        router.replace('/(app)/dashboard');
      }
    }
    guard();
  }, [token, user]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bg },
      }}
    />
  );
}
