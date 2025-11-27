import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import ProductCard from "../components/ProductCard";
import { produtos } from "../data/produtos";

export default function ProductsCarousel() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>🔥 Novidades</Text>

      <FlatList
        data={produtos}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ProductCard item={item} />}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
  },
  titulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
    marginBottom: 8,
  },
});
