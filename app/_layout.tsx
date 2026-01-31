import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { useDispatch } from 'react-redux';

import PrivacyOverlay from '@/components/PrivacyOverlay';
import { useColorScheme } from '@/hooks/use-color-scheme';
import StateProvider from '@/stateManagement/StateProvider';
import { bootstrapAuth } from '@/stateManagement/authSlice';

function InnerLayout() {
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  

  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="dashboard/index" options={{ headerShown: false }} />
          <Stack.Screen name="login/index" options={{ headerShown: false }} />
          <Stack.Screen name="register/index" options={{ headerShown: false }} />
          <Stack.Screen name="profile/index" options={{ headerShown: false }} />
          <Stack.Screen name="exam/mytest/index" options={{ headerShown: false }} />
          <Stack.Screen name="exam/newtest/index" options={{ headerShown: false }} />
          <Stack.Screen name="exam/instructions/index" options={{ headerShown: false }} />
          <Stack.Screen name="exam/details/[id]" options={{ headerShown: false }} />
        </Stack>
        <PrivacyOverlay />
      <Toast />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <StateProvider>
      <InnerLayout />
    </StateProvider>
  );
}
