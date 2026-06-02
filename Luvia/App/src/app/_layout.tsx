import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Poppins': require('../../assets/fonts/poppins-regular.ttf'),
    'MazzardH-Medium': require('../../assets/fonts/mazzard-h-medium.otf'),
    'PoppinsM': require('../../assets/fonts/poppins-medium.ttf'),
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

  return <Stack screenOptions={{ headerShown: false }} />;
}