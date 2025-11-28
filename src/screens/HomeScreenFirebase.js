/**
 * HomeScreenFirebase - Home com integração Firebase completa
 *
 * Esta versão substitui os dados mockados pelos dados do Firestore
 * com real-time updates, skeleton loading e todas as funcionalidades.
 *
 * Para usar: Renomeie este arquivo para HomeScreen.js (faça backup do original)
 */

import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
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

// Hooks do Firebase
import { useProdutos } from "../hooks/useProdutos";
import { useProdutosEmPromocao } from "../hooks/useProdutosEmPromocao";
import { useNovidades } from "../hooks/useNovidades";
import { useBanners } from "../hooks/useBanners";
import { useCategorias } from "../hooks/useCategorias";

// Ícones válidos do Ionicons
const ICONES_VALIDOS = [
  'flame', 'flash', 'rocket', 'star', 'heart', 'cart', 'gift', 'pricetag',
  'megaphone', 'trophy', 'ribbon', 'sparkles', 'thumbs-up', 'trending-up',
  'notifications', 'alarm', 'time', 'calendar', 'location', 'headset',
  'volume-high', 'apps', 'grid', 'list', 'home', 'storefront', 'bag',
  'card', 'wallet', 'cash', 'hardware-chip'
];

/**
 * Valida ícone, retorna padrão se inválido
 */
const validarIcone = (iconName) => {
  if (!iconName) return 'apps';
  const cleanName = iconName.replace(/^(ios-|md-|logo-)/i, '');
  if (ICONES_VALIDOS.includes(cleanName) || ICONES_VALIDOS.includes(iconName)) {
    return iconName;
  }
  return 'apps'; // Ícone padrão para categorias
};

export default function HomeScreenFirebase() {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();

  // Hooks do Firebase com real-time updates
  const { produtos, loading: loadingProdutos } = useProdutos();
  const { ofertas, loading: loadingOfertas } = useProdutosEmPromocao();
  const { novidades, loading: loadingNovidades } = useNovidades();
  const { banners, loading: loadingBanners } = useBanners();
  const { categorias, loading: loadingCategorias } = useCategorias();

  const abrirWhatsApp = useCallback(async () => {
    const numero = "5592999999999";
    const msg = "Olá! Gostaria de saber mais sobre os produtos.";
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
    if (await Linking.canOpenURL(url)) Linking.openURL(url);
  }, []);

  const embaralhar = (lista) => [...lista].sort(() => Math.random() - 0.5);

  // FILTRO DE OFERTAS
  const ofertasFiltradas = useMemo(() => {
    return !categoriaSelecionada
      ? ofertas
      : ofertas.filter((item) => item.categoria === categoriaSelecionada);
  }, [categoriaSelecionada, ofertas]);

  // FILTRO DE NOVIDADES
  const novidadesFiltradas = useMemo(() => {
    return !categoriaSelecionada
      ? novidades
      : novidades.filter((item) => item.categoria === categoriaSelecionada);
  }, [categoriaSelecionada, novidades]);

  // FILTRO DE PRODUTOS
  const produtosFiltrados = useMemo(() => {
    return !categoriaSelecionada
      ? produtos
      : produtos.filter((item) => item.categoria === categoriaSelecionada);
  }, [categoriaSelecionada, produtos]);

  // Grid embaralhado de produtos
  const grid = useMemo(() => embaralhar(produtosFiltrados), [produtosFiltrados]);

  const itemWidth = (screenWidth - 48) / 2;

  const renderCard = ({ item }) => (
    <ProductCard item={item} navigation={navigation} />
  );

  const renderCategoria = ({ item: cat }) => {
    const ativa = categoriaSelecionada === cat.nome;
    const iconeValido = validarIcone(cat.icone);

    return (
      <Pressable
        onPress={() => setCategoriaSelecionada(ativa ? null : cat.nome)}
        style={[
          styles.catButton,
          ativa && styles.catButtonActive,
        ]}
      >
        <Ionicons
          name={iconeValido}
          size={18}
          color={ativa ? "#fff" : "#ff4081"}
        />
        <Text style={[styles.catText, ativa && { color: "#fff" }]}>
          {cat.nome}
        </Text>
      </Pressable>
    );
  };

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

      <ScrollView showsVerticalScrollIndicator={false}>
        <HeaderLoja />

        {/* BANNERS COM REAL-TIME */}
        <BannerCarousel banners={banners} loading={loadingBanners} />

        {/* CATEGORIAS DO FIRESTORE */}
        {loadingCategorias ? (
          <View style={styles.categoriasLoading}>
            <ActivityIndicator size="small" color="#ff4081" />
          </View>
        ) : (
          <FlatList
            data={categorias}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriasContent}
            style={styles.categoriasContainer}
            renderItem={renderCategoria}
            keyExtractor={(item) => item.id}
          />
        )}

        {/* OFERTAS DA SEMANA */}
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
              <Text style={styles.emptyText}>
                Nenhuma oferta disponível no momento
              </Text>
            </View>
          ) : (
            <FlatList
              data={ofertasFiltradas}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderCard}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingHorizontal: 10 }}
              style={{ height: 330 }}
            />
          )}
        </View>

        {/* Separador */}
        <View style={styles.separator}>
          <View style={styles.separatorLine} />
        </View>

        {/* NOVIDADES (< 14 DIAS) */}
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
              <Text style={styles.emptyText}>
                Nenhuma novidade disponível
              </Text>
            </View>
          ) : (
            <FlatList
              data={novidadesFiltradas}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderCard}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 10 }}
              style={{ height: 330 }}
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
              <Text style={styles.emptyText}>
                Nenhum produto disponível
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.gridContainer}>
                {grid.slice(0, 6).map((item, index) => (
                  <View key={item.id} style={[styles.gridItem, { width: itemWidth }]}>
                    <AnimatedProductCard item={item} index={index} navigation={navigation} />
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

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* WHATSAPP FLUTUANTE */}
      <Pressable
        style={styles.whatsButton}
        onPress={abrirWhatsApp}
      >
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
  categoriasContent: { paddingHorizontal: 10 },
  categoriasLoading: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },

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
  catText: {
    fontSize: 14,
    marginLeft: 6,
    color: "#ff4081",
    fontWeight: "bold",
  },

  rowTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 6,
    color: "#333",
  },

  ofertaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});
