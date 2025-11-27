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
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EE4D2D" />
      </View>
    );
  }

  if (!banners || banners.length === 0) {
    return null; // Não mostra nada se não houver banners
  }

  const renderBanner = ({ item }) => {
    if (item.type === 'image') {
      return <BannerImagem banner={item} onPress={onBannerPress} />;
    } else if (item.type === 'dynamic') {
      return <BannerDinamico banner={item} onPress={onBannerPress} />;
    }
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
});
