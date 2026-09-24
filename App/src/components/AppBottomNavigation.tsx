import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const BLUE = '#0A6DFF';
const MUTED = '#7B86A5';
const BRANCO = '#FFFFFF';
const GLASS_SURFACE = 'rgba(255, 255, 255, 0.52)';

const INICIO = require('../../assets/images/Luvia/home/inicio.png');
const DICIONARIO = require('../../assets/images/Luvia/home/dicionario.png');
const LUVAS = require('../../assets/images/Luvia/home/luvas.png');
const CONFIGURACOES = require('../../assets/images/Luvia/home/configuracoes.png');

export type BottomNavigationRoute = 'home' | 'dictionary' | 'translate' | 'gloves' | 'settings';

const NAVIGATION_HEIGHT = 60;
const CENTER_BUTTON_RISE = 10;
const CENTER_SLOT_WIDTH = 64;
const CENTER_CRADLE_SIZE = 54;
const NAV_ICON_SIZE = 22;
const LABEL_GAP = 4;
const NAV_ITEM_TOP_PADDING = 6;
const GRADIENT_TOP_SPACE = 40;
const CONTENT_GAP = 8;

function getBottomSpacing(bottomInset: number) {
  return Math.max(bottomInset, 8) + 8;
}

export function useBottomNavigationContentInset() {
  const insets = useSafeAreaInsets();

  // Reserve the entire overlay, including its fade, plus a clear gap for the last item.
  return NAVIGATION_HEIGHT + CENTER_BUTTON_RISE + getBottomSpacing(insets.bottom) + GRADIENT_TOP_SPACE + CONTENT_GAP;
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
      <LinearGradient
        pointerEvents="none"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        colors={[
          'rgba(219, 235, 255, 0)',
          'rgba(219, 235, 255, 0.18)',
          'rgba(224, 237, 255, 0.48)',
          'rgba(246, 250, 255, 0.86)',
        ]}
        locations={[0, 0.28, 0.65, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="box-none" style={styles.bar}>
        {/* Uma única sombra inferior evita separar visualmente as laterais. */}
        <View pointerEvents="none" style={styles.bottomShadowClip}>
          <View style={styles.bottomShadow} />
        </View>
        <View pointerEvents="none" style={styles.surface} />
        <View pointerEvents="box-none" style={styles.inner}>
          <View pointerEvents="box-none" style={styles.sideItems}>
            <NavItem source={INICIO} label="Início" active={activeRoute === 'home'} onPress={() => navigate('/home')} />
            <NavItem source={DICIONARIO} label="Dicionário" active={activeRoute === 'dictionary'} onPress={() => navigate('/dictionary')} />
          </View>
          <TranslateNavItem active={activeRoute === 'translate'} onPress={() => navigate('/translate')} />
          <View pointerEvents="box-none" style={styles.sideItems}>
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
      <Text numberOfLines={1} maxFontSizeMultiplier={1.2} adjustsFontSizeToFit minimumFontScale={0.8} style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function TranslateNavItem({ active, onPress }: { active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.translateItem} activeOpacity={0.8} onPress={onPress} accessibilityRole="tab" accessibilityLabel="Traduzir" accessibilityState={{ selected: active }}>
      <View pointerEvents="none" style={styles.cradle}>
        <View style={styles.translateButton}>
          <Feather name="mic" size={22} color={BRANCO} />
        </View>
      </View>
      <Text numberOfLines={1} maxFontSizeMultiplier={1.2} adjustsFontSizeToFit minimumFontScale={0.8} style={[styles.navLabel, active && styles.navLabelActive]}>Traduzir</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingTop: GRADIENT_TOP_SPACE,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
    zIndex: 20,
  },
  bar: {
    width: '80%',
    maxWidth: 480,
    height: NAVIGATION_HEIGHT + CENTER_BUTTON_RISE,
  },
  bottomShadowClip: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -14,
    height: 14,
    overflow: 'hidden',
  },
  bottomShadow: {
    position: 'absolute',
    left: 16,
    right: 16,
    // Keep the opaque caster fully outside the clip; only its shadow is visible.
    top: -24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E4EEFB',
    ...Platform.select({
      ios: {
        shadowColor: '#7F9AC0',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 1 },
    }),
  },
  surface: {
    position: 'absolute',
    top: CENTER_BUTTON_RISE,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 1)',
    // No elevation, shadow or children on the translucent surface (Android).
    backgroundColor: GLASS_SURFACE,
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
    // All labels share the same baseline as the central button's label.
    paddingTop: CENTER_CRADLE_SIZE - NAV_ICON_SIZE - LABEL_GAP - NAV_ITEM_TOP_PADDING,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: LABEL_GAP,
    minWidth: 0,
    minHeight: 48,
    paddingHorizontal: 1,
    paddingTop: NAV_ITEM_TOP_PADDING,
  },
  navIcon: {
    width: NAV_ICON_SIZE,
    height: NAV_ICON_SIZE,
    tintColor: MUTED,
  },
  navIconActive: {
    tintColor: BLUE,
  },
  navLabel: {
    fontSize: 9,
    lineHeight: 12,
    maxWidth: '100%',
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
    width: CENTER_CRADLE_SIZE,
    height: CENTER_CRADLE_SIZE,
    borderRadius: CENTER_CRADLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(223, 237, 255, 0.46)',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.78)',
  },
  translateButton: {
    width: 54,
    height: 54,
    borderRadius: 28,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BLUE,
  },
});
