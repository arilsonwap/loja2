/**
 * BannerCarousel - SHOPEE PRO + FADE + ZOOM PREMIUM
 */

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  memo,
} from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  AppState,
  Animated,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import BannerImagem from "./BannerImagem";
import BannerDinamico from "./BannerDinamico";

export default function BannerCarousel({
  banners,
  loading = false,
  onBannerPress,
}) {
  const { width } = useWindowDimensions();

  // 📌 largura igual ao BannerImagem
  const BANNER_WIDTH = width * 0.9;
  const SEPARATOR = 15;
  const SNAP_INTERVAL = BANNER_WIDTH + SEPARATOR;

  const flatListRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTouched, setIsTouched] = useState(false);

  /* ============================================================
   * COMPONENTE FADE + ZOOM PREMIUM
   * ============================================================ */
  const FadeZoomBanner = memo(({ children }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        {children}
      </Animated.View>
    );
  });

  /* ============================================================
   * PAGINADOR (bolinhas Shopee)
   * ============================================================ */
  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {banners.map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === currentIndex ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );

  /* ============================================================
   * AUTOPLAY INTELIGENTE
   * ============================================================ */
  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    if (isTouched) return;

    const timer = setInterval(() => {
      const next = (currentIndex + 1) % banners.length;

      flatListRef.current?.scrollToIndex({
        index: next,
        animated: true,
      });

      setCurrentIndex(next);
    }, 4000);

    return () => clearInterval(timer);
  }, [currentIndex, banners?.length, isTouched]);

  /* ============================================================
   * PAUSA SE APP FOR PARA BACKGROUND
   * ============================================================ */
  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      if (appState.current.match(/inactive|background/)) {
        setIsTouched(true);
      } else {
        setIsTouched(false);
      }
      appState.current = nextState;
    });

    return () => sub.remove();
  }, []);

  /* ============================================================
   * ATUALIZA INDEX AO DESLIZAR
   * ============================================================ */
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (!viewableItems || viewableItems.length === 0) return;
    const index = viewableItems[0]?.index;
    if (typeof index === "number") setCurrentIndex(index);
  });

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  });

  /* ============================================================
   * PAUSE ON TOUCH
   * ============================================================ */
  const handleTouchStart = () => setIsTouched(true);
  const handleTouchEnd = () => setIsTouched(false);

  /* ============================================================
   * RENDER DOS BANNERS (Fade + Zoom aplicado)
   * ============================================================ */
  const renderBanner = useCallback(
    ({ item }) => {
      if (item.type === "image") {
        return (
          <FadeZoomBanner>
            <Pressable onPress={() => onBannerPress?.(item)}>
              <BannerImagem banner={item} />
            </Pressable>
          </FadeZoomBanner>
        );
      }

      if (item.type === "dynamic") {
        return (
          <FadeZoomBanner>
            <BannerDinamico banner={item} onPress={onBannerPress} />
          </FadeZoomBanner>
        );
      }

      if (!item.type && item.imagem) {
        return (
          <FadeZoomBanner>
            <BannerImagem
              banner={{
                ...item,
                type: "image",
                imageUrl: item.imagem,
              }}
              onPress={onBannerPress}
            />
          </FadeZoomBanner>
        );
      }

      return null;
    },
    [onBannerPress]
  );

  /* ============================================================
   * LOADING
   * ============================================================ */
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EE4D2D" />
      </View>
    );
  }

  /* ============================================================
   * SEM BANNERS
   * ============================================================ */
  if (!banners || banners.length === 0) return null;

  /* ============================================================
   * VIEW PRINCIPAL
   * ============================================================ */
  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        renderItem={renderBanner}
        ItemSeparatorComponent={() => <View style={{ width: SEPARATOR }} />}
        getItemLayout={(_, index) => ({
          length: SNAP_INTERVAL,
          offset: SNAP_INTERVAL * index,
          index,
        })}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onScrollBeginDrag={handleTouchStart}
        onScrollEndDrag={handleTouchEnd}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      />

      {renderDots()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },

  /* === Paginação === */
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 8,
  },
  dotActive: {
    backgroundColor: "#EE4D2D",
    width: 22,
  },
  dotInactive: {
    backgroundColor: "#FFB6A4",
    opacity: 0.5,
  },

  loadingContainer: {
    height: 140,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
});
