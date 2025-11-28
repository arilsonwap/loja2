/**
 * BannerImagem - Banner tipo imagem do Firebase
 * Exibe banners simples com imagem estática
 */

import React from 'react';
import { Pressable, useWindowDimensions, Linking, StyleSheet } from 'react-native';
import { Image as ExpoImage } from 'expo-image';

const PLACEHOLDER = require('../../assets/placeholder.png');
const CARD_WIDTH_FACTOR = 0.9;
const MIN_CARD_HEIGHT = 120;
const MAX_CARD_HEIGHT = 240;

const styles = StyleSheet.create({
  cardBase: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  img: {
    width: '100%',
    height: '100%',
  },
});

const deriveCardSize = (width) => {
  const computedWidth = width * CARD_WIDTH_FACTOR;
  const computedHeight = Math.min(
    Math.max(computedWidth * 0.48, MIN_CARD_HEIGHT),
    MAX_CARD_HEIGHT
  );
  return { width: computedWidth, height: computedHeight };
};

export default function BannerImagem({ banner, onPress, placeholder = PLACEHOLDER }) {
  const { width } = useWindowDimensions();
  const [failedToLoad, setFailedToLoad] = React.useState(false);

  const cardSize = React.useMemo(() => deriveCardSize(width), [width]);

  const isValidImage =
    typeof banner?.imageUrl === 'string' && banner.imageUrl.trim().length > 0;

  const resolvedSource = React.useMemo(() => {
    if (!placeholder) {
      return isValidImage && !failedToLoad ? { uri: banner.imageUrl } : undefined;
    }

    if (!isValidImage || failedToLoad) {
      return placeholder;
    }

    return { uri: banner.imageUrl };
  }, [banner?.imageUrl, failedToLoad, isValidImage, placeholder]);

  const accessibilityLabel =
    banner?.titulo || banner?.descricao || 'Banner de imagem';

  const handlePress = () => {
    if (onPress) {
      onPress(banner);
    } else if (banner?.link) {
      Linking.openURL(banner.link).catch((err) =>
        console.warn('Erro ao abrir link:', err)
      );
    }
  };

  return (
    <Pressable
      style={[styles.cardBase, cardSize]}
      android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
      onPress={handlePress}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={banner?.link ? 'Abre o link do banner' : undefined}
    >
      <ExpoImage
        source={resolvedSource}
        style={styles.img}
        contentFit="cover"
        transition={200}
        cachePolicy="disk"
        placeholder={placeholder}
        onError={() => setFailedToLoad(true)}
      />
    </Pressable>
  );
}
