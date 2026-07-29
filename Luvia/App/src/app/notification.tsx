import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Image,
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { GlassView, GlassContainer } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';

const BLUE = '#0A6DFF';
const TEXT = '#111827';
const MUTED = '#9CA3AF';
const BRANCO = '#FFFFFF';

const RED = '#FF0000';
const GREEN = '#019444';
const YELLOW = '#FFB700';

const NOTIFICACAO_VAZIA = require('../../assets/images/Luvia/home/inbox.png');
const BATERIAFRACA = require('../../assets/images/Luvia/home/bateria-fraca.png');
const DESCARREGADO = require('../../assets/images/Luvia/home/descarregado.png');
const CARREGADO = require('../../assets/images/Luvia/home/carregado.png');
const CALIBRACAO = require('../../assets/images/Luvia/home/calibracao.png');

const INITIAL_NOTIFICATIONS = [
  { 
    id: '1', 
    title: 'Calibração necessária', 
    subtitle: 'Precisão do aparelho abaixo de 50%.', 
    time: 'Agora', 
    color: RED, 
    icon: CALIBRACAO, 
  },
  { 
    id: '2', 
    title: 'Aparelho carregado', 
    subtitle: 'Par de luvas pronto para uso.', 
    time: '5min', 
    color: GREEN, 
    icon: CARREGADO, 
  },
  { 
    id: '3', 
    title: 'Aparelho descarregado', 
    subtitle: 'Par de luvas sem bateria.', 
    time: '19:14', 
    color: RED, 
    icon: DESCARREGADO,
  },
  { 
    id: '4', 
    title: 'Aparelho descarregado', 
    subtitle: 'Luva direita sem bateria.', 
    time: '19:14', 
    color: RED, 
    icon: DESCARREGADO,
  },
  { 
    id: '5', 
    title: 'Aparelho descarregado', 
    subtitle: 'Luva esquerda sem bateria.', 
    time: '19:10', 
    color: RED, 
    icon: DESCARREGADO, 
  },
  { 
    id: '6', 
    title: 'Bateria Fraca', 
    subtitle: 'Menos de 15% restantes na luva esquerda.', 
    time: '22/01/2026', 
    color: YELLOW, 
    icon: BATERIAFRACA, 
  },
];

function getGradientColors(colorHex: string) {
  let r, g, b;
  if (colorHex === RED) { r = 255; g = 0; b = 0; }
  else if (colorHex === GREEN) { r = 1; g = 148; b = 68; }
  else if (colorHex === YELLOW) { r = 255; g = 183; b = 0; }
  else { r = 10; g = 109; b = 255; } 

  return {
    base: `rgba(${r}, ${g}, ${b}, 0.35)`,
    grad: [
      'rgba(255, 255, 255, 0.75)', 
      `rgba(${r}, ${g}, ${b}, 0.95)`, 
      colorHex, 
      `rgba(${r}, ${g}, ${b}, 0.35)`
    ]
  };
}

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  function handleClearAll() {
    setNotifications([]);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButtonWrapper}
            activeOpacity={0.75}
            onPress={() => router.back()}
          >
            <GlassContainer style={StyleSheet.absoluteFill}>
              <GlassView style={styles.glassEffect} />
            </GlassContainer>
            <Feather name="chevron-left" size={28} color={BLUE} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Notificações</Text>
          
          {notifications.length > 0 ? (
            <TouchableOpacity 
              style={styles.clearButtonWrapper} 
              activeOpacity={0.7} 
              onPress={handleClearAll}
            >
              <Text style={styles.clearText}>Limpar</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>

        {notifications.length === 0 ? (
          <View style={styles.contentEmpty}>
            <View style={styles.imageWrapper}>
              <Image
                source={NOTIFICACAO_VAZIA}
                style={styles.illustration}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.description}>Nenhuma notificação encontrada.</Text>
          </View>
        ) : (
          <ScrollView
            style={{ overflow: 'visible' }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          >
            {notifications.map((item) => {
              const iconColors = getGradientColors(item.color);

              return (
                <TouchableOpacity key={item.id} style={styles.card} activeOpacity={0.8}>
                  
                  <GlassContainer style={styles.liquidContainerShapeCard}>
                    <GlassView style={styles.liquidBaseBlurWhite} />
                  </GlassContainer>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.05)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.liquidLightOverlayCard}
                  />
                  <View style={styles.liquidReflectionLipCard} />

                  <View style={styles.iconCircle}>
                    <GlassContainer style={styles.liquidContainerShapeShortcut}>
                      <GlassView style={[styles.liquidBaseBlur, { backgroundColor: iconColors.base }]} />
                    </GlassContainer>
                    <LinearGradient
                      colors={iconColors.grad}
                      locations={[0, 0.25, 0.65, 1]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.liquidLightOverlayShortcut}
                    />
                    <View style={styles.liquidReflectionLipShortcut} />
                    
                    <Image 
                      source={item.icon} 
                      style={[styles.cardIconImage, { tintColor: BRANCO }]} 
                      resizeMode="contain" 
                    />
                  </View>

                  {/* TEXTOS */}
                  <View style={styles.cardTextContainer}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                  </View>

                  <Text style={styles.timeText}>{item.time}</Text>

                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    marginTop: 20,
    paddingHorizontal: 34,
    zIndex: 20,
  },
  backButtonWrapper: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderRadius: 22,
  },
  glassEffect: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'PoppinsM',
    color: TEXT,
  },
  placeholder: {
    width: 44,
  },
  clearButtonWrapper: {
    width: 44,
    height: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  clearText: {
    color: BLUE,
    fontFamily: 'PoppinsM',
    fontSize: 14,
  },

  /* ESTADO VAZIO */
  contentEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
    paddingHorizontal: 34,
  },
  imageWrapper: {
    width: '100%',
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  description: {
    fontSize: 13,
    fontFamily: 'Poppins',
    color: MUTED,
    textAlign: 'center',
  },

  /* LISTA DE NOTIFICAÇÕES */
  listContainer: {
    paddingHorizontal: 24,
    paddingTop: 24, // Garante que a sombra do primeiro card não seja cortada
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 40,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 30,
    elevation: 4,
    minHeight: 80,
  },

  /* EFEITO LIQUID GLASS - CARD */
  liquidContainerShapeCard: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
    overflow: 'hidden',
  },
  liquidBaseBlurWhite: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)', 
  },
  liquidLightOverlayCard: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
  },
  liquidReflectionLipCard: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 0.5,
    borderRightWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.9)',
    borderLeftColor: 'rgba(255, 255, 255, 0.6)',
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },

  /* EFEITO LIQUID GLASS - ÍCONES */
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  liquidContainerShapeShortcut: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
    overflow: 'hidden',
  },
  liquidLightOverlayShortcut: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
  },
  liquidReflectionLipShortcut: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
  },
  liquidBaseBlur: {
    flex: 1,
  },
  cardIconImage: {
    width: '55%',
    height: '55%',
    position: 'absolute',
    zIndex: 12,
  },

  cardTextContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 10,
    zIndex: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Poppins SemiBold',
    color: TEXT,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: MUTED,
    lineHeight: 16,
  },
  timeText: {
    fontSize: 11,
    fontFamily: 'PoppinsM',
    color: MUTED,
    zIndex: 10,
    alignSelf: 'flex-start',
    marginTop: 4, 
  },
});