import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AnimatedProductCard from "../components/AnimatedProductCard";
import ProductCard from "../components/ProductCard";

import { getProdutos } from "../services/firestore/FirestoreService";

const categorias = [
  { id: "1", nome: "Acessórios", chave: "acessorios" },
  { id: "2", nome: "Cabos", chave: "cabos" },
  { id: "3", nome: "Caixas", chave: "caixas" },
  { id: "4", nome: "Fones", chave: "fones" },
  { id: "5", nome: "Diversos", chave: "diversos" },
];

export default function TodosProdutosScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [categoria, setCategoria] = useState(null);
  const [produtosFirestore, setProdutosFirestore] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  /* --------------------------------------------------------
     🔥 NEW — Controle dos itens visíveis
  -------------------------------------------------------- */
  const [visiveis, setVisiveis] = useState({});

  const viewabilityConfig = useMemo(() => ({
    itemVisiblePercentThreshold: 60,
  }), []);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    const novo = {};
    viewableItems.forEach((v) => {
      novo[v.item.id] = true;
    });
    setVisiveis(novo);
  }).current;

  /* --------------------------------------------------------
     🔥 FIRESTORE - REALTIME
  -------------------------------------------------------- */
  useEffect(() => {
    let unsubscribe;
    let isMounted = true;

    const fetchProdutos = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getProdutos((produtosAtualizados) => {
          if (isMounted) {
            setProdutosFirestore(produtosAtualizados || []);
            setLoading(false);
          }
        });

        if (typeof result === "function") unsubscribe = result;

      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        if (isMounted) {
          setError("Erro ao carregar produtos. Tente novamente.");
          setProdutosFirestore([]);
          setLoading(false);
        }
      }
    };

    fetchProdutos();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setError(null);

    try {
      await getProdutos((produtosAtualizados) => {
        setProdutosFirestore(produtosAtualizados || []);
        setRefreshing(false);
      });
    } catch (error) {
      setError("Erro ao atualizar produtos.");
      setRefreshing(false);
    }
  };

  /* --------------------------------------------------------
     🔥 Filtragem otimizada (Map)
  -------------------------------------------------------- */
  const produtosPorCategoria = useMemo(() => {
    const mapa = new Map();
    produtosFirestore.forEach((produto) => {
      const cat = produto.categoria;
      if (!mapa.has(cat)) mapa.set(cat, []);
      mapa.get(cat).push(produto);
    });
    return mapa;
  }, [produtosFirestore]);

  const filtrados = useMemo(() => {
    if (!categoria) return produtosFirestore;
    return produtosPorCategoria.get(categoria) || [];
  }, [categoria, produtosFirestore, produtosPorCategoria]);

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons name="arrow-back" size={26} color="#333" />
        </Pressable>

        <Text style={styles.headerTitle}>Todos os Produtos</Text>

        <View style={{ width: 26 }} />
      </View>

      {/* CATEGORIAS */}
      <View style={styles.catContainer}>
        <FlatList
          horizontal
          data={categorias}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                setCategoria(categoria === item.chave ? null : item.chave)
              }
              style={({ pressed }) => [
                styles.catButton,
                categoria === item.chave && styles.catButtonActive,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text
                style={[
                  styles.catText,
                  categoria === item.chave && styles.catTextActive,
                ]}
              >
                {item.nome}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* TOTAL */}
      <Text style={styles.totalTxt}>{filtrados.length} produtos encontrados</Text>

      {/* LOADING */}
      {loading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#ff4081" />
          <Text style={styles.loadingText}>Carregando produtos...</Text>
        </View>
      )}

      {/* ERROR */}
      {error && !loading && (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#999" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* GRID */}
      {!loading && !error && (
        <FlatList
          data={filtrados}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={filtrados.length > 0 ? styles.gridRow : null}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#ff4081"]}
              tintColor="#ff4081"
            />
          }

          /* 🔥 DETECTAR VISIBILIDADE */
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}

          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="file-tray-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Nenhum produto encontrado 😕</Text>
              {categoria && (
                <Text style={styles.emptyHint}>Tente mudar a categoria.</Text>
              )}
            </View>
          }

          renderItem={({ item, index }) => (
            <View style={styles.gridItem}>
              {/* 🔥 AQUI: Envia isVisible */}
              <ProductCard
                item={item}
                isGrid
                isVisible={!!visiveis[item.id]}
              />
            </View>
          )}
        />
      )}
    </View>
  );
}

/* ================= ESTILOS ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    elevation: 4,
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },

  catContainer: { paddingVertical: 12, paddingLeft: 10 },

  catButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "#eee",
    borderRadius: 20,
    marginRight: 8,
  },

  catButtonActive: { backgroundColor: "#ff4081" },

  catText: {
    color: "#555",
    fontWeight: "bold",
  },

  catTextActive: { color: "#fff" },

  totalTxt: {
    fontSize: 16,
    marginLeft: 12,
    marginBottom: 10,
    marginTop: 4,
    color: "#444",
  },

  gridContent: {
    paddingHorizontal: 12,
    paddingBottom: 80,
    paddingTop: 10,
  },

  gridRow: {
    justifyContent: "space-between",
  },

  gridItem: {
    width: "48%",
    marginBottom: 20,
  },

  backButton: { padding: 4 },
  buttonPressed: { opacity: 0.6 },

  centerContainer: {
    flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40,
  },

  loadingText: { marginTop: 12, fontSize: 16, color: "#666" },

  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#999",
    paddingHorizontal: 20,
    textAlign: "center",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },

  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
  },

  emptyHint: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
  },
});
