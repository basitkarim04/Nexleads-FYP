import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logoutThunk } from '../store/slices/authSlice';
import { router } from 'expo-router';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user, isLoading, error } = useSelector((s: RootState) => s.auth);

  const logout = async () => {
    await dispatch(logoutThunk());
    router.replace('/auth/login');
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.type === 'Admin';

  return {
    token,
    user,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    logout,
  };
}
