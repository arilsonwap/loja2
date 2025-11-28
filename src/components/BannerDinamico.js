/**
 * BannerDinamico - Banner dinâmico com gradiente e ícone
 * Exibe banners customizáveis com cores, gradientes e ícones
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  Linking,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const CARD_HEIGHT = 140;

// Lista de ícones válidos e comuns do Ionicons
/** @type {Set<string>} */
const ICONES_VALIDOS = new Set([
  'flame',
  'flash',
  'rocket',
  'star',
  'heart',
  'cart',
  'gift',
  'pricetag',
  'megaphone',
  'trophy',
  'ribbon',
  'sparkles',
  'thumbs-up',
  'trending-up',
  'notifications',
  'alarm',
  'time',
  'calendar',
  'location',
  'headset',
  'volume-high',
  'apps',
  'grid',
  'list',
  'home',
  'storefront',
  'bag',
  'card',
  'wallet',
  'cash',
  'logo-whatsapp',
  'logo-instagram',
  'share-social',
]);

/**
 * Valida se o ícone é válido, retorna um ícone padrão se não for
 */
/**
 * @param {string | undefined | null} iconName
 * @returns {string}
 */
const validarIcone = (iconName) => {
  if (!iconName) return 'flame';

  // Remove prefixos comuns (ios-, md-, logo-)
  const cleanName = iconName.replace(/^(ios-|md-|logo-)/i, '');

  // Verifica se está na lista de ícones válidos
  if (ICONES_VALIDOS.has(cleanName)) {
    return cleanName;
  }

  // Verifica se o nome original é válido (pode ter prefixo)
  if (ICONES_VALIDOS.has(iconName)) {
    return iconName;
  }

  // Se não for válido, usa o ícone padrão e avisa no console
  console.warn(`[BannerDinamico] Ícone "${iconName}" não é válido. Usando "flame" como padrão.`);
  return 'flame';
};

/**
 * @typedef {Object} Banner
 * @property {string=} title
 * @property {string=} subtitle
 * @property {string=} description
 * @property {string=} gradientStart
 * @property {string=} gradientEnd
 * @property {string=} backgroundColor
 * @property {string=} icon
 * @property {string=} link
 */

/**
 * @param {{ banner: Banner; onPress?: (banner: Banner) => void }} props
 */
export default function BannerDinamico({ banner, onPress }) {
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
        },
        container: {
          flex: 1,
          padding: 16,
        },
        content: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
        },
        iconContainer: {
          marginRight: 16,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          justifyContent: 'center',
          alignItems: 'center',
        },
        textContainer: {
          flex: 1,
        },
        title: {
          fontSize: 22,
          fontWeight: 'bold',
          color: '#fff',
          marginBottom: 4,
        },
        subtitle: {
          fontSize: 16,
          fontWeight: '600',
          color: '#fff',
          opacity: 0.95,
          marginBottom: 4,
        },
        description: {
          fontSize: 13,
          color: '#fff',
          opacity: 0.85,
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

  // Cores padrão se não fornecidas
  const gradientStart = banner.gradientStart || '#FF6B6B';
  const gradientEnd = banner.gradientEnd || '#FFE66D';
  const backgroundColor = banner.backgroundColor || '#FF6B6B';
  const iconName = validarIcone(banner.icon);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={handlePress}
    >
      {banner.gradientStart && banner.gradientEnd ? (
        <LinearGradient
          colors={[gradientStart, gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.container}
        >
          {renderContent(banner, iconName, styles)}
        </LinearGradient>
      ) : (
        <View style={[styles.container, { backgroundColor }]}>
          {renderContent(banner, iconName, styles)}
        </View>
      )}
    </TouchableOpacity>
  );
}

/**
 * @param {Banner} banner
 * @param {string} iconName
 * @param {ReturnType<typeof StyleSheet.create>} styles
 */
const renderContent = (banner, iconName, styles) => (
  <View style={styles.content}>
    {/* Ícone */}
    {banner.icon && (
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={40} color="#fff" />
      </View>
    )}

    {/* Textos */}
    <View style={styles.textContainer}>
      {banner.title && (
        <Text style={styles.title} numberOfLines={1}>
          {banner.title}
        </Text>
      )}
      {banner.subtitle && (
        <Text style={styles.subtitle} numberOfLines={1}>
          {banner.subtitle}
        </Text>
      )}
      {banner.description && (
        <Text style={styles.description} numberOfLines={2}>
          {banner.description}
        </Text>
      )}
    </View>
  </View>
);
