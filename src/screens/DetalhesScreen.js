import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
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

import AnimatedProductCard from "../components/AnimatedProductCard";

// ✅ SOLUÇÃO 4: PLACEHOLDER_IMAGE definido ANTES de ser usado
// Deve estar fora e antes do componente para ser acessível
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x330/f0f0f0/999999?text=Imagem+Indisponivel';

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
  const [imagensCarregando, setImagensCarregando] = useState({});
  const [imagensCache, setImagensCache] = useState({});
  const [errosCarregamento, setErrosCarregamento] = useState([]);
  const [retries, setRetries] = useState({}); // { [url]: count }
  
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

  // ✅ SOLUÇÃO 3: Callbacks memoizados para evitar recriação
  const tentarNovamente = useCallback((url) => {
    setRetries(prev => ({
      ...prev,
      [url]: (prev[url] || 0) + 1,
    }));

    setImagensCarregando(prev => ({ ...prev, [url]: true }));
    setImagensCache(prev => {
      const novo = { ...prev };
      delete novo[url];
      return novo;
    });
  }, []); // ✅ Sem dependências - usa apenas setState funcional

  const handleImageLoad = useCallback((url) => {
    setImagensCarregando(prev => ({ ...prev, [url]: false }));
    setImagensCache(prev => ({ ...prev, [url]: true }));
  }, []); // ✅ Sem dependências - usa apenas setState funcional

  const handleImageError = useCallback((url, erroBruto) => {
    const mensagem =
      typeof erroBruto === "string"
        ? erroBruto
        : erroBruto?.message || "Erro desconhecido";

    const timestamp = new Date().toISOString();
    const novoErro = { url, erro: mensagem, timestamp };

    setImagensCarregando(prev => ({ ...prev, [url]: false }));
    setImagensCache(prev => ({ ...prev, [url]: false }));
    setErrosCarregamento(prev => [...prev, novoErro]);

    if (__DEV__) {
      console.log('📊 ERRO DE IMAGEM:', novoErro);
    }
  }, []); // ✅ Sem dependências - usa apenas setState funcional

  const handleImageLoadStart = useCallback((url) => {
    setImagensCarregando(prev => ({ ...prev, [url]: true }));
  }, []); // ✅ Sem dependências - usa apenas setState funcional

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

  // ✅ SOLUÇÃO 2: Dependências corretas no useEffect
  // ✅ Reset completo ao mudar de produto (baseado no produtoId)
  useEffect(() => {
    // Reset de todos os estados
    setFotoIndex(0);
    setErrosCarregamento([]);
    setZoomOpen(false);
    setAnimarProxima(false);
    setRetries({});

    // Inicializar loading state para as imagens atuais
    const loadingState = {};
    const currentImages = item.imagens || [item.imagem];
    currentImages.forEach(img => {
      loadingState[img] = true;
    });
    setImagensCarregando(loadingState);
    setImagensCache({});

    // Scroll carrossel para início
    if (carrosselRef.current) {
      carrosselRef.current.scrollToOffset({ offset: 0, animated: false });
    }
  }, [produtoId, item.imagens, item.imagem]); // ✅ Dependência no ID único do produto - reseta ao navegar para outro produto

  const trocarImagem = useCallback((idx) => {
    setAnimarProxima(true);
    setFotoIndex(idx);

    if (carrosselRef.current) {
      carrosselRef.current.scrollToOffset({
        offset: idx * width,
        animated: true,
      });
    }

    if (miniaturasRef.current) {
      miniaturasRef.current.scrollTo({
        x: idx * 70 - width / 2 + 35,
        animated: true,
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

  // ✅ SOLUÇÃO 3: Callbacks memoizados para FlatList (evita re-renders)
  const renderCarrosselItem = useCallback(({ item: img }) => {
    const isLoading = !!imagensCarregando[img];
    const hasError = imagensCache[img] === false;
    const retryCount = retries?.[img] || 0;

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
  }, [width, fadeAnim, scaleAnim, imagensCarregando, imagensCache, retries, handleImageLoadStart, handleImageLoad, handleImageError, tentarNovamente]);

  const renderSimilarItem = useCallback(({ item }) => (
    <AnimatedProductCard
      item={item}
      isGrid={false}
      navigation={navigation}
    />
  ), [navigation]);

  const onCarrosselScroll = useCallback((e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    if (idx !== fotoIndexRef.current) {
      setFotoIndex(idx);
      if (miniaturasRef.current) {
        miniaturasRef.current.scrollTo({
          x: idx * 70 - width / 2 + 35,
          animated: true,
        });
      }
    }
  }, [width]);

  // ✅ SOLUÇÃO 6: keyExtractor com identificador único ao invés de apenas índice
  const keyExtractor = useCallback((img, idx) => `${img || 'img'}-${idx}`, []); // ✅ Combina URL + índice com validação
  const similarKeyExtractor = useCallback((i) => i.id, []); // ✅ Memoizado para performance

  // ✅ getItemLayout para otimizar scroll do carrossel
  const getItemLayout = useCallback((data, index) => ({
    length: width,
    offset: width * index,
    index,
  }), [width]);

  // ✅ Função separada para mostrar erros de carregamento
  const mostrarErros = useCallback(() => {
    if (errosCarregamento.length === 0) return;

    const msg = errosCarregamento
      .map((e, i) =>
        `${i + 1}. ${e.url.substring(0, 30)}...\n   ${e.erro}\n   ${new Date(e.timestamp).toLocaleTimeString()}`
      )
      .join("\n\n");

    Alert.alert("📊 Erros de Carregamento", `Total: ${errosCarregamento.length}\n\n${msg}`);
  }, [errosCarregamento]);

  // ✅ ListHeaderComponent como JSX direto (evita useCallback gigante)
  const headerComponent = (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Detalhes</Text>

        {__DEV__ && errosCarregamento.length > 0 && (
          <TouchableOpacity
            onPress={mostrarErros}
            style={styles.analyticsBadge}
          >
            <Ionicons name="analytics" size={18} color="#fff" />
            <Text style={styles.analyticsBadgeText}>{errosCarregamento.length}</Text>
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
            isLoading={!!imagensCarregando[imagens[0]]}
            hasError={imagensCache[imagens[0]] === false}
            retryCount={retries?.[imagens[0]] || 0}
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

            <ScrollView
              ref={miniaturasRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.miniaturasContainer}
              contentContainerStyle={styles.miniaturasContent}
            >
              {imagens.map((img, idx) => (
                <TouchableOpacity
                  key={`${img}-thumb-${idx}`}
                  onPress={() => trocarImagem(idx)}
                  style={[
                    styles.thumbBox,
                    fotoIndex === idx && styles.thumbActive,
                  ]}
                >
                  <Image source={{ uri: img }} style={styles.thumbImg} />
                </TouchableOpacity>
              ))}
            </ScrollView>
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
          Produto novo, de alta qualidade. Envio imediato! Qualquer dúvida é só chamar no WhatsApp.
        </Text>
      </View>

      {similares.length > 0 && (
        <Text style={styles.similaresTitulo}>Produtos Similares</Text>
      )}
    </>
  );

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
            <Image
              source={{ uri: imagens[fotoIndex] }}
              style={styles.zoomImg}
            />
          )}
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
});
