import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

const BLUE = '#0A6DFF';
const MUTED = '#9CA3AF';
const BRANCO = '#FFFFFF';

const INICIO = require('../../assets/images/Luvia/home/inicio.png');
const DICIONARIO = require('../../assets/images/Luvia/home/dicionario.png');
const LUVAS = require('../../assets/images/Luvia/home/luvas.png');
const CONFIGURACOES = require('../../assets/images/Luvia/home/configuracoes.png');

export type BottomNavigationRoute = 'home' | 'dictionary' | 'translate' | 'gloves' | 'settings';

const NAVIGATION_HEIGHT = 78;
const CENTER_BUTTON_RISE = 20;
const CENTER_SLOT_WIDTH = 76;
const CONTENT_GAP = 20;

function getBottomSpacing(bottomInset: number) {
  return Math.max(bottomInset, 8) + 8;
}

export function useBottomNavigationContentInset() {
  const insets = useSafeAreaInsets();

  return NAVIGATION_HEIGHT + getBottomSpacing(insets.bottom) + CENTER_BUTTON_RISE + CONTENT_GAP;
}

export function AppBottomNavigation({
  activeRoute,
  replaceNavigation = false,
}: {
  activeRoute: BottomNavigationRoute;
  replaceNavigation?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const navigate = (route: '/home' | '/dictionary' | '/translate' | '/gloves' | '/settings') => {
    if (replaceNavigation) {
      router.replace(route);
      return;
    }

    router.push(route);
  };

  return (
    <View pointerEvents="box-none" style={[styles.container, { paddingBottom: getBottomSpacing(insets.bottom) }]}>
      <View pointerEvents="box-none" style={styles.bar}>
        {/* O recorte limita a sombra comum à borda inferior, sem sombrear o notch. */}
        <View pointerEvents="none" style={styles.bottomShadowClip}>
          <View style={styles.bottomShadow} />
        </View>
        {/* O berço é decorativo; toda a área elevada do botão fica dentro da barra. */}
        <View pointerEvents="none" style={styles.background}>
          <View style={styles.centerBridge} />
          <View style={styles.surfaces}>
            <View style={styles.surface} />
            <View style={styles.centerSlot} />
            <View style={styles.surface} />
          </View>
        </View>
        <View pointerEvents="box-none" style={styles.inner}>
          <View style={styles.sideItems}>
            <NavItem source={INICIO} label="Início" active={activeRoute === 'home'} onPress={() => navigate('/home')} />
            <NavItem source={DICIONARIO} label="Dicionário" active={activeRoute === 'dictionary'} onPress={() => navigate('/dictionary')} />
          </View>
          <TranslateNavItem active={activeRoute === 'translate'} onPress={() => navigate('/translate')} />
          <View style={styles.sideItems}>
            <NavItem source={LUVAS} label="Luvas" active={activeRoute === 'gloves'} onPress={() => navigate('/gloves')} />
            <NavItem source={CONFIGURACOES} label="Configurações" active={activeRoute === 'settings'} onPress={() => navigate('/settings')} />
          </View>
        </View>
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
    <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected: active }}>
      <Image source={source} style={[styles.navIcon, active && styles.navIconActive]} resizeMode="contain" />
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function TranslateNavItem({ active, onPress }: { active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.translateItem} activeOpacity={0.8} onPress={onPress} accessibilityRole="tab" accessibilityLabel="Traduzir" accessibilityState={{ selected: active }}>
      <View pointerEvents="none" style={styles.cradle}>
        <View style={styles.translateButton}>
          <Feather name="mic" size={24} color={BRANCO} />
        </View>
      </View>
      <Text numberOfLines={1} style={[styles.navLabel, active && styles.navLabelActive]}>Traduzir</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
    zIndex: 20,
  },
  bar: {
    width: '100%',
    maxWidth: 480,
    height: NAVIGATION_HEIGHT + CENTER_BUTTON_RISE,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomShadowClip: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -12,
    height: 12,
    overflow: 'hidden',
  },
  bottomShadow: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: -23,
    height: 24,
    borderRadius: 12,
    backgroundColor: BRANCO,
    ...Platform.select({
      ios: {
        shadowColor: '#8E9CAE',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 5,
      },
      android: { elevation: 2 },
    }),
  },
  surfaces: {
    position: 'absolute',
    top: CENTER_BUTTON_RISE,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  surface: {
    flex: 1,
    backgroundColor: BRANCO,
    borderRadius: 28,
  },
  centerSlot: {
    width: CENTER_SLOT_WIDTH,
  },
  centerBridge: {
    position: 'absolute',
    top: CENTER_BUTTON_RISE + 38,
    bottom: 0,
    left: '50%',
    marginLeft: -(CENTER_SLOT_WIDTH + 48) / 2,
    width: CENTER_SLOT_WIDTH + 48,
    backgroundColor: BRANCO,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  inner: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sideItems: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    paddingTop: 44,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
    minHeight: 44,
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
    fontSize: 9,
    color: MUTED,
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  navLabelActive: {
    color: BLUE,
    fontWeight: '600',
  },
  translateItem: {
    width: CENTER_SLOT_WIDTH,
    alignItems: 'center',
    gap: 0,
  },
  cradle: {
    width: CENTER_SLOT_WIDTH,
    height: CENTER_SLOT_WIDTH,
    borderRadius: CENTER_SLOT_WIDTH / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7FA',
    borderWidth: 4,
    borderColor: BRANCO,
  },
  translateButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BLUE,
    ...Platform.select({
      ios: {
        shadowColor: BLUE,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.16,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
});
