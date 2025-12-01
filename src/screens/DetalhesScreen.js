import React, { useState, useRef, useEffect, useMemo, useCallback, useReducer } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
  FlatList,
  Modal,
  Animated,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PinchGestureHandler, State } from "react-native-gesture-handler";

import AnimatedProductCard from "../components/AnimatedProductCard";

// ✅ SOLUÇÃO 4: PLACEHOLDER_IMAGE definido ANTES de ser usado
// Deve estar fora e antes do componente para ser acessível
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x330/f0f0f0/999999?text=Imagem+Indisponivel';

// ============================================
// REDUCER PARA GERENCIAR ESTADO DAS IMAGENS
// ============================================

const imageInitialState = {
  loading: {},      // { [url]: boolean }
  cacheStatus: {},  // { [url]: 'success' | 'error' }
  retries: {},      // { [url]: number }
  errors: [],       // Array de { url, error, timestamp }
};

function imageReducer(state, action) {
  switch (action.type) {
    case 'LOAD_START':
      return {
        ...state,
        loading: { ...state.loading, [action.payload.url]: true },
      };

    case 'LOAD_SUCCESS':
      return {
        ...state,
        loading: { ...state.loading, [action.payload.url]: false },
        cacheStatus: { ...state.cacheStatus, [action.payload.url]: 'success' },
      };

    case 'LOAD_ERROR': {
      const { url, errorInfo } = action.payload;
      return {
        ...state,
        loading: { ...state.loading, [url]: false },
        cacheStatus: { ...state.cacheStatus, [url]: 'error' },
        errors: [...state.errors, errorInfo],
      };
    }

    case 'RETRY': {
      const { url } = action.payload;
      const newState = { ...state };
      delete newState.cacheStatus[url];
      return {
        ...newState,
        loading: { ...state.loading, [url]: true },
        retries: { ...state.retries, [url]: (state.retries[url] || 0) + 1 },
      };
    }

    case 'RESET': {
      const initialLoading = {};
      action.payload.imageUrls.forEach(url => {
        initialLoading[url] = true;
      });
      return {
        ...imageInitialState,
        loading: initialLoading,
      };
    }

    default:
      return state;
  }
}

// ✅ SOLUÇÃO 1: Componente memoizado fora do componente principal
// ✅ Otimizado para receber apenas primitivos (isLoading, hasError) ao invés de objetos completos
const ImagemProduto = React.memo(({
  uri,
  style,
  onPress,
  isLoading,
  hasError,
  retryCount,
  onLoadStart,
  onLoad,
  onError,
  tentarNovamente
}) => {
  // ✅ Cache-buster: adicionar query param no retry para forçar novo download
  const cacheBustedUri = retryCount > 0 ? `${uri}?retry=${retryCount}` : uri;
  const imageSource = hasError ? PLACEHOLDER_IMAGE : cacheBustedUri;

  return (
    <TouchableOpacity onPress={onPress} style={styles.imagemContainer}>
      <Animated.Image
        source={{ uri: imageSource }}
        style={style}
        onLoadStart={() => onLoadStart(uri)}
        onLoad={() => onLoad(uri)}
        onError={(e) => onError(uri, e.nativeEvent.error)}
      />
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ff4081" />
          <Text style={styles.loadingText}>Carregando imagem...</Text>
        </View>
      )}

      {hasError && (
        <View style={styles.errorOverlay}>
          <Ionicons name="image-outline" size={50} color="#999" />
          <Text style={styles.errorText}>Imagem indisponível</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => tentarNovamente(uri)}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
});

export default function DetalhesScreen({ route, navigation }) {
  const { item } = route.params;
  const { width } = useWindowDimensions(); // ✅ Hook reativo para dimensões

  // ✅ Estado de carregamento do produto para transições suaves
  const [isProductLoading, setIsProductLoading] = useState(true);

  // ✅ Estabilizar array de imagens com useMemo e validação robusta
  const imagens = useMemo(() => {
    const lista = item.imagens && item.imagens.length > 0
      ? item.imagens
      : item.imagem
        ? [item.imagem]
        : [];

    // Filtrar valores undefined/null/vazios
    return lista.filter(img => img && typeof img === 'string' && img.trim().length > 0);
  }, [item.imagens, item.imagem]);

  // ✅ Normalizar preço para evitar erros com .toFixed()
  const preco = useMemo(() => {
    const valor = typeof item.preco === 'number' ? item.preco : parseFloat(item.preco) || 0;
    return valor.toFixed(2);
  }, [item.preco]);

  // ✅ Criar identificador único do produto (fallback se não tiver id)
  const produtoId = useMemo(() =>
    item.id || `${item.nome}-${item.preco}-${item.imagem}`,
    [item.id, item.nome, item.preco, item.imagem]
  );

  const [fotoIndex, setFotoIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [animarProxima, setAnimarProxima] = useState(false);

  // ✅ Estado e animação para pinch-to-zoom
  const pinchScale = useRef(new Animated.Value(1)).current;
  const baseScale = useRef(new Animated.Value(1)).current;
  const scale = useMemo(() => Animated.multiply(baseScale, pinchScale), [baseScale, pinchScale]);
  const lastScale = useRef(1);

  // ✅ REFATORAÇÃO: useReducer para consolidar estado das imagens
  const [imageState, dispatch] = useReducer(imageReducer, imageInitialState);
  
  // ✅ Usar ref para armazenar imagens e evitar dependência
  const imagensRef = useRef(imagens);
  const fotoIndexRef = useRef(fotoIndex);

  useEffect(() => {
    imagensRef.current = imagens;
  }, [imagens]);

  useEffect(() => {
    fotoIndexRef.current = fotoIndex;
  }, [fotoIndex]);

  const carrosselRef = useRef(null);
  const miniaturasRef = useRef(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // ✅ REFATORAÇÃO: Callbacks usando dispatch do reducer
  const tentarNovamente = useCallback((url) => {
    dispatch({ type: 'RETRY', payload: { url } });
  }, []); // ✅ dispatch é estável, sem dependências necessárias

  const handleImageLoad = useCallback((url) => {
    dispatch({ type: 'LOAD_SUCCESS', payload: { url } });
  }, []); // ✅ dispatch é estável, sem dependências necessárias

  const handleImageError = useCallback((url, erroBruto) => {
    const mensagem =
      typeof erroBruto === "string"
        ? erroBruto
        : erroBruto?.message || "Erro desconhecido";

    const timestamp = new Date().toISOString();
    const errorInfo = { url, erro: mensagem, timestamp };

    dispatch({ type: 'LOAD_ERROR', payload: { url, errorInfo } });

    if (__DEV__) {
      console.log('📊 ERRO DE IMAGEM:', errorInfo);
    }
  }, []); // ✅ dispatch é estável, sem dependências necessárias

  const handleImageLoadStart = useCallback((url) => {
    dispatch({ type: 'LOAD_START', payload: { url } });
  }, []); // ✅ dispatch é estável, sem dependências necessárias

  const resetZoom = useCallback(() => {
    lastScale.current = 1;
    baseScale.setValue(1);
    pinchScale.setValue(1);
  }, [baseScale, pinchScale]);

  const animarImagem = useCallback(() => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.85);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]); // ✅ Depende das refs de animação (estáveis)

  useEffect(() => {
    if (animarProxima) {
      animarImagem();
      setAnimarProxima(false);
    }
  }, [fotoIndex, animarProxima, animarImagem]);

  // ✅ Reseta zoom sempre que o modal for aberto
  useEffect(() => {
    if (zoomOpen) {
      resetZoom();
    }
  }, [zoomOpen, resetZoom]);

  // ✅ Detecta mudança de produto e inicia loading
  useEffect(() => {
    setIsProductLoading(true);
  }, [produtoId]);

  // ✅ REFATORAÇÃO: Reset usando dispatch do reducer
  // ✅ Reset completo ao mudar de produto (baseado no produtoId)
  useEffect(() => {
    // Reset de todos os estados
    setFotoIndex(0);
    setZoomOpen(false);
    setAnimarProxima(false);

    // Reset do estado das imagens via reducer
    dispatch({ type: 'RESET', payload: { imageUrls: imagens } });

    // Scroll carrossel para início
    if (carrosselRef.current) {
      carrosselRef.current.scrollToOffset({ offset: 0, animated: false });
    }

    // Finaliza loading após garantir que tudo foi resetado
    const timer = setTimeout(() => setIsProductLoading(false), 100);
    return () => clearTimeout(timer);
  }, [produtoId, imagens]); // ✅ Dependência no ID único do produto e imagens

  const trocarImagem = useCallback((idx) => {
    setAnimarProxima(true);
    setFotoIndex(idx);

    if (carrosselRef.current) {
      carrosselRef.current.scrollToOffset({
        offset: idx * width,
        animated: true,
      });
    }

    // ✅ OTIMIZAÇÃO: scrollToIndex ao invés de scrollTo para FlatList
    if (miniaturasRef.current) {
      miniaturasRef.current.scrollToIndex({
        index: idx,
        animated: true,
        viewPosition: 0.5, // Centraliza a miniatura
      });
    }
  }, [width]); // ✅ Incluir width nas dependências pois é usado no cálculo

  const abrirWhatsApp = useCallback(async () => {
    const numero = "5592999999999"; // TODO: Mover para .env ou config
    const msg = `Olá! Tenho interesse no produto "${item.nome}" (R$ ${preco}).`;
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "WhatsApp não encontrado",
          "Por favor, instale o WhatsApp para continuar."
        );
      }
    } catch (error) {
      Alert.alert(
        "Erro",
        "Não foi possível abrir o WhatsApp. Tente novamente."
      );
    }
  }, [item.nome, preco]); // ✅ Depende de item.nome e preco

  // Produtos similares - TODO: Integrar com Firebase/Firestore
  const similares = useMemo(() => {
    // Por enquanto retorna array vazio
    // Será implementado com getProdutosPorCategoria() do FirestoreService
    return [];
  }, [item.categoria, item.id]);

  // ✅ REFATORAÇÃO: Callbacks usando imageState
  const renderCarrosselItem = useCallback(({ item: img }) => {
    const isLoading = !!imageState.loading[img];
    const hasError = imageState.cacheStatus[img] === 'error';
    const retryCount = imageState.retries[img] || 0;

    return (
      <View style={{ width }}>
        <ImagemProduto
          uri={img}
          style={[
            styles.imgGrande,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
          onPress={() => setZoomOpen(true)}
          isLoading={isLoading}
          hasError={hasError}
          retryCount={retryCount}
          onLoadStart={handleImageLoadStart}
          onLoad={handleImageLoad}
          onError={handleImageError}
          tentarNovamente={tentarNovamente}
        />
      </View>
    );
  }, [width, fadeAnim, scaleAnim, imageState.loading, imageState.cacheStatus, imageState.retries, handleImageLoadStart, handleImageLoad, handleImageError, tentarNovamente]);

  const renderSimilarItem = useCallback(({ item }) => (
    <AnimatedProductCard
      item={item}
      isGrid={false}
      navigation={navigation}
    />
  ), [navigation]);

  // ✅ Renderização otimizada de miniaturas com FlatList
  const renderMiniatura = useCallback(({ item: img, index: idx }) => (
    <TouchableOpacity
      onPress={() => trocarImagem(idx)}
      style={[
        styles.thumbBox,
        fotoIndex === idx && styles.thumbActive,
      ]}
    >
      <Image source={{ uri: img }} style={styles.thumbImg} />
    </TouchableOpacity>
  ), [fotoIndex, trocarImagem]);

  const onCarrosselScroll = useCallback((e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    if (idx !== fotoIndexRef.current) {
      setFotoIndex(idx);
      // ✅ OTIMIZAÇÃO: scrollToIndex ao invés de scrollTo para FlatList
      if (miniaturasRef.current) {
        miniaturasRef.current.scrollToIndex({
          index: idx,
          animated: true,
          viewPosition: 0.5, // Centraliza a miniatura
        });
      }
    }
  }, [width]);

  // ✅ SOLUÇÃO 6: keyExtractor com identificador único ao invés de apenas índice
  const keyExtractor = useCallback((img, idx) => `${img || 'img'}-${idx}`, []); // ✅ Combina URL + índice com validação
  const similarKeyExtractor = useCallback((i) => i.id, []); // ✅ Memoizado para performance
  const thumbKeyExtractor = useCallback((img, idx) => `thumb-${img}-${idx}`, []); // ✅ Key para miniaturas

  // ✅ getItemLayout para otimizar scroll do carrossel
  const getItemLayout = useCallback((data, index) => ({
    length: width,
    offset: width * index,
    index,
  }), [width]);

  // ✅ getItemLayout para otimizar scroll das miniaturas
  const getThumbItemLayout = useCallback((data, index) => ({
    length: 70, // 60px width + 10px marginRight
    offset: 70 * index,
    index,
  }), []);

  // ✅ REFATORAÇÃO: Função usando imageState.errors
  const mostrarErros = useCallback(() => {
    if (imageState.errors.length === 0) return;

    const msg = imageState.errors
      .map((e, i) =>
        `${i + 1}. ${e.url.substring(0, 30)}...\n   ${e.erro}\n   ${new Date(e.timestamp).toLocaleTimeString()}`
      )
      .join("\n\n");

    Alert.alert("📊 Erros de Carregamento", `Total: ${imageState.errors.length}\n\n${msg}`);
  }, [imageState.errors]);

  // ✅ ListHeaderComponent como JSX direto (evita useCallback gigante)
  const headerComponent = (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Detalhes</Text>

        {__DEV__ && imageState.errors.length > 0 && (
          <TouchableOpacity
            onPress={mostrarErros}
            style={styles.analyticsBadge}
          >
            <Ionicons name="analytics" size={18} color="#fff" />
            <Text style={styles.analyticsBadgeText}>{imageState.errors.length}</Text>
          </TouchableOpacity>
        )}

        {!__DEV__ && <View style={{ width: 26 }} />}
      </View>

      <View>
        {imagens.length === 0 ? (
          <View style={[styles.imgGrande, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }]}>
            <Ionicons name="image-outline" size={80} color="#ccc" />
            <Text style={{ marginTop: 12, fontSize: 14, color: '#999' }}>Sem imagem disponível</Text>
          </View>
        ) : imagens.length === 1 ? (
          <ImagemProduto
            uri={imagens[0]}
            style={[
              styles.imgGrande,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
            onPress={() => setZoomOpen(true)}
            isLoading={!!imageState.loading[imagens[0]]}
            hasError={imageState.cacheStatus[imagens[0]] === 'error'}
            retryCount={imageState.retries[imagens[0]] || 0}
            onLoadStart={handleImageLoadStart}
            onLoad={handleImageLoad}
            onError={handleImageError}
            tentarNovamente={tentarNovamente}
          />
        ) : (
          <>
            <FlatList
              ref={carrosselRef}
              data={imagens}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={keyExtractor}
              getItemLayout={getItemLayout}
              snapToInterval={width}
              decelerationRate="fast"
              onMomentumScrollEnd={onCarrosselScroll}
              renderItem={renderCarrosselItem}
              removeClippedSubviews={true}
              initialNumToRender={1}
              maxToRenderPerBatch={1}
              windowSize={3}
            />

            <View style={styles.indicadorNumerico}>
              <Text style={styles.indicadorTexto}>
                {fotoIndex + 1}/{imagens.length}
              </Text>
            </View>

            <View style={styles.dotsBox}>
              {imagens.map((img, i) => (
                <View
                  key={`${img}-dot-${i}`}
                  style={[styles.dot, fotoIndex === i && styles.dotActive]}
                />
              ))}
            </View>

            {/* ✅ OTIMIZAÇÃO: FlatList ao invés de ScrollView + map */}
            <FlatList
              ref={miniaturasRef}
              data={imagens}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={thumbKeyExtractor}
              getItemLayout={getThumbItemLayout}
              renderItem={renderMiniatura}
              style={styles.miniaturasContainer}
              contentContainerStyle={styles.miniaturasContent}
              removeClippedSubviews={true}
              initialNumToRender={5}
              maxToRenderPerBatch={3}
              windowSize={5}
            />
          </>
        )}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.nome}>{item.nome}</Text>
        <Text style={styles.preco}>R$ {preco}</Text>
      </View>

      <View style={styles.descricaoBox}>
        <Text style={styles.descTitulo}>Descrição</Text>
        <Text style={styles.descTxt}>
          {item.descricao || "Produto de alta qualidade. Envio imediato! Qualquer dúvida é só chamar no WhatsApp."}
        </Text>
      </View>

      {similares.length > 0 && (
        <Text style={styles.similaresTitulo}>Produtos Similares</Text>
      )}
    </>
  );

  // ✅ Loading screen durante transição de produto
  if (isProductLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4081" />
        <Text style={styles.loadingProductText}>Carregando produto...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        ListHeaderComponent={headerComponent}
        data={similares}
        horizontal={false}
        showsVerticalScrollIndicator={false}
        keyExtractor={similarKeyExtractor}
        renderItem={renderSimilarItem}
        ListFooterComponent={<View style={{ height: 120 }} />}
        contentContainerStyle={similares.length === 0 ? { paddingBottom: 120 } : undefined}
      />

      <TouchableOpacity style={styles.btnWhats} onPress={abrirWhatsApp}>
        <Ionicons name="logo-whatsapp" size={28} color="#fff" />
        <Text style={styles.btnText}>Comprar pelo WhatsApp</Text>
      </TouchableOpacity>

      <Modal visible={zoomOpen} transparent animationType="fade">
        <View style={styles.zoomContainer}>
          <TouchableOpacity
            style={styles.closeZoom}
            onPress={() => setZoomOpen(false)}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>

          {imagens[fotoIndex] && (
            <PinchGestureHandler
              onGestureEvent={Animated.event(
                [{ nativeEvent: { scale: pinchScale } }],
                { useNativeDriver: true }
              )}
              onHandlerStateChange={(event) => {
                if (event.nativeEvent.oldState === State.ACTIVE) {
                  let newScale = lastScale.current * event.nativeEvent.scale;
                  newScale = Math.max(1, Math.min(newScale, 4));
                  lastScale.current = newScale;
                  baseScale.setValue(newScale);
                  pinchScale.setValue(1);
                }
              }}
            >
              <Animated.View style={{ transform: [{ scale }] }}>
                <Image
                  source={{ uri: imagens[fotoIndex] }}
                  style={styles.zoomImg}
                />
              </Animated.View>
            </PinchGestureHandler>
          )}

          <TouchableOpacity style={styles.resetZoom} onPress={resetZoom}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.resetZoomText}>Resetar zoom</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    padding: 16,
    paddingTop: 40,
    alignItems: "center",
    backgroundColor: "#fff",
    elevation: 4,
  },

  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },

  imgGrande: {
    width: "100%",
    height: 330,
    resizeMode: "contain",
  },

  indicadorNumerico: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  indicadorTexto: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  dotsBox: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: "#ccc",
  },

  dotActive: {
    backgroundColor: "#ff4081",
  },

  miniaturasContainer: {
    marginTop: 12,
  },

  miniaturasContent: {
    paddingHorizontal: 10,
  },

  thumbBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#ddd",
  },

  thumbActive: {
    borderColor: "#ff4081",
    borderWidth: 3,
  },

  thumbImg: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  infoBox: {
    backgroundColor: "#fff",
    padding: 14,
  },

  nome: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },

  preco: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#C62828",
  },

  descricaoBox: {
    backgroundColor: "#fff",
    padding: 14,
    marginTop: 10,
  },

  descTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },

  descTxt: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },

  similaresTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
    marginBottom: 10,
  },

  btnWhats: {
    position: "absolute",
    bottom: 15,
    left: 15,
    right: 15,
    backgroundColor: "#25D366",
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },

  btnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },

  zoomContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },

  zoomImg: {
    width: "100%",
    height: "80%",
    resizeMode: "contain",
  },

  closeZoom: {
    position: "absolute",
    top: 40,
    right: 20,
  },

  resetZoom: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  resetZoomText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
  },

  imagemContainer: {
    position: "relative",
  },

  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },

  errorOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(240,240,240,0.95)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },

  retryButton: {
    marginTop: 16,
    backgroundColor: "#ff4081",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  retryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },

  analyticsBadge: {
    backgroundColor: "#f44336",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  analyticsBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  loadingProductText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
});
