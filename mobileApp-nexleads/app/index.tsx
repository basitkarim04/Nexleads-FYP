import { useEffect } from 'react';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../src/store';
import { restoreSessionThunk } from '../src/store/slices/authSlice';
import { tokenStorage } from '../src/utils/token';

export default function IndexScreen() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    async function checkSession() {
      const result = await dispatch(restoreSessionThunk());
      if (restoreSessionThunk.fulfilled.match(result) && result.payload) {
        const { user } = result.payload;
        if (user.type === 'Admin') {
          router.replace('/admin');
        } else {
          router.replace('/(app)/dashboard');
        }
      } else {
        router.replace('/auth/login');
      }
    }
    checkSession();
  }, [dispatch]);

  return null;
}
