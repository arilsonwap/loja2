/**
 * BannerCarousel - Carrossel de banners do Firebase
 * Renderiza banners de imagem e dinâmicos automaticamente
 */

import React from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  Text,
  Dimensions,
  StyleSheet,
} from 'react-native';
import BannerImagem from './BannerImagem';
import BannerDinamico from './BannerDinamico';

const { width } = Dimensions.get('window');

export default function BannerCarousel({ banners, loading = false, onBannerPress }) {
  // Debug: Log para verificar o estado
  console.log('[BannerCarousel] Loading:', loading);
  console.log('[BannerCarousel] Banners:', banners);
  console.log('[BannerCarousel] Banners length:', banners?.length);

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

  const renderBanner = ({ item }) => {
    console.log('[BannerCarousel] Renderizando banner:', item.id, 'Type:', item.type);

    // Se tiver campo 'type', usa normalmente
    if (item.type === 'image') {
      return <BannerImagem banner={item} onPress={onBannerPress} />;
    } else if (item.type === 'dynamic') {
      return <BannerDinamico banner={item} onPress={onBannerPress} />;
    }

    // FALLBACK: Se não tiver 'type' mas tiver 'imagem', assume como tipo 'image'
    if (!item.type && item.imagem) {
      console.log('[BannerCarousel] Banner sem type, usando imagem como fallback');
      // Mapeia 'imagem' para 'imageUrl' para compatibilidade
      const bannerCompativel = {
        ...item,
        type: 'image',
        imageUrl: item.imageUrl || item.imagem
      };
      return <BannerImagem banner={bannerCompativel} onPress={onBannerPress} />;
    }

    // Se não tiver type nem imagem, avisa
    console.warn('[BannerCarousel] Banner sem type válido:', item);
    return null;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={banners}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        snapToInterval={width * 0.90 + 15}
        decelerationRate="fast"
        contentContainerStyle={styles.contentContainer}
        ItemSeparatorComponent={() => <View style={{ width: 15 }} />}
        renderItem={renderBanner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  contentContainer: {
    paddingHorizontal: 10,
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
