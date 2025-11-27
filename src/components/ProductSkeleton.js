/**
 * ProductSkeleton - Skeleton/Shimmer para loading de produtos
 * Exibe placeholders animados enquanto os produtos carregam
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, useWindowDimensions } from 'react-native';

const ProductSkeleton = ({ isGrid }) => {
  const { width } = useWindowDimensions();
  const cardWidth = width > 400 ? 180 : 150;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View
      style={[
        styles.card,
        isGrid ? styles.gridCard : { ...styles.carouselCard, width: cardWidth },
      ]}
    >
      {/* Imagem */}
      <Animated.View style={[styles.imageSkeleton, { opacity }]} />

      {/* Nome */}
      <Animated.View style={[styles.textSkeleton, styles.nameSkeleton, { opacity }]} />
      <Animated.View style={[styles.textSkeleton, styles.nameSkeletonSmall, { opacity }]} />

      {/* Preço */}
      <Animated.View style={[styles.textSkeleton, styles.priceSkeleton, { opacity }]} />

      {/* Botão */}
      <Animated.View style={[styles.buttonSkeleton, { opacity }]} />
    </View>
  );
};

const ProductSkeletonGrid = ({ count = 6 }) => {
  return (
    <View style={styles.gridContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.gridItem}>
          <ProductSkeleton isGrid />
        </View>
      ))}
    </View>
  );
};

const ProductSkeletonCarousel = ({ count = 4 }) => {
  return (
    <View style={styles.carouselContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductSkeleton key={index} isGrid={false} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  gridCard: {
    width: '100%',
  },
  carouselCard: {
    marginRight: 16,
  },
  imageSkeleton: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    backgroundColor: '#e1e8ed',
    marginBottom: 8,
  },
  textSkeleton: {
    backgroundColor: '#e1e8ed',
    borderRadius: 4,
    marginBottom: 8,
  },
  nameSkeleton: {
    height: 16,
    width: '100%',
  },
  nameSkeletonSmall: {
    height: 16,
    width: '70%',
  },
  priceSkeleton: {
    height: 20,
    width: '50%',
    marginTop: 4,
  },
  buttonSkeleton: {
    height: 40,
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#e1e8ed',
    marginTop: 6,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  gridItem: {
    width: '48%',
    marginBottom: 16,
  },
  carouselContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
});

export { ProductSkeleton, ProductSkeletonGrid, ProductSkeletonCarousel };
