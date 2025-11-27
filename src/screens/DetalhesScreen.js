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
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { novidades } from "../data/novidades";
import { produtos } from "../data/produtos";
import AnimatedProductCard from "../components/AnimatedProductCard";

const { width } = Dimensions.get("window");

// ✅ SOLUÇÃO 4: PLACEHOLDER_IMAGE definido ANTES de ser usado
// Deve estar fora e antes do componente para ser acessível
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x330/f0f0f0/999999?text=Imagem+Indisponível';

// ✅ SOLUÇÃO 1: Componente memoizado fora do componente principal
// ✅ SOLUÇÃO 5 e 6: Implementadas dentro do componente principal
const ImagemProduto = React.memo(({ 
  uri, 
  style, 
  onPress, 
  imagensCarregando, 
  imagensCache, 
  onLoadStart,
  onLoad,
  onError,
  tentarNovamente 
}) => {
  const isLoading = imagensCarregando[uri];
  const hasError = imagensCache[uri] === false;
  const imageSource = hasError ? PLACEHOLDER_IMAGE : uri;

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

  // ✅ Estabilizar array de imagens com useMemo
  const imagens = useMemo(() => item.imagens || [item.imagem], [item.imagens, item.imagem]);

  const [fotoIndex, setFotoIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [animarProxima, setAnimarProxima] = useState(false);
  const [imagemErro, setImagemErro] = useState(false);
  const [imagensCarregando, setImagensCarregando] = useState({});
  const [imagensCache, setImagensCache] = useState({});
  const [errosCarregamento, setErrosCarregamento] = useState([]);
  
  // ✅ Usar ref para armazenar imagens e evitar dependência
  const imagensRef = useRef(imagens);
  
  useEffect(() => {
    imagensRef.current = imagens;
  }, [imagens]);
  
  const carrosselRef = useRef(null);
  const miniaturasRef = useRef(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // ✅ SOLUÇÃO 3: Callbacks memoizados para evitar recriação
  const registrarErro = useCallback((url, erro) => {
    const timestamp = new Date().toISOString();
    const novoErro = { url, erro, timestamp };
    
    setErrosCarregamento(prev => [...prev, novoErro]);
    
    console.log('📊 ERRO DE IMAGEM:', novoErro);
  }, []); // ✅ Sem dependências - usa apenas setState funcional

  const tentarNovamente = useCallback((url) => {
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

  const handleImageError = useCallback((url, erro) => {
    setImagensCarregando(prev => ({ ...prev, [url]: false }));
    setImagensCache(prev => ({ ...prev, [url]: false }));
    registrarErro(url, erro?.message || 'Erro desconhecido');
    setImagemErro(true);
  }, [registrarErro]); // ✅ Depende apenas de registrarErro (que é estável)

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
  // IMPORTANTE: Array vazio para executar apenas na montagem
  // O array 'imagens' muda referência a cada render causando loop infinito
  useEffect(() => {
    const loadingState = {};
    imagens.forEach(img => {
      loadingState[img] = true; // Sempre iniciar como loading
    });
    setImagensCarregando(loadingState);
  }, []); // ✅ Array vazio - executa apenas uma vez na montagem

  // ✅ SOLUÇÃO 5: Prevenir memory leak no Alert com verificação de montagem
  useEffect(() => {
    let isMounted = true;
    
    if (imagemErro && isMounted) {
      const imagemAtual = imagensRef.current[fotoIndex]; // ✅ Usar ref
      Alert.alert(
        "Erro ao carregar imagem",
        "Não foi possível carregar a imagem do produto.",
        [
          { 
            text: "Cancelar", 
            style: "cancel", 
            onPress: () => {
              if (isMounted) setImagemErro(false);
            }
          },
          { 
            text: "Tentar Novamente", 
            onPress: () => {
              if (isMounted) {
                setImagemErro(false);
                tentarNovamente(imagemAtual);
              }
            }
          }
        ]
      );
    }
    
    return () => {
      isMounted = false;
    };
  }, [imagemErro, fotoIndex, tentarNovamente]); // ✅ Sem imagens nas dependências

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
  }, []); // ✅ Sem dependências - usa refs que são estáveis

  const abrirWhatsApp = useCallback(async () => {
    const numero = "5592999999999";
    const msg = `Olá! Tenho interesse no produto: ${item.nome}`;
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
  }, [item.nome]); // ✅ Depende apenas de item.nome (estável)

  const similares = useMemo(() => {
    const produtosSimilares = produtos.filter(
      (p) => p.categoria === item.categoria && p.id !== item.id
    );
    const novidadesSimilares = novidades.filter(
      (n) => n.categoria === item.categoria && n.id !== item.id
    );
    return [...produtosSimilares, ...novidadesSimilares];
  }, [item.categoria, item.id]);

  // ✅ SOLUÇÃO 3: Callbacks memoizados para FlatList (evita re-renders)
  const renderCarrosselItem = useCallback(({ item: img }) => (
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
      imagensCarregando={imagensCarregando}
      imagensCache={imagensCache}
      onLoadStart={handleImageLoadStart}
      onLoad={handleImageLoad}
      onError={handleImageError}
      tentarNovamente={tentarNovamente}
    />
  ), [fadeAnim, scaleAnim, imagensCarregando, imagensCache, handleImageLoadStart, handleImageLoad, handleImageError, tentarNovamente]);

  const renderSimilarItem = useCallback(({ item }) => (
    <AnimatedProductCard
      item={item}
      isGrid={false}
      navigation={navigation}
    />
  ), [navigation]);

  const onCarrosselScroll = useCallback((e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    if (idx !== fotoIndex) {
      setFotoIndex(idx);
      if (miniaturasRef.current) {
        miniaturasRef.current.scrollTo({
          x: idx * 70 - width / 2 + 35,
          animated: true,
        });
      }
    }
  }, [fotoIndex]);

  // ✅ SOLUÇÃO 6: keyExtractor com identificador único ao invés de apenas índice
  const keyExtractor = useCallback((img, idx) => `${img}-${idx}`, []); // ✅ Combina URL + índice
  const similarKeyExtractor = useCallback((i) => i.id, []); // ✅ Memoizado para performance

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Detalhes</Text>
          
          {__DEV__ && errosCarregamento.length > 0 && (
            <TouchableOpacity 
              onPress={() => {
                Alert.alert(
                  '📊 Erros de Carregamento',
                  `Total: ${errosCarregamento.length}\n\n` +
                  errosCarregamento.map((e, i) => 
                    `${i + 1}. ${e.url.substring(0, 30)}...\n   ${e.erro}\n   ${new Date(e.timestamp).toLocaleTimeString()}`
                  ).join('\n\n')
                );
              }}
              style={styles.analyticsbadge}
            >
              <Ionicons name="analytics" size={18} color="#fff" />
              <Text style={styles.analyticsBadgeText}>{errosCarregamento.length}</Text>
            </TouchableOpacity>
          )}
          
          {!__DEV__ && <View style={{ width: 26 }} />}
        </View>

        <View>
          {imagens.length === 1 ? (
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
              imagensCarregando={imagensCarregando}
              imagensCache={imagensCache}
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
                onMomentumScrollEnd={onCarrosselScroll}
                renderItem={renderCarrosselItem}
              />

              <View style={styles.indicadorNumerico}>
                <Text style={styles.indicadorTexto}>
                  {fotoIndex + 1}/{imagens.length}
                </Text>
              </View>

              <View style={styles.dotsBox}>
                {imagens.map((_, i) => (
                  <View
                    key={i}
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
                    key={idx}
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
          <Text style={styles.preco}>R$ {item.preco.toFixed(2)}</Text>
        </View>

        <View style={styles.descricaoBox}>
          <Text style={styles.descTitulo}>Descrição</Text>
          <Text style={styles.descTxt}>
            Produto novo, de alta qualidade. Envio imediato! Qualquer dúvida é só chamar no WhatsApp.
          </Text>
        </View>

        {similares.length > 0 && (
          <View style={styles.similaresBox}>
            <Text style={styles.similaresTitulo}>Produtos Similares</Text>

            <FlatList
              data={similares}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={similarKeyExtractor}
              renderItem={renderSimilarItem}
            />
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

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

          <Image
            source={{ uri: imagens[fotoIndex] }}
            style={styles.zoomImg}
          />
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
    width: width,
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

  similaresBox: {
    marginTop: 18,
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
    gap: 8,
  },

  retryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },

  analyticsbadge: {
    backgroundColor: "#f44336",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  analyticsBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
});