import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HeaderLoja() {
  return (
    <View style={styles.header}>

      {/* LOGO */}
      <Image
        source={require("../../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* BARRA DE BUSCA */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#777" style={{ marginLeft: 6 }} />

        <TextInput
          placeholder="Buscar produtos"
          placeholderTextColor="#777"
          style={styles.searchInput}
        />

        <TouchableOpacity>
          <Ionicons name="camera" size={22} color="#777" style={{ marginRight: 6 }} />
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 45,     // ← SUBI MAIS PRA BAIXO COMO VOCÊ PEDIU
    paddingBottom: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",  // ← FUNDO 100% TRANSPARENTE
    zIndex: 999,
  },

  logo: {
    width: 42,
    height: 42,
    marginRight: 12,
  },

  searchContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 6,
    elevation: 3,      // leve sombra Android
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },

  searchInput: {
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 14,
    color: "#000",
  },
});
