/**
 * BannerCarousel - Carrossel de banners do Firebase
 * Renderiza banners de imagem e dinâmicos automaticamente
 */

import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  Text,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import BannerImagem from './BannerImagem';
import BannerDinamico from './BannerDinamico';

export default function BannerCarousel({ banners, loading = false, onBannerPress }) {
  const { width } = useWindowDimensions();

  const renderBanner = useCallback(
    ({ item }) => {
      // Se tiver campo 'type', usa normalmente
      if (item.type === 'image') {
        return <BannerImagem banner={item} onPress={onBannerPress} />;
      } else if (item.type === 'dynamic') {
        return <BannerDinamico banner={item} onPress={onBannerPress} />;
      }

      // FALLBACK: Se não tiver 'type' mas tiver 'imagem', assume como tipo 'image'
      if (!item.type && item.imagem) {
        // Mapeia 'imagem' para 'imageUrl' para compatibilidade
        const bannerCompativel = {
          ...item,
          type: 'image',
          imageUrl: item.imageUrl || item.imagem,
        };
        return <BannerImagem banner={bannerCompativel} onPress={onBannerPress} />;
      }

      // Se não tiver type nem imagem, avisa
      console.warn('[BannerCarousel] Banner sem type válido:', item);
      return null;
    },
    [onBannerPress]
  );

  const keyExtractor = useCallback(
    (item, index) => (item?.id ? String(item.id) : `banner-${index}`),
    []
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EE4D2D" />
      </View>
    );
  }

  if (!banners || banners.length === 0) {
    // Mostra mensagem de debug quando não há banners
    console.warn('[BannerCarousel] Nenhum banner disponível');
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          ℹ️ Nenhum banner disponível. Configure banners no Firestore.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={banners}
        horizontal
        keyExtractor={keyExtractor}
        showsHorizontalScrollIndicator={false}
        snapToInterval={width * 0.90 + 15}
        decelerationRate="fast"
        contentContainerStyle={styles.contentContainer}
        ItemSeparatorComponent={Separator}
        renderItem={renderBanner}
      />
    </View>
  );
}

const Separator = React.memo(() => <View style={styles.separator} />);

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  contentContainer: {
    paddingHorizontal: 10,
  },
  separator: {
    width: 15,
  },
  loadingContainer: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  emptyContainer: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginHorizontal: 20,
    backgroundColor: '#FFF3CD',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFE69C',
  },
  emptyText: {
    fontSize: 13,
    color: '#856404',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
