import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Poppins': require('../../assets/fonts/poppins-regular.ttf'),
    'MazzardH-Medium': require('../../assets/fonts/mazzard-h-medium.otf'),
    'PoppinsM': require('../../assets/fonts/poppins-medium.ttf'),
    'Poppins SemiBold': require('../../assets/fonts/poppins-semibold.ttf'),
    'SF Medium': require('../../assets/fonts/sf-medium.otf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}