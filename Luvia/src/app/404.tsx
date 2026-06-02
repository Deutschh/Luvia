import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';

const BLUE = '#0A6DFF';
const MUTED = '#979797';

const ERRO_404 = require('../../assets/images/Luvia/error/404.png');

export default function NotFoundScreen() {
  function handleRetry() {
    router.replace('/home');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.75}
            onPress={() => router.back()}
          >
            <Feather name="chevron-left" size={24} color={BLUE} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.imageWrapper}>
            <Image
              source={ERRO_404}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>
          
          <Text style={styles.description}>Não foi possível carregar a página.</Text>
          
          <TouchableOpacity activeOpacity={0.7} onPress={handleRetry}>
            <Text style={styles.retryLink}>Tente novamente</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 34,
  },
  header: {
    height: 60,
    justifyContent: 'center',
    marginTop: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  imageWrapper: {
    width: '100%',
    height: 320,
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
    marginBottom: 8,
  },
  retryLink: {
    fontSize: 13,
    fontFamily: 'Poppins',
    color: BLUE,
    fontWeight: '600',
  },
});