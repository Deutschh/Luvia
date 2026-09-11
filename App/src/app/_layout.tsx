import { useEffect, useRef } from 'react';
import { useFonts } from 'expo-font';
import {
  SplashScreen,
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from 'expo-router';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
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
  '/translate',
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
  const {
    user,
    loading,
    sessionUnavailable,
    loadUser,
  } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const hadAuthenticatedSession = useRef(false);
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
    if (user) {
      hadAuthenticatedSession.current = true;
    }
  }, [user]);

  useEffect(() => {
    if (
      !fontsLoaded ||
      loading ||
      sessionUnavailable ||
      !navigationState?.key
    ) {
      return;
    }

    const shouldResetAuthenticatedHistory =
      !user &&
      hadAuthenticatedSession.current &&
      isPrivateRoute;

    if (shouldResetAuthenticatedHistory) {
      hadAuthenticatedSession.current = false;
      router.dismissAll();
      router.replace('/login');
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
    sessionUnavailable,
    user,
  ]);

  if (!fontsLoaded) {
    return null;
  }

  if (sessionUnavailable) {
    return (
      <SessionUnavailableScreen
        retrying={loading}
        onRetry={() => void loadUser()}
      />
    );
  }

  if (loading) {
    return null;
  }

  const redirectPending =
    currentRoute !== '/' &&
    ((!user && isPrivateRoute) ||
      (Boolean(user) && isPublicRoute) ||
      (!isPublicRoute && !isPrivateRoute));

  if (redirectPending) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

function SessionUnavailableScreen({
  retrying,
  onRetry,
}: {
  retrying: boolean;
  onRetry: () => void;
}) {
  return (
    <SafeAreaView style={styles.unavailableSafeArea}>
      <View style={styles.unavailableContent}>
        <Text style={styles.unavailableTitle}>
          Não foi possível validar sua sessão
        </Text>
        <Text style={styles.unavailableMessage}>
          Verifique sua conexão com a internet e tente novamente.
        </Text>
        <TouchableOpacity
          style={[
            styles.retryButton,
            retrying && styles.retryButtonDisabled,
          ]}
          activeOpacity={0.85}
          disabled={retrying}
          onPress={onRetry}
        >
          {retrying ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  unavailableSafeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  unavailableContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  unavailableTitle: {
    color: '#111827',
    fontFamily: 'Poppins SemiBold',
    fontSize: 22,
    lineHeight: 30,
    textAlign: 'center',
  },
  unavailableMessage: {
    color: '#64748B',
    fontFamily: 'Poppins',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    minWidth: 190,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A6DFF',
    borderRadius: 26,
    marginTop: 28,
    paddingHorizontal: 28,
  },
  retryButtonDisabled: {
    opacity: 0.7,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontFamily: 'MazzardH-Medium',
    fontSize: 15,
  },
});
