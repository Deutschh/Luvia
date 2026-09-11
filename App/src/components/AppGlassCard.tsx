import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

type AppGlassCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
};

export function AppGlassCard({
  children,
  style,
  borderRadius = 34,
}: AppGlassCardProps) {
  return <View style={[styles.card, style, { borderRadius }]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Platform.OS === 'android' ? '#F5F7FA' : 'rgba(245, 247, 250, 0.78)',
    borderColor: Platform.OS === 'android' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#64748B',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 20,
        }
      : { elevation: 4 }),
  },
});
