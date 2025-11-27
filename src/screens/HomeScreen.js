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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import HeaderLoja from "../components/HeaderLoja";
import ShopeeBanner from "../components/ShopeeBanner";

import { ofertas } from "../data/ofertas";      // << OFERTAS AGORA OK
import { novidades } from "../data/novidades";

import ProductCard from "../components/ProductCard";
import AnimatedProductCard from "../components/AnimatedProductCard";

// Categorias fixas
const CATEGORIAS = [
  { id: "1", nome: "Acessórios", icon: "hardware-chip", chave: "acessorios" },
  { id: "2", nome: "Cabos", icon: "flash", chave: "cabos" },
  { id: "3", nome: "Caixas", icon: "volume-high", chave: "caixas" },
  { id: "4", nome: "Fones", icon: "headset", chave: "fones" },
  { id: "5", nome: "Diversos", icon: "apps", chave: "diversos" },
];

export default function HomeScreen() {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();

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
  }, [categoriaSelecionada]);

  // FILTRO DE NOVIDADES
  const novidadesFiltradas = useMemo(() => {
    return !categoriaSelecionada
      ? novidades
      : novidades.filter((item) => item.categoria === categoriaSelecionada);
  }, [categoriaSelecionada]);

  // Grid embaralhado (novidades)
  const grid = useMemo(() => embaralhar(novidadesFiltradas), [novidadesFiltradas]);

  const itemWidth = (screenWidth - 48) / 2;

  const renderCard = ({ item }) => (
    <ProductCard item={item} navigation={navigation} />
  );

  const renderCategoria = ({ item: cat }) => {
    const ativa = categoriaSelecionada === cat.chave;
    return (
      <Pressable
        onPress={() => setCategoriaSelecionada(ativa ? null : cat.chave)}
        style={[
          styles.catButton,
          ativa && styles.catButtonActive,
        ]}
      >
        <Ionicons name={cat.icon} size={18} color={ativa ? "#fff" : "#ff4081"} />
        <Text style={[styles.catText, ativa && { color: "#fff" }]}>{cat.nome}</Text>
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
        <ShopeeBanner />

        {/* Categorias */}
        <FlatList
          data={CATEGORIAS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriasContent}
          style={styles.categoriasContainer}
          renderItem={renderCategoria}
          keyExtractor={(item) => item.id}
        />

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
          <FlatList
            data={ofertasFiltradas}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={renderCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingHorizontal: 10 }}
            style={{ height: 330 }}
          />
        </View>

        {/* Separador */}
        <View style={styles.separator}>
          <View style={styles.separatorLine} />
        </View>

        {/* NOVIDADES */}
        <View style={styles.rowTitle}>
          <Ionicons name="megaphone" size={24} color="#3f51b5" />
          <Text style={styles.titulo}>Novidades</Text>
        </View>

        <View style={styles.sectionBox}>
          <FlatList
            data={novidadesFiltradas}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={renderCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 10 }}
            style={{ height: 330 }}
          />
        </View>

        {/* TODOS PRODUTOS */}
        <View style={styles.rowTitle}>
          <Ionicons name="grid" size={24} color="#444" />
          <Text style={styles.titulo}>Todos os produtos</Text>
        </View>

        <View style={styles.sectionBox}>
          <View style={styles.gridContainer}>
            {grid.map((item, index) => (
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
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* WHATSAPP */}
      <Pressable
        style={styles.whatsButton}
        onPress={abrirWhatsApp}
      >
        <Image source={require("../../assets/whatsapp.png")} style={{ width: 40, height: 40 }} />
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
});