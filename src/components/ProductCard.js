// ProductCard Otimizado – Versão Premium 🚀

import React, {
  memo,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";

import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Linking,
  Alert,
  Animated,
  useWindowDimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

import { useFavoritos } from "../hooks/useFavoritos";
import { useNavigation } from "@react-navigation/native";

const PLACEHOLDER = require("../../assets/placeholder.png");

/* =======================================================
   Helpers
======================================================= */

// Formatação rápida e nativa
const formatarPreco = (preco) =>
  new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(preco) || 0);

const isOnSale = (item, hasDesconto) => {
  return Boolean(
    item.emOferta ||
      item.promocao ||
      (Number(item.desconto) > 0) ||
      hasDesconto
  );
};

/* =======================================================
   COMPONENTE PRINCIPAL
======================================================= */

function ProductCard({
  item,
  isGrid = false,
  onPress,
  isVisible,   // <- vindo da FlatList
}) {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const { toggleFavorito, isFavorito } = useFavoritos();

  const [imageError, setImageError] = useState(false);

  /* ====================================================
     CONFIGURAÇÕES DE LAYOUT
  ==================================================== */

  const cardWidth = width > 400 ? 180 : 150;

  const imagemCard = useMemo(() => {
    if (!item.imagem) return PLACEHOLDER;

    // Se for require, devolve direto
    if (typeof item.imagem === "number") {
      return item.imagem;
    }

    // Se for URL string
    return { uri: item.imagem };
  }, [item.imagem]);

  const ehFavorito = isFavorito(item.id);

  /* ====================================================
     DESCONTO + BADGE
  ==================================================== */

  const descontoPercentual = useMemo(() => {
    if (!item.precoOriginal || item.precoOriginal <= item.preco) return null;
    return Math.round(100 - (item.preco * 100) / item.precoOriginal);
  }, [item.precoOriginal, item.preco]);

  const hasDesconto = descontoPercentual !== null;

  const badgeType = useMemo(() => {
    if (isOnSale(item, hasDesconto)) return "PROMOCAO";
    if (item.isNovo) return "NOVO";
    return null;
  }, [item, hasDesconto]);

  /* ====================================================
     ANIMAÇÃO DO BADGE SOMENTE SE VISÍVEL
  ==================================================== */

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isVisible || !badgeType) {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      return;
    }

    const anim = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.12,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]);

    const loop = Animated.loop(anim);
    loop.start();

    return () => {
      loop.stop();
      pulseAnim.setValue(1);
    };
  }, [isVisible, badgeType]);

  /* ====================================================
     AÇÕES
  ==================================================== */

  const abrirWhatsApp = useCallback(async () => {
    const numero = "5592999999999";
    const msg = `Olá! Tenho interesse no produto: ${item.nome}`;
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;

    try {
      const supported = await Linking.canOpenURL(url);
      supported
        ? Linking.openURL(url)
        : Alert.alert("Erro", "Não foi possível abrir o WhatsApp.");
    } catch {
      Alert.alert("Erro", "Ocorreu um erro ao abrir o WhatsApp.");
    }
  }, [item.nome]);

  const abrirDetalhes = useCallback(() => {
    // ✅ Usa push ao invés de navigate para empilhar telas
    // Permite navegar entre produtos similares mantendo histórico
    navigation.push("Detalhes", { item });
  }, [item, navigation]);

  const handlePress = onPress || abrirDetalhes;

  const handleToggleFavorito = useCallback(() => {
    toggleFavorito(item);
  }, [item, toggleFavorito]);

  /* ====================================================
     RENDER
  ==================================================== */

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        isGrid ? styles.gridCard : { ...styles.carouselCard, width: cardWidth },
        { opacity: pressed ? 0.95 : 1 },
      ]}
    >
      {/* FAVORITO */}
      <Pressable
        onPress={handleToggleFavorito}
        style={styles.favBtn}
        android_ripple={{ color: "#ddd", radius: 20 }}
      >
        <Ionicons
          name={ehFavorito ? "heart" : "heart-outline"}
          size={20}
          color={ehFavorito ? "#FF4757" : "#B2BEC3"}
        />
      </Pressable>

      {/* IMAGEM */}
      <View style={styles.imgBox}>
        <Image
          source={imageError ? PLACEHOLDER : imagemCard}
          onError={() => setImageError(true)}
          style={styles.cardImg}
          contentFit="contain"
          transition={200}
        />

        {/* Desconto */}
        {hasDesconto && (
          <View style={styles.seloDesconto}>
            <Text style={styles.seloDescontoTexto}>-{descontoPercentual}%</Text>
          </View>
        )}

        {/* Badge NOVO / PROMOÇÃO */}
        {badgeType && (
          <Animated.View
            style={[
              badgeType === "PROMOCAO" ? styles.seloPromocao : styles.seloNovo,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Text style={styles.seloTexto}>
              {badgeType === "PROMOCAO" ? "PROMOÇÃO" : "NOVO"}
            </Text>
          </Animated.View>
        )}
      </View>

      {/* INFO */}
      <View style={styles.contentContainer}>
        <Text numberOfLines={2} style={styles.cardNome}>
          {item.nome}
        </Text>

        {/* Preço original */}
        {hasDesconto ? (
          <Text style={styles.precoOriginal}>
            R$ {formatarPreco(item.precoOriginal)}
          </Text>
        ) : (
          <Text style={styles.precoOriginalPlaceholder}> </Text>
        )}

        {/* Preço final */}
        <View style={styles.priceContainer}>
          <Text style={styles.currencySymbol}>R$</Text>
          <Text style={styles.cardPreco}>{formatarPreco(item.preco)}</Text>
        </View>
      </View>

      {/* BOTÃO WHATSAPP */}
      <Pressable style={styles.btnWhats} onPress={abrirWhatsApp}>
        <Ionicons
          name="logo-whatsapp"
          size={18}
          color="#fff"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.textWhats}>Comprar</Text>
      </Pressable>
    </Pressable>
  );
}

/* =======================================================
   MEMO – comparação inteligente (só ID importa)
======================================================= */
function propsAreEqual(prev, next) {
  return prev.item.id === next.item.id && prev.isVisible === next.isVisible;
}

export default memo(ProductCard, propsAreEqual);

/* =======================================================
   ESTILOS
======================================================= */

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#eee",
  },

  gridCard: { width: "100%" },

  carouselCard: { marginRight: 16 },

  favBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },

  imgBox: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  cardImg: {
    width: "85%",
    height: "85%",
  },

  seloDesconto: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#00b894",
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 10,
  },

  seloDescontoTexto: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 11,
  },

  seloPromocao: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#FF1744",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },

  seloNovo: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#2ED573",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },

  seloTexto: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 9,
  },

  contentContainer: {
    paddingHorizontal: 4,
  },

  cardNome: {
    marginTop: 4,
    fontWeight: "600",
    color: "#2D3436",
    fontSize: 14,
    height: 40,
  },

  precoOriginal: {
    fontSize: 12,
    color: "#B2BEC3",
    textDecorationLine: "line-through",
    marginLeft: 2,
  },

  precoOriginalPlaceholder: {
    height: 16,
  },

  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  currencySymbol: {
    fontSize: 13,
    color: "#636E72",
    marginRight: 2,
  },

  cardPreco: {
    color: "#0984e3",
    fontWeight: "800",
    fontSize: 18,
  },

  btnWhats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#25D366",
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: "center",
    elevation: 3,
    marginTop: 6,
  },

  textWhats: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
});
