import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HeaderShopee() {
  return (
    <View style={styles.header}>
      {/* BARRA DE BUSCA */}
      <View style={styles.searchArea}>
        <Ionicons name="search" size={20} color="#777" style={{ marginLeft: 6 }} />

        <TextInput
          placeholder="Buscar na Loja"
          placeholderTextColor="#777"
          style={styles.input}
        />

        <TouchableOpacity>
          <Ionicons name="camera" size={22} color="#777" style={{ marginRight: 6 }} />
        </TouchableOpacity>
      </View>

      {/* ÍCONES À DIREITA */}
      <View style={styles.iconsRight}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="chatbubble-ellipses-outline" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="cart-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#FF5722",
    paddingTop: 40, // espaço para Android StatusBar
    paddingBottom: 12,
    paddingHorizontal: 12,
  },

  searchArea: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 6,
    flex: 1,
  },

  input: {
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 14,
    color: "#000",
  },

  iconsRight: {
    flexDirection: "row",
    marginLeft: 10,
    alignItems: "center",
  },

  iconButton: {
    marginLeft: 12,
  },
});
