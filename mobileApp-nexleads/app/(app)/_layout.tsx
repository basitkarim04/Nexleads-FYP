import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { tokenStorage } from '../../src/utils/token';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';

function TabBarIcon({ name, color }: { name: string; color: string }) {
  return <Ionicons name={name as any} size={22} color={color} />;
}

export default function AppLayout() {
  const { token, user } = useSelector((s: RootState) => s.auth);
  const unreadCount = useSelector((s: RootState) => s.emails.unreadCount);

  useEffect(() => {
    async function guard() {
      const storedToken = await tokenStorage.getToken();
      if (!storedToken && !token) {
        router.replace('/auth/login');
      }
    }
    guard();
  }, [token]);

  if (user && user.type === 'Admin') {
    router.replace('/admin');
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.muted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarShowLabel: false,
      }}
    >
      {/* Each tab points at its DIRECTORY (a nested Stack via the section's
          _layout.tsx) — except dashboard/followups which have no sub-screens.
          The nested stacks give detail screens real back history so router.back()
          returns to the section index instead of the default (dashboard) tab. */}
      <Tabs.Screen
        name="dashboard/index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'grid' : 'grid-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leads"
        options={{
          title: 'Leads',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'people' : 'people-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="emails"
        options={{
          title: 'Emails',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'mail' : 'mail-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'folder' : 'folder-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="followups/index"
        options={{
          title: 'Follow-Ups',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'time' : 'time-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'settings' : 'settings-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.tabBar,
    borderTopWidth: 1,
    borderTopColor: Colors.tabBarBorder,
    height: 90,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabLabel: {
    ...Typography.label,
    fontSize: 10,
  },
});
