import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppGlassCard } from './AppGlassCard';
import type { DictionaryCategory, DictionarySign } from '../services/dictionaryService';

const BLUE = '#0A6DFF';
const TEXT = '#152341';
const MUTED = '#64748B';

const ESSENCIAIS = require('../../assets/images/Luvia/home/essenciais.png');
const SOCIAIS = require('../../assets/images/Luvia/home/sociais.png');
const FAVORITOS = require('../../assets/images/Luvia/home/favorito.png');
const BEM_ESTAR = require('../../assets/images/Luvia/home/bem-estar.png');
const EMERGENCIA = require('../../assets/images/Luvia/dicionario/emergencia.png');
const CUSTOM = require('../../assets/images/Luvia/dicionario/editar.png');

export function getDictionaryCategoryIcon(
  category: Pick<DictionaryCategory, 'iconKey' | 'slug'>
) {
  const key = `${category.iconKey ?? ''} ${category.slug}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/-/g, '_')
    .toUpperCase();

  if (key.includes('FAVORITO')) return FAVORITOS;
  if (key.includes('BEM_ESTAR')) return BEM_ESTAR;
  if (key.includes('EMERGENCIA')) return EMERGENCIA;
  if (key.includes('SOCIAIS') || key.includes('SAUDACOES')) return SOCIAIS;
  if (key.includes('ESSENCIAIS')) return ESSENCIAIS;
  return CUSTOM;
}

export function DictionarySignCard({
  sign,
  onPress,
}: {
  sign: DictionarySign;
  onPress: () => void;
}) {
  const subtitle = sign.description?.trim() || sign.example?.trim() || sign.category.name;

  return (
    <AppGlassCard style={styles.card} borderRadius={30}>
      <TouchableOpacity
        style={styles.content}
        activeOpacity={0.78}
        accessibilityRole="button"
        accessibilityLabel={`Abrir detalhes do sinal ${sign.title}`}
        onPress={onPress}
      >
        <View style={styles.iconSurface}>
          <Image
            source={getDictionaryCategoryIcon(sign.category)}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title} numberOfLines={2}>{sign.title}</Text>
          <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>
          <Text style={styles.category} numberOfLines={1}>{sign.category.name}</Text>
        </View>
        <Feather name="chevron-right" size={21} color={BLUE} />
      </TouchableOpacity>
    </AppGlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  content: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  iconSurface: {
    width: 54,
    height: 54,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3EEFF',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  icon: {
    width: 29,
    height: 29,
    tintColor: BLUE,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  title: {
    color: TEXT,
    fontFamily: 'Poppins SemiBold',
    fontSize: 17,
    lineHeight: 23,
  },
  subtitle: {
    color: MUTED,
    fontFamily: 'Poppins',
    fontSize: 12,
    lineHeight: 18,
  },
  category: {
    color: BLUE,
    fontFamily: 'PoppinsM',
    fontSize: 10,
    lineHeight: 15,
  },
});
