import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import {
  SplashScreen,
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

SplashScreen.preventAutoHideAsync();

const PUBLIC_ROUTES = [
  '/',
  '/onboarding',
  '/login',
  '/register',
  '/forgot-password',
  '/new-password',
  '/verify-email',
  '/verify-sms',
  '/404',
] as const;

const PRIVATE_ROUTES = [
  '/home',
  '/dictionary',
  '/search',
  '/add',
  '/signal',
  '/gloves',
  '/calibration',
  '/notification',
  '/settings',
  '/voice',
  '/profile',
] as const;

function getCurrentRoute(segments: string[]) {
  return segments.length === 0 ? '/' : `/${segments.join('/')}`;
}

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

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SessionNavigator fontsLoaded={loaded} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function SessionNavigator({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const currentRoute = getCurrentRoute(segments);
  const isPublicRoute = PUBLIC_ROUTES.includes(currentRoute as (typeof PUBLIC_ROUTES)[number]);
  const isPrivateRoute = PRIVATE_ROUTES.includes(currentRoute as (typeof PRIVATE_ROUTES)[number]);

  useEffect(() => {
    if (!fontsLoaded || loading) {
      return;
    }

    void SplashScreen.hideAsync();
  }, [fontsLoaded, loading]);

  useEffect(() => {
    if (!fontsLoaded || loading || !navigationState?.key) {
      return;
    }

    // A rota raiz mantém a splash visual e decide o destino após sua animação.
    if (currentRoute === '/') {
      return;
    }

    if (!user && isPrivateRoute) {
      router.replace('/login');
      return;
    }

    if (user && isPublicRoute) {
      router.replace('/home');
      return;
    }

    if (!isPublicRoute && !isPrivateRoute) {
      router.replace(user ? '/home' : '/login');
    }
  }, [
    currentRoute,
    fontsLoaded,
    isPrivateRoute,
    isPublicRoute,
    loading,
    navigationState?.key,
    router,
    user,
  ]);

  if (!fontsLoaded || loading) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
