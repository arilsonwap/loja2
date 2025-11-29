import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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

  const toggleCategoria = useCallback(
    (categoriaChave) => {
      setCategoria((atual) => (atual === categoriaChave ? null : categoriaChave));
    },
    []
  );

  const renderCategoria = useCallback(
    ({ item }) => (
      <TouchableOpacity
        onPress={() => toggleCategoria(item.chave)}
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
    ),
    [categoria, toggleCategoria]
  );

  const keyExtractor = useCallback(
    (item, index) => item.id?.toString() ?? `${item?.nome || "produto"}-${index}`,
    []
  );

  const renderProduto = useCallback(
    ({ item }) => (
      <View style={styles.gridItem}>
        <ProdutoItem item={item} />
      </View>
    ),
    []
  );

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
          renderItem={renderCategoria}
        />
      </View>

      {/* TOTAL */}
      <Text style={styles.totalTxt}>
        {filtrados.length} produtos encontrados
      </Text>

      {/* GRID */}
      <FlatList
        data={filtrados}
        keyExtractor={keyExtractor}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
        renderItem={renderProduto}
      />
    </View>
  );
}

const formatarPreco = (preco) => {
  const valor = parseFloat(preco || 0);
  const partes = valor.toFixed(2).split(".");
  const inteiro = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const decimal = partes[1];
  return `${inteiro},${decimal}`;
};

const calcularDesconto = (produto) => {
  if (!produto.emPromocao || !produto.precoOriginal || !produto.preco) {
    return null;
  }

  if (produto.precoOriginal <= produto.preco) {
    return null;
  }

  const desconto = 100 - (produto.preco * 100) / produto.precoOriginal;
  return Math.round(desconto);
};

const SeloDesconto = memo(({ percentual }) => (
  <View style={styles.seloDesconto}>
    <Text style={styles.seloDescontoTexto}>-{percentual}%</Text>
  </View>
));

const PrecoDisplay = memo(({ preco, precoOriginal, hasDesconto }) => (
  <View style={styles.precoBox}>
    {hasDesconto && (
      <Text style={styles.precoOriginal}>R$ {formatarPreco(precoOriginal)}</Text>
    )}
    <View style={styles.priceContainer}>
      <Text style={styles.currencySymbol}>R$</Text>
      <Text style={styles.cardPreco}>{formatarPreco(preco)}</Text>
    </View>
  </View>
));

const ProdutoItem = memo(({ item }) => {
  const [imageError, setImageError] = useState(false);

  const descontoPercentual = useMemo(() => calcularDesconto(item), [item]);
  const hasDesconto = descontoPercentual !== null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalhes do produto ${item?.nome || ""}`}
    >
      <View style={styles.imgBox}>
        <Image
          source={
            imageError
              ? require("../../assets/placeholder.png")
              : { uri: item?.imagem }
          }
          onError={() => setImageError(true)}
          resizeMode="contain"
          style={styles.cardImg}
          defaultSource={require("../../assets/placeholder.png")}
        />

        {hasDesconto && <SeloDesconto percentual={descontoPercentual} />}
      </View>

      <Text style={styles.cardNome} numberOfLines={2}>
        {item?.nome}
      </Text>

      <PrecoDisplay
        preco={item?.preco}
        precoOriginal={item?.precoOriginal}
        hasDesconto={hasDesconto}
      />
    </TouchableOpacity>
  );
});

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

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  imgBox: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    height: 140,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    overflow: "hidden",
  },

  cardImg: {
    width: "100%",
    height: "100%",
  },

  cardNome: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },

  precoBox: {
    flexDirection: "column",
  },

  priceContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },

  precoOriginal: {
    textDecorationLine: "line-through",
    color: "#888",
    fontSize: 12,
    marginBottom: 4,
  },

  currencySymbol: {
    color: "#ff4081",
    fontSize: 14,
    fontWeight: "700",
    marginRight: 4,
  },

  cardPreco: {
    color: "#ff4081",
    fontSize: 18,
    fontWeight: "800",
  },

  seloDesconto: {
    position: "absolute",
    right: 8,
    bottom: 8,
    backgroundColor: "#ff4757",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },

  seloDescontoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
});
