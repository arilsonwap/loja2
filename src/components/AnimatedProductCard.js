import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import ProductCard from "./ProductCard";

export default function AnimatedProductCard({ item, index }) {
  const fade = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 350,
      delay: index * 120, // 🔥 delay automático por item
      useNativeDriver: true,
    }).start();

    Animated.timing(translate, {
      toValue: 0,
      duration: 350,
      delay: index * 120,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fade,
        transform: [{ translateY: translate }],
      }}
    >
      <ProductCard item={item} />
    </Animated.View>
  );
}
