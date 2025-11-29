import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AnimatedProductCard from "../components/AnimatedProductCard";
import { getProdutos } from "../services/firestore/FirestoreService";

// Mesmas categorias da Home
const categorias = [
  { id: "1", nome: "Acessórios", chave: "acessorios" },
  { id: "2", nome: "Cabos", chave: "cabos" },
  { id: "3", nome: "Caixas", chave: "caixas" },
  { id: "4", nome: "Fones", chave: "fones" },
  { id: "5", nome: "Diversos", chave: "diversos" },
];

export default function TodosProdutosScreen({ navigation }) {
  const [categoria, setCategoria] = useState(null);
  const [produtosFirestore, setProdutosFirestore] = useState([]);

  useEffect(() => {
    let unsubscribe;

    const fetchProdutos = async () => {
      try {
        const result = await getProdutos((produtosAtualizados) => {
          setProdutosFirestore(produtosAtualizados || []);
        });

        if (typeof result === "function") {
          unsubscribe = result;
        } else if (Array.isArray(result)) {
          setProdutosFirestore(result);
        }
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        setProdutosFirestore([]);
      }
    };

    fetchProdutos();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Filtragem
  const filtrados = useMemo(() => {
    if (!categoria) {
      return produtosFirestore;
    }

    return produtosFirestore.filter((item) => item.categoria === categoria);
  }, [categoria, produtosFirestore]);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Todos os Produtos</Text>

        <View style={{ width: 26 }} />
      </View>

      {/* CATEGORIAS */}
      <View style={styles.catContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categorias}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                setCategoria(categoria === item.chave ? null : item.chave)
              }
              style={[
                styles.catButton,
                categoria === item.chave && styles.catButtonActive,
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
            </TouchableOpacity>
          )}
        />
      </View>

      {/* TOTAL */}
      <Text style={styles.totalTxt}>
        {filtrados.length} produtos encontrados
      </Text>

      {/* GRID */}
      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item, index }) => (
          <View style={styles.gridItem}>
            <AnimatedProductCard item={item} index={index} />
          </View>
        )}
      />
    </View>
  );
}

/* ================= ESTILOS ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 40,
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

  /* ⭐ CATEGORIAS */
  catContainer: {
    paddingVertical: 12,
    paddingLeft: 10,
  },

  catButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "#eee",
    borderRadius: 20,
    marginRight: 8,
  },

  catButtonActive: {
    backgroundColor: "#ff4081",
  },

  catText: {
    color: "#555",
    fontWeight: "bold",
  },

  catTextActive: {
    color: "#fff",
  },

  /* ⭐ TOTAL DE PRODUTOS */
  totalTxt: {
    fontSize: 16,
    marginLeft: 12,
    marginBottom: 10,
    marginTop: 4,
    color: "#444",
  },

  /* ⭐ GRID */
  gridContent: {
    paddingHorizontal: 12,
    paddingBottom: 80,
    paddingTop: 10,
  },

  gridRow: {
    justifyContent: "space-between",
    marginBottom: 20, // 🔥 espaçamento entre linhas
  },

  gridItem: {
    flex: 1,
    marginBottom: 8,
  },
});
