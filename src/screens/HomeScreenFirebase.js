/**
 * HomeScreenFirebase - Home com integração Firebase + Otimizações
 * Agora com visibilidade dos cards (isVisible) para animações
 * do ProductCard rodarem SOMENTE quando o item estiver visível.
 */

import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Image,
  Linking,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// Componentes
import HeaderLoja from "../components/HeaderLoja";
import BannerCarousel from "../components/BannerCarousel";
import ProductCard from "../components/ProductCard";
import AnimatedProductCard from "../components/AnimatedProductCard";
import { ProductSkeletonCarousel, ProductSkeletonGrid } from "../components/ProductSkeleton";

// Hooks Firebase
import { useProdutos } from "../hooks/useProdutos";
import { useProdutosEmPromocao } from "../hooks/useProdutosEmPromocao";
import { useNovidades } from "../hooks/useNovidades";
import { useBanners } from "../hooks/useBanners";
import { useCategorias } from "../hooks/useCategorias";

// Ícones válidos
const ICONES_VALIDOS = [
  'flame','flash','rocket','star','heart','cart','gift','pricetag','megaphone',
  'trophy','ribbon','sparkles','thumbs-up','trending-up','notifications',
  'alarm','time','calendar','location','headset','volume-high','apps','grid',
  'list','home','storefront','bag','card','wallet','cash','hardware-chip'
];

const validarIcone = (iconName) => {
  if (!iconName) return "apps";
  const clean = iconName.replace(/^(ios-|md-|logo-)/i, "");
  return ICONES_VALIDOS.includes(clean) ? clean : "apps";
};

export default function HomeScreenFirebase() {
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();

  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // 🔥 NOVO: Controle dos itens visíveis
  const [visiveisOfertas, setVisiveisOfertas] = useState({});
  const [visiveisNovidades, setVisiveisNovidades] = useState({});

  // Firebase – Real-time
  const { produtos, loading: loadingProdutos } = useProdutos();
  const { ofertas, loading: loadingOfertas } = useProdutosEmPromocao();
  const { novidades, loading: loadingNovidades } = useNovidades();
  const { banners, loading: loadingBanners } = useBanners();
  const { categorias, loading: loadingCategorias } = useCategorias();

  /* ============================================================
     VIEWABILITY (detectar visibilidade dos cards)
  ============================================================ */

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 60,
    }),
    []
  );

  const onViewableOfertas = useRef(({ viewableItems }) => {
    const novo = {};
    viewableItems.forEach((v) => ( novo[v.item.id] = true ));
    setVisiveisOfertas(novo);
  }).current;

  const onViewableNovidades = useRef(({ viewableItems }) => {
    const novo = {};
    viewableItems.forEach((v) => ( novo[v.item.id] = true ));
    setVisiveisNovidades(novo);
  }).current;

  /* ============================================================
     Funções Gerais
  ============================================================ */

  const abrirWhatsApp = useCallback(async () => {
    const numero = "5592999999999";
    const msg = "Olá! Gostaria de saber mais sobre os produtos.";
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
    if (await Linking.canOpenURL(url)) Linking.openURL(url);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  }, []);

  const embaralhar = (lista) => [...lista].sort(() => Math.random() - 0.5);

  /* ============================================================
     FILTROS
  ============================================================ */

  const ofertasFiltradas = useMemo(() => {
    return !categoriaSelecionada
      ? ofertas
      : ofertas.filter((i) => i.categoria === categoriaSelecionada);
  }, [categoriaSelecionada, ofertas]);

  const novidadesFiltradas = useMemo(() => {
    return !categoriaSelecionada
      ? novidades
      : novidades.filter((i) => i.categoria === categoriaSelecionada);
  }, [categoriaSelecionada, novidades]);

  const produtosFiltrados = useMemo(() => {
    return !categoriaSelecionada
      ? produtos
      : produtos.filter((i) => i.categoria === categoriaSelecionada);
  }, [categoriaSelecionada, produtos]);

  const grid = useMemo(() => embaralhar(produtosFiltrados), [produtosFiltrados]);

  const itemWidth = (screenWidth - 48) / 2;

  /* ============================================================
     Renders de Itens
  ============================================================ */

  const renderCardOferta = useCallback(
    ({ item }) => (
      <ProductCard
        item={item}
        isVisible={!!visiveisOfertas[item.id]}
        navigation={navigation}
      />
    ),
    [visiveisOfertas]
  );

  const renderCardNovidade = useCallback(
    ({ item }) => (
      <ProductCard
        item={item}
        isVisible={!!visiveisNovidades[item.id]}
        navigation={navigation}
      />
    ),
    [visiveisNovidades]
  );

  const renderCategoria = ({ item: cat }) => {
    const ativa = categoriaSelecionada === cat.nome;
    const icon = validarIcone(cat.icone);

    return (
      <Pressable
        onPress={() => setCategoriaSelecionada(ativa ? null : cat.nome)}
        style={[styles.catButton, ativa && styles.catButtonActive]}
      >
        <Ionicons name={icon} size={18} color={ativa ? "#fff" : "#ff4081"} />
        <Text style={[styles.catText, ativa && { color: "#fff" }]}>
          {cat.nome}
        </Text>
      </Pressable>
    );
  };

  /* ============================================================
     RENDER PRINCIPAL
  ============================================================ */

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[
          "rgba(255,64,129,1)",
          "rgba(255,64,129,0.3)",
          "rgba(255,64,129,0)",
        ]}
        style={styles.gradientBg}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#ff4081"]}
          />
        }
      >
        <HeaderLoja />
        <BannerCarousel banners={banners} loading={loadingBanners} />

        {/* CATEGORIAS FIREBASE */}
        {loadingCategorias ? (
          <View style={styles.categoriasLoading}>
            <ActivityIndicator size="small" color="#ff4081" />
          </View>
        ) : (
          <FlatList
            data={categorias}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={renderCategoria}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.categoriasContent}
            style={styles.categoriasContainer}
          />
        )}

        {/* OFERTAS */}
        <View style={styles.ofertaHeader}>
          <View style={styles.rowTitle}>
            <Ionicons name="flame" size={24} color="#ff5722" />
            <Text style={styles.titulo}>Ofertas da semana</Text>
          </View>
          <Pressable onPress={() => navigation.navigate("OfertasScreen")}>
            <Text style={styles.verMaisText}>Ver mais</Text>
          </Pressable>
        </View>

        <View style={styles.sectionBox}>
          {loadingOfertas ? (
            <ProductSkeletonCarousel count={4} />
          ) : ofertasFiltradas.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="pricetag-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>Nenhuma oferta disponível</Text>
            </View>
          ) : (
            <FlatList
              data={ofertasFiltradas}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderCardOferta}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 10 }}
              style={{ height: 330 }}
              onViewableItemsChanged={onViewableOfertas}
              viewabilityConfig={viewabilityConfig}
            />
          )}
        </View>

        {/* NOVIDADES */}
        <View style={styles.rowTitle}>
          <Ionicons name="megaphone" size={24} color="#3f51b5" />
          <Text style={styles.titulo}>Novidades</Text>
        </View>

        <View style={styles.sectionBox}>
          {loadingNovidades ? (
            <ProductSkeletonCarousel count={4} />
          ) : novidadesFiltradas.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="rocket-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>Nenhuma novidade disponível</Text>
            </View>
          ) : (
            <FlatList
              data={novidadesFiltradas}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderCardNovidade}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 10 }}
              style={{ height: 330 }}
              onViewableItemsChanged={onViewableNovidades}
              viewabilityConfig={viewabilityConfig}
            />
          )}
        </View>

        {/* TODOS PRODUTOS */}
        <View style={styles.rowTitle}>
          <Ionicons name="grid" size={24} color="#444" />
          <Text style={styles.titulo}>Todos os produtos</Text>
        </View>

        <View style={styles.sectionBox}>
          {loadingProdutos ? (
            <ProductSkeletonGrid count={6} />
          ) : grid.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>Nenhum produto disponível</Text>
            </View>
          ) : (
            <>
              <View style={styles.gridContainer}>
                {grid.slice(0, 6).map((item, index) => (
                  <View
                    key={item.id}
                    style={[styles.gridItem, { width: itemWidth }]}
                  >
                    <AnimatedProductCard
                      item={item}
                      index={index}
                      navigation={navigation}
                    />
                  </View>
                ))}
              </View>

              <Pressable
                style={styles.verMaisBtn}
                onPress={() => navigation.navigate("TodosProdutos")}
              >
                <Text style={styles.verMaisTxt}>Ver mais</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Espaço final */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* WHATSAPP FLOATING BUTTON */}
      <Pressable style={styles.whatsButton} onPress={abrirWhatsApp}>
        <Image
          source={require("../../assets/whatsapp.png")}
          style={{ width: 40, height: 40 }}
        />
      </Pressable>
    </View>
  );
}

/* =================== ESTILOS =================== */

const styles = StyleSheet.create({
  root: { flex: 1 },

  gradientBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    zIndex: -1,
  },

  categoriasContainer: { marginTop: 5, marginBottom: 10 },
  categoriasLoading: { height: 40, justifyContent: "center" },
  categoriasContent: { paddingHorizontal: 10 },

  catButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#ffe4ef",
    borderRadius: 20,
    marginRight: 8,
  },
  catButtonActive: { backgroundColor: "#ff4081" },
  catText: { fontSize: 14, marginLeft: 6, color: "#ff4081", fontWeight: "bold" },

  rowTitle: { flexDirection: "row", alignItems: "center", marginLeft: 12 },
  titulo: { fontSize: 20, fontWeight: "bold", marginLeft: 6, color: "#333" },

  ofertaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 12,
    marginTop: 18,
    marginBottom: 8,
  },

  verMaisText: { fontSize: 14, fontWeight: "600", color: "#0984e3" },

  sectionBox: {
    backgroundColor: "#fff",
    marginHorizontal: 10,
    paddingVertical: 14,
    borderRadius: 14,
    elevation: 4,
    minHeight: 100,
  },

  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },

  gridItem: { marginBottom: 10 },

  separator: { alignItems: "center", marginVertical: 20 },
  separatorLine: {
    width: "70%",
    height: 2,
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
  },

  verMaisBtn: {
    marginTop: 12,
    alignSelf: "center",
    backgroundColor: "#ff4081",
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 24,
  },
  verMaisTxt: { color: "#fff", fontWeight: "bold", fontSize: 14 },

  whatsButton: {
    position: "absolute",
    bottom: 25,
    right: 20,
    backgroundColor: "#25D366",
    padding: 12,
    borderRadius: 50,
    elevation: 10,
  },

  emptyState: { paddingVertical: 40, alignItems: "center" },
  emptyText: { marginTop: 12, fontSize: 14, color: "#999" },
});
