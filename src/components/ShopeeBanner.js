// ShopeeBanner.js
import React from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Linking,
  StyleSheet,
} from "react-native";
import { Image as ExpoImage } from "expo-image";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.90;        // um pouco maior
const CARD_HEIGHT = 140;                // altura fixa do seu layout

const banners = [
  {
    id: "1",
    imagem: "https://i.postimg.cc/V6Wcn94R/234d19ab-116a-466a-81f2-83aaee91aef1.png",
    link: "https://shopee.com.br",
  },
  {
    id: "2",
    imagem: "https://i.postimg.cc/63ydGzB2/179768b6-f2d1-413e-a79f-026458961c06.png",
    link: "https://wa.me/5592999999999?text=Quero%20esse%20produto",
  },
  {
    id: "3",
    imagem: "https://i.postimg.cc/YqtN2ZtJ/caixa-som-banner-premium.png", // coloque aqui o novo banner
    link: "https://shopee.com.br",
  }
];

export default function ShopeeBanner() {
  const handlePress = (url) => {
    if (!url) return;
    Linking.openURL(url).catch((err) =>
      console.warn("Erro ao abrir link:", err)
    );
  };

  return (
    <View style={{ marginTop: 12 }}>
      <FlatList
        data={banners}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 15}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 10 }}
        ItemSeparatorComponent={() => <View style={{ width: 15 }} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => handlePress(item.link)}
          >
            <ExpoImage
              source={item.imagem}
              style={styles.img}
              contentFit="contain"     // evita cortes
              transition={200}
              cachePolicy="disk"
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#000", // preto premium por trás
  },
  img: {
    width: "100%",
    height: "100%",
  },
});
