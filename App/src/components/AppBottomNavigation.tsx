import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BLUE = '#0A6DFF';
const MUTED = '#9CA3AF';
const BRANCO = '#FFFFFF';

const INICIO = require('../../assets/images/Luvia/home/inicio.png');
const DICIONARIO = require('../../assets/images/Luvia/home/dicionario.png');
const LUVAS = require('../../assets/images/Luvia/home/luvas.png');
const CONFIGURACOES = require('../../assets/images/Luvia/home/configuracoes.png');

export type BottomNavigationRoute = 'home' | 'dictionary' | 'gloves' | 'settings';

const NAVIGATION_HEIGHT = 90;
const CONTENT_GAP = 20;

export function useBottomNavigationContentInset() {
  const insets = useSafeAreaInsets();

  return NAVIGATION_HEIGHT + insets.bottom + CONTENT_GAP;
}

export function AppBottomNavigation({
  activeRoute,
  replaceNavigation = false,
}: {
  activeRoute: BottomNavigationRoute;
  replaceNavigation?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const navigate = (route: '/home' | '/dictionary' | '/gloves' | '/settings') => {
    if (replaceNavigation) {
      router.replace(route);
      return;
    }

    router.push(route);
  };

  return (
    <View style={[styles.container, { height: NAVIGATION_HEIGHT + insets.bottom }]}>
      <View style={[styles.inner, { paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 8) }]}>
        <NavItem source={INICIO} label="Início" active={activeRoute === 'home'} onPress={() => navigate('/home')} />
        <NavItem source={DICIONARIO} label="Dicionário" active={activeRoute === 'dictionary'} onPress={() => navigate('/dictionary')} />
        <NavItem source={LUVAS} label="Luvas" active={activeRoute === 'gloves'} onPress={() => navigate('/gloves')} />
        <NavItem source={CONFIGURACOES} label="Configurações" active={activeRoute === 'settings'} onPress={() => navigate('/settings')} />
      </View>
    </View>
  );
}

function NavItem({
  source,
  label,
  active,
  onPress,
}: {
  source: number;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={onPress}>
      <Image source={source} style={[styles.navIcon, active && styles.navIconActive]} resizeMode="contain" />
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8E9CAE',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
    zIndex: 20,
    backgroundColor: BRANCO,
  },
  inner: {
    width: '100%',
    maxWidth: 340,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  navItem: {
    alignItems: 'center',
    gap: 6,
    minWidth: 70,
  },
  navIcon: {
    width: 24,
    height: 24,
    tintColor: MUTED,
  },
  navIconActive: {
    tintColor: BLUE,
  },
  navLabel: {
    fontSize: 10,
    color: MUTED,
    fontFamily: 'Poppins',
  },
  navLabelActive: {
    color: BLUE,
    fontWeight: '600',
  },
});
