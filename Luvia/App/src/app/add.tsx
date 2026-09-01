import { useEffect, useState } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
  Image,
  TextInput,
  Modal,
  PanResponder,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { GlassView, GlassContainer } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
import {
  type DictionaryCategory,
  createDictionaryCategory,
  createDictionarySign,
  getDictionaryCategories,
} from '../services/dictionaryService';

const BLUE = '#0A6DFF';
const TEXT = '#111827';
const MUTED = '#9CA3AF';
const BORDER = '#888E9740';
const BRANCO = '#FFFFFF';
const ESSENCIAIS = require('../../assets/images/Luvia/home/essenciais.png');
const FAVORITOS = require('../../assets/images/Luvia/home/favorito.png');
const BEMESTAR = require('../../assets/images/Luvia/home/bem-estar.png');
const SOCIAIS = require('../../assets/images/Luvia/home/sociais.png');
const EDITAR = require('../../assets/images/Luvia/dicionario/editar.png');
const EMERGENCIA = require('../../assets/images/Luvia/dicionario/emergencia.png');
const SETA = require('../../assets/images/Luvia/dicionario/seta.png');

function mapCategoryIcon(iconKey?: string | null) {
  const normalizedKey = (iconKey || '').replace(/-/g, '_').toUpperCase();

  if (normalizedKey.includes('FAVORITO')) {
    return FAVORITOS;
  }

  if (normalizedKey.includes('BEM_ESTAR')) {
    return BEMESTAR;
  }

  if (normalizedKey.includes('SOCIAIS') || normalizedKey.includes('SAUDACOES')) {
    return SOCIAIS;
  }

  if (normalizedKey.includes('EMERGENCIA')) {
    return EMERGENCIA;
  }

  if (normalizedKey.includes('CUSTOM')) {
    return EDITAR;
  }

  if (normalizedKey.includes('ESSENCIAIS')) {
    return ESSENCIAIS;
  }

  return EDITAR;
}

function isFavoritesCategory(category: Pick<DictionaryCategory, 'slug' | 'iconKey'>) {
  return category.slug === 'favoritos' || category.iconKey === 'FAVORITOS';
}

export default function AddWordScreen() {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(EDITAR);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreateCategoryModalVisible, setIsCreateCategoryModalVisible] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [categories, setCategories] = useState<DictionaryCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const progressAnim = useState(new Animated.Value(0))[0];
  const selectedCategory = categories.find((item) => item.id === selectedCategoryId) ?? null;

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        const response = await getDictionaryCategories();

        if (!isMounted) {
          return;
        }

        setCategories(response.filter((category) => !isFavoritesCategory(category)));
      } catch (error) {
        if (isMounted) {
          Alert.alert(
            'Erro',
            error instanceof Error ? error.message : 'Não foi possível carregar as categorias.'
          );
        }
      } finally {
        if (isMounted) {
          setLoadingCategories(false);
        }
      }
    }

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleAddWord() {
    if (saving) {
      return;
    }

    if (!selectedCategoryId) {
      Alert.alert('Categoria', 'Selecione uma categoria.');
      return;
    }

    if (!nome.trim()) {
      Alert.alert('Nome', 'Informe o nome da palavra.');
      return;
    }

    try {
      setSaving(true);

      await createDictionarySign({
        title: nome.trim(),
        description: descricao.trim() || undefined,
        categoryId: selectedCategoryId,
      });
    } catch (error) {
      setSaving(false);
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Não foi possível adicionar a palavra.'
      );
      return;
    }

    setShowAlert(true);
    progressAnim.setValue(0);

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start(() => {
      setSaving(false);
      setShowAlert(false);
      router.back();
    });
  }

  async function handleCreateCategory() {
    if (creatingCategory) {
      return;
    }

    if (!newCategoryName.trim()) {
      Alert.alert('Categoria', 'Informe o nome da categoria.');
      return;
    }

    try {
      setCreatingCategory(true);

      const createdCategory = await createDictionaryCategory({
        name: newCategoryName.trim(),
      });

      if (!isFavoritesCategory(createdCategory)) {
        setCategories((currentCategories) => [...currentCategories, createdCategory]);
      }
      setSelectedCategoryId(createdCategory.id);
      setSelectedIcon(mapCategoryIcon(createdCategory.iconKey));
      setNewCategoryName('');
      setIsCreateCategoryModalVisible(false);
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Não foi possível criar a categoria.'
      );
    } finally {
      setCreatingCategory(false);
    }
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 50) {
        setIsModalVisible(false);
      }
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        
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
          <Text style={styles.headerTitle}>Nova Palavra</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={{ overflow: 'visible' }}
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          
          <TouchableOpacity 
            style={styles.categoryCard} 
            activeOpacity={0.8}
            onPress={() => setIsModalVisible(true)}
          >
            <GlassContainer style={styles.liquidContainerShapeCard50}>
              <GlassView style={styles.liquidBaseBlurWhite} />
            </GlassContainer>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.liquidLightOverlayCard50}
            />
            <View style={styles.liquidReflectionLipCard50} />

            <View style={styles.cardIconWrapper}>
              <GlassContainer style={styles.liquidContainerShapeShortcut}>
                <GlassView style={styles.liquidBaseBlur} />
              </GlassContainer>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.75)', 'rgba(0, 145, 255, 0.95)', '#0091FF', 'rgba(0, 145, 255, 0.35)']}
                locations={[0, 0.25, 0.65, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.liquidLightOverlayShortcut}
              />
              <View style={styles.liquidReflectionLipShortcut} />
              <Image source={selectedIcon} style={styles.cardIconImage} resizeMode="contain" />
            </View>

            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>
                {selectedCategory?.name || 'Escolha a categoria'}
              </Text>
              <Text style={styles.cardSubtitle}>
                {selectedCategory?.description || 'Selecione um ícone para o atalho.'}
              </Text>
            </View>
            <Image source={SETA} style={styles.arrowIcon} resizeMode="contain" />
          </TouchableOpacity>

          <View style={styles.form}>
            <Text style={styles.label}>Nome</Text>
            <View style={styles.inputWrapper}>
                <Image 
                  source={require('../../assets/images/Luvia/login/lapis.png')}
                  style={[styles.formPngIcon, { tintColor: MUTED }]} 
                  resizeMode="contain"
                />
                <TextInput
                  style={styles.input}
                  value={nome}
                  onChangeText={setNome}
                  placeholder="Insira seu nome"
                  placeholderTextColor={MUTED}
                />
              </View>

            <Text style={styles.label}>Descrição</Text>
            <View style={styles.inputWrapper}>
                <Image 
                  source={require('../../assets/images/Luvia/dicionario/desc.png')} 
                  style={[styles.formPngIcon, { tintColor: MUTED }]} 
                  resizeMode="contain"
                />
                <TextInput
                  style={styles.input}
                  value={descricao}
                  onChangeText={setDescricao}
                  placeholder="Ex: Sinal de despedida."
                  placeholderTextColor={MUTED}
                />
              </View>
          </View>

          <TouchableOpacity style={styles.recordButton} activeOpacity={0.8} onPress={() => router.push('/signal')}>
            <Text style={styles.recordButtonText}>Reproduzir sinal para gravação</Text>
          </TouchableOpacity>

        </ScrollView>

        <View style={styles.footer}>
          {showAlert ? (
            <View style={styles.alertCard}>
              <View style={styles.alertContentRow}>
                <View style={styles.checkIconContainer}>
                  <Image 
                    source={require('../../assets/images/Luvia/luvas/check.png')}
                    style={styles.checkIcon} 
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.alertTextContainer}>
                  <Text style={styles.alertTitle}>Sucesso!</Text>
                  <Text style={styles.alertSubtitle}>Palavra adicionada com sucesso.</Text>
                </View>
              </View>
              <View style={styles.alertBarBackground}>
                <Animated.View style={[styles.alertBarFill, { width: progressWidth }]} />
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.addButton} activeOpacity={0.85} onPress={handleAddWord}>
              <Text style={styles.addButtonText}>{saving ? 'Salvando...' : 'Adicionar'}</Text>
            </TouchableOpacity>
          )}
        </View>

        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent} {...panResponder.panHandlers}>
              <View style={styles.modalIndicator} />
              
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>

                {loadingCategories ? (
                  <View style={styles.categoryGroup}>
                    <Text style={styles.categoryGroupTitle}>Carregando...</Text>
                  </View>
                ) : categories.length === 0 ? (
                  <View style={styles.categoryGroup}>
                    <Text style={styles.categoryGroupTitle}>Nenhuma categoria disponível.</Text>
                  </View>
                ) : (
                  <View style={styles.categoryGroup}>
                    <View style={styles.iconGrid}>
                      <TouchableOpacity
                        style={styles.iconOptionItem}
                        activeOpacity={0.7}
                        onPress={() => {
                          setIsModalVisible(false);
                          setIsCreateCategoryModalVisible(true);
                        }}
                      >
                        <View style={styles.cardIconWrapper}>
                          <GlassContainer style={styles.liquidContainerShapeShortcut}>
                            <GlassView style={styles.liquidBaseBlur} />
                          </GlassContainer>
                          <LinearGradient
                            colors={['rgba(255, 255, 255, 0.75)', 'rgba(0, 145, 255, 0.95)', '#0091FF', 'rgba(0, 145, 255, 0.35)']}
                            locations={[0, 0.25, 0.65, 1]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.liquidLightOverlayShortcut}
                          />
                          <View style={styles.liquidReflectionLipShortcut} />
                          <Feather name="plus" size={24} color={BRANCO} />
                        </View>
                        <Text style={styles.iconOptionLabel}>Criar</Text>
                      </TouchableOpacity>

                      {categories.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.iconOptionItem}
                          activeOpacity={0.7}
                          onPress={() => {
                            setSelectedIcon(mapCategoryIcon(item.iconKey));
                            setSelectedCategoryId(item.id);
                            setIsModalVisible(false);
                          }}
                        >
                          <View style={styles.cardIconWrapper}>
                            <GlassContainer style={styles.liquidContainerShapeShortcut}>
                              <GlassView style={styles.liquidBaseBlur} />
                            </GlassContainer>
                            <LinearGradient
                              colors={['rgba(255, 255, 255, 0.75)', 'rgba(0, 145, 255, 0.95)', '#0091FF', 'rgba(0, 145, 255, 0.35)']}
                              locations={[0, 0.25, 0.65, 1]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={styles.liquidLightOverlayShortcut}
                            />
                            <View style={styles.liquidReflectionLipShortcut} />
                            <Image
                              source={mapCategoryIcon(item.iconKey)}
                              style={styles.cardIconImage}
                              resizeMode="contain"
                            />
                          </View>
                          <Text style={styles.iconOptionLabel}>{item.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal
          visible={isCreateCategoryModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setIsCreateCategoryModalVisible(false)}
        >
          <View style={styles.createCategoryModalOverlay}>
            <View style={styles.createCategoryModalCard}>
              <Text style={styles.createCategoryModalTitle}>Nova categoria</Text>

              <View style={styles.inputWrapper}>
                <Feather name="plus" size={18} color={MUTED} />
                <TextInput
                  style={styles.input}
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  placeholder="Nome da categoria"
                  placeholderTextColor={MUTED}
                  autoFocus={true}
                  autoCorrect={false}
                />
              </View>

              <View style={styles.createCategoryActions}>
                <TouchableOpacity
                  style={styles.createCategorySecondaryButton}
                  activeOpacity={0.8}
                  onPress={() => {
                    setNewCategoryName('');
                    setIsCreateCategoryModalVisible(false);
                  }}
                >
                  <Text style={styles.createCategorySecondaryText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.createCategoryPrimaryButton}
                  activeOpacity={0.8}
                  onPress={handleCreateCategory}
                >
                  <Text style={styles.createCategoryPrimaryText}>
                    {creatingCategory ? 'Criando...' : 'Criar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRANCO,
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
    marginBottom: -20,
    zIndex: 10,
  },
  backButtonWrapper: {
    left: 0,
    top: 0,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
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
  scrollContent: {
    paddingHorizontal: 34,
    paddingTop: 40,
    paddingBottom: 40,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 50,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 40,
    elevation: 4,
    marginBottom: 24,
  },
  liquidContainerShapeCard50: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 50,
    overflow: 'hidden',
  },
  liquidLightOverlayCard50: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 50,
  },
  liquidReflectionLipCard50: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 50,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 0.5,
    borderRightWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.8)',
    borderLeftColor: 'rgba(255, 255, 255, 0.5)',
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },
  liquidBaseBlurWhite: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    overflow: 'hidden',
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
    backgroundColor: 'rgba(0, 145, 255, 0.35)',
  },
  cardIconImage: {
    width: 32,
    height: 32,
    position: 'absolute',
    zIndex: 12,
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
    zIndex: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Poppins SemiBold',
    color: TEXT,
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    fontSize: 12,
    fontFamily: 'Mazzard',
    color: MUTED,
  },
  arrowIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    zIndex: 10,
  },
  form: {
    width: '100%',
  },
  formPngIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  label: {
    color: MUTED,
    fontSize: 14,
    marginLeft: 12,
    marginBottom: 8,
    fontFamily: 'PoppinsM',
  },
  inputWrapper: {
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    height: '100%',
    color: TEXT,
    fontSize: 14,
    fontFamily: 'Poppins',
  },
  recordButton: {
    backgroundColor: BLUE,
    alignSelf: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 28,
    marginTop: 8,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  recordButtonText: {
    color: BRANCO,
    fontSize: 14,
    fontFamily: 'MazzardH-Medium',
  },
  footer: {
    paddingHorizontal: 34,
    paddingBottom: Platform.OS === 'ios' ? 20 : 24,
    paddingTop: 16,
    backgroundColor: BRANCO,
  },
  addButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: BRANCO,
    fontSize: 16,
    fontFamily: 'Mazzard',
  },
  alertCard: {
    width: '100%',
    backgroundColor: BLUE,
    borderRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  alertContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkIconContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkIcon: {
    width: 32,
    height: 32,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontFamily: 'Poppins SemiBold',
    color: BRANCO,
    marginBottom: 2,
  },
  alertSubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins',
    color: BRANCO,
    opacity: 0.9,
  },
  alertBarBackground: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'center',
    marginBottom: 0,
  },
  alertBarFill: {
    height: '100%',
    backgroundColor: '#00E676',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: BRANCO,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 34,
    paddingTop: 16,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalIndicator: {
    width: 80,
    height: 4.5,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalScroll: {
    paddingBottom: 20,
  },
  categoryGroup: {
    marginBottom: 26,
  },
  categoryGroupTitle: {
    fontSize: 18,
    fontFamily: 'Poppins SemiBold',
    letterSpacing: -0.5,
    color: TEXT,
    marginBottom: 16,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  iconOptionItem: {
    alignItems: 'center',
    width: '20%',
    gap: 10,
  },
  iconOptionLabel: {
    fontSize: 12,
    fontFamily: 'Mazzard',
    color: MUTED,
    textAlign: 'center',
  },
  createCategoryModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 34,
  },
  createCategoryModalCard: {
    width: '100%',
    backgroundColor: BRANCO,
    borderRadius: 28,
    padding: 24,
  },
  createCategoryModalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins SemiBold',
    color: TEXT,
    marginBottom: 16,
  },
  createCategoryActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  createCategorySecondaryButton: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E7EB',
  },
  createCategorySecondaryText: {
    color: TEXT,
    fontSize: 14,
    fontFamily: 'Mazzard',
  },
  createCategoryPrimaryButton: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BLUE,
  },
  createCategoryPrimaryText: {
    color: BRANCO,
    fontSize: 14,
    fontFamily: 'Mazzard',
  },
});
