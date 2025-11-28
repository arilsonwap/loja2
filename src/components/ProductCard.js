import React, { useEffect, useRef, memo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Animated,
  Alert,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFavoritos } from "../hooks/useFavoritos";
import { useNavigation } from "@react-navigation/native"; // << IMPORTANTE

const ProductCard = ({ item, isGrid, onPress }) => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;
  const animationRef = useRef(null);

  const { toggleFavorito, isFavorito } = useFavoritos();

  const formatarPreco = (preco) => {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(preco);
  };

  // Cálculo automático do desconto
  const calcularDesconto = () => {
    if (!item.precoOriginal || item.precoOriginal <= item.preco) return null;
    const desconto = 100 - (item.preco * 100) / item.precoOriginal;
    return Math.round(desconto);
  };

  const descontoPercentual = calcularDesconto();
  const ehFavorito = isFavorito(item.id);
  const cardWidth = width > 400 ? 180 : 150;

  // Animação para itens novos
  useEffect(() => {
    if (!item.isNovo) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    animationRef.current = animation;

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [item.isNovo]);

  const abrirWhatsApp = async () => {
    const numero = "5592999999999";
    const mensagem = `Olá! Tenho interesse no produto: ${item.nome}`;
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Erro", "Não foi possível abrir o WhatsApp.");
      }
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao tentar abrir o WhatsApp.");
    }
  };

  const abrirDetalhes = () => {
    navigation.navigate("Detalhes", { item });
  };

  const handlePress = onPress || abrirDetalhes;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      accessibilityLabel={`Ver detalhes do produto ${item.nome}`}
      accessibilityRole="button"
      onPressIn={() => {
        Animated.spring(pressAnim, { toValue: 0.96, useNativeDriver: true }).start();
      }}
      onPressOut={() => {
        Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true }).start();
      }}
    >
      <Animated.View
        style={[
          styles.card,
          isGrid ? styles.gridCard : { ...styles.carouselCard, width: cardWidth },
          { transform: [{ scale: pressAnim }] },
        ]}
      >
        {/* FAVORITO */}
        <TouchableOpacity
          style={styles.favBtn}
          onPress={() => toggleFavorito(item)}
          accessibilityLabel={ehFavorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          accessibilityRole="button"
          accessibilityState={{ selected: ehFavorito }}
        >
          <Ionicons
            name={ehFavorito ? "heart" : "heart-outline"}
            size={20}
            color={ehFavorito ? "#FF4757" : "#B2BEC3"}
          />
        </TouchableOpacity>

        {/* IMAGEM */}
        <View style={styles.imgBox}>
          <Image
            source={{ uri: item.imagem }}
            style={styles.cardImg}
            resizeMode="contain"
            defaultSource={require("../../assets/placeholder.png")}
          />

          {descontoPercentual && (
            <View style={styles.seloDesconto}>
              <Text style={styles.seloDescontoTexto}>-{descontoPercentual}%</Text>
            </View>
          )}

          {item.isNovo && (
            <Animated.View
              style={[styles.seloNovo, { transform: [{ scale: pulseAnim }] }]}
            >
              <Text style={styles.seloTexto}>NOVO</Text>
            </Animated.View>
          )}
        </View>

        {/* INFORMAÇÕES */}
        <View style={styles.contentContainer}>
          <Text style={styles.cardNome} numberOfLines={2}>
            {item.nome}
          </Text>

          {/* PREÇOS */}
          <View style={styles.precoBox}>
            {item.precoOriginal && (
              <Text style={styles.precoOriginal}>
                R$ {formatarPreco(item.precoOriginal)}
              </Text>
            )}

            <View style={styles.priceContainer}>
              <Text style={styles.currencySymbol}>R$</Text>
              <Text style={styles.cardPreco}>{formatarPreco(item.preco)}</Text>
            </View>
          </View>
        </View>

        {/* BOTÃO WHATSAPP */}
        <TouchableOpacity style={styles.btnWhats} onPress={abrirWhatsApp}>
          <Ionicons name="logo-whatsapp" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.textWhats}>Comprar</Text>
        </TouchableOpacity>
      </Animated.View>
    </TouchableOpacity>
  );
};

/* ==================== ESTILOS ==================== */
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
    position: "relative",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },

  gridCard: {
    width: "100%",
  },

  carouselCard: {
    marginRight: 16,
  },

  favBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },

  seloDesconto: {
    position: "absolute",
    right: 10,
    bottom: 10,
    backgroundColor: "#00b894",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    zIndex: 20,
  },

  seloDescontoTexto: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 11,
  },

  imgBox: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    position: "relative",
  },

  cardImg: {
    width: "85%",
    height: "85%",
  },

  seloNovo: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#2ED573",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    zIndex: 15,
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
    lineHeight: 18,
    letterSpacing: -0.3,
  },

  precoBox: {
    marginTop: 6,
    marginBottom: 10,
  },

  precoOriginal: {
    fontSize: 12,
    color: "#B2BEC3",
    textDecorationLine: "line-through",
    marginLeft: 2,
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
    letterSpacing: -0.5,
  },

  btnWhats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#25D366",
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: "center",
    elevation: 2,
    marginTop: 6,
  },

  textWhats: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
});

export default memo(ProductCard);