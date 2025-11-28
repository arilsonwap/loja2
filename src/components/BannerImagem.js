/**
 * BannerImagem - Banner tipo imagem do Firebase
 * Exibe banners simples com imagem estática
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  useWindowDimensions,
  Linking,
  StyleSheet,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';

const CARD_HEIGHT = 140;

export default function BannerImagem({ banner, onPress }) {
  const { width } = useWindowDimensions();
  const CARD_WIDTH = width * 0.90;
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        card: {
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          borderRadius: 14,
          overflow: 'hidden',
          backgroundColor: '#f5f5f5',
        },
        img: {
          width: '100%',
          height: '100%',
        },
      }),
    [CARD_WIDTH]
  );
  const handlePress = () => {
    if (onPress) {
      onPress(banner);
    } else if (banner.link) {
      Linking.openURL(banner.link).catch((err) =>
        console.warn('Erro ao abrir link:', err)
      );
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={handlePress}
    >
      <ExpoImage
        source={banner.imageUrl}
        style={styles.img}
        contentFit="cover"
        transition={200}
        cachePolicy="disk"
        placeholder={require('../../assets/placeholder.png')}
      />
    </TouchableOpacity>
  );
}
