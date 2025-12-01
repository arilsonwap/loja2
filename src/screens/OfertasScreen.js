import React, { useMemo, useRef, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
  StatusBar,
  Platform,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useProdutosEmPromocao } from "../hooks/useProdutosEmPromocao";
import ProductCard from "../components/ProductCard";

export default function OfertasScreen() {
  const navigation = useNavigation();
  const { width: windowWidth } = useWindowDimensions();

  /* -------------------------------
     🔥 BUSCAR PRODUTOS DO FIREBASE
  --------------------------------*/
  const { ofertas, loading, error } = useProdutosEmPromocao();

  /* -------------------------------
     🔥 ESTADO DE ITENS VISÍVEIS
  --------------------------------*/
  const [visiveisOfertas, setVisiveisOfertas] = useState({});

  /* -------------------------------
     🔥 CONFIG DO FLATLIST PARA VISIBILIDADE
  --------------------------------*/
  const viewabilityConfig = useMemo(
    () => ({ itemVisiblePercentThreshold: 60 }),
    []
  );

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    const novoEstado = {};
    viewableItems.forEach((v) => (novoEstado[v.item.id] = true));
    setVisiveisOfertas(novoEstado);
  }).current;

  // GRID WIDTH PERFEITO
  const gridItemWidth = useMemo(() => {
    const sectionMargin = 20;
    const horizontalPadding = 16 * 2;
    const gap = 12;
    const columns = 2;

    const usableWidth = windowWidth - sectionMargin - horizontalPadding;

    return (usableWidth - gap) / columns;
  }, [windowWidth]);

  // BANNER
  const RenderBanner = () => (
    <View style={styles.bannerContainer}>
      <View style={styles.bannerContent}>
        <View>
          <Text style={styles.bannerLabel}>SUPER OFERTAS</Text>
          <Text style={styles.bannerTitle}>Até 50% OFF</Text>
          <Text style={styles.bannerSubtitle}>Em produtos selecionados</Text>
        </View>
        <MaterialCommunityIcons name="tag-heart" size={48} color="#FFF" />
      </View>

      <View
        style={[
          styles.circleDecoration,
          { right: -20, top: -20, width: 100, height: 100 },
        ]}
      />

      <View
        style={[
          styles.circleDecoration,
          { left: -30, bottom: -30, width: 80, height: 80 },
        ]}
      />
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          hitSlop={20}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </Pressable>

        <Text style={styles.headerTitle}>Ofertas da Semana</Text>

        <View style={{ width: 40 }} />
      </View>

      {/* CONTEÚDO */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Carregando ofertas...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF4757" />
          <Text style={styles.errorText}>Erro ao carregar ofertas</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <RenderBanner />

        {/* Título da Seção */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Destaques</Text>
          <Text style={styles.itemsCount}>
            {ofertas.length} {ofertas.length === 1 ? "item" : "itens"}
          </Text>
        </View>

        {/* 🔥 GRID OTIMIZADO */}
        <View style={styles.sectionBox}>
          <FlatList
            data={ofertas}
            numColumns={2}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            columnWrapperStyle={{ paddingHorizontal: 16, marginBottom: 14 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <View
                style={{
                  width: gridItemWidth,
                  marginRight: index % 2 === 0 ? 12 : 0,
                }}
              >
                <ProductCard
                  item={item}
                  isGrid
                  isVisible={!!visiveisOfertas[item.id]} // 🔥 AQUI
                />
              </View>
            )}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
          />
        </View>

        {/* SEM OFERTAS */}
        {ofertas.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="happy-outline" size={48} color="#CCC" />
            <Text style={styles.emptyStateText}>Nenhuma oferta no momento!</Text>
          </View>
        )}
      </ScrollView>
      )}
    </View>
  );
}

/* ------------------------------
   ESTILOS
-------------------------------*/
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    elevation: 2,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },

  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#FFF",
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: "#F5F5F5",
  },

  bannerContainer: {
    marginHorizontal: 12,
    marginTop: 16,
    marginBottom: 8,
    height: 140,
    backgroundColor: "#4F46E5",
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },

  bannerContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  bannerLabel: {
    color: "#FFD700",
    fontWeight: "800",
    fontSize: 12,
  },
  bannerTitle: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  bannerSubtitle: {
    color: "#EEE",
    marginTop: 4,
  },

  circleDecoration: {
    position: "absolute",
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },

  itemsCount: {
    fontSize: 14,
    color: "#888",
  },

  sectionBox: {
    backgroundColor: "#FFF",
    marginHorizontal: 10,
    paddingVertical: 14,
    borderRadius: 14,
  },

  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
  },

  emptyState: {
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    marginTop: 10,
    color: "#999",
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#4F46E5",
    fontWeight: "600",
  },

  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#FF4757",
    fontWeight: "600",
  },

  errorSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});
