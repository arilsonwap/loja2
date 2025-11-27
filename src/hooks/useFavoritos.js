import { useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@favoritos-loja";

// 🔥 Funções de storage isoladas
const Storage = {
  async get() {
    try {
      if (Platform.OS === "web") {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
      }
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      return json ? JSON.parse(json) : [];
    } catch (err) {
      console.error("Erro ao carregar favoritos:", err);
      return [];
    }
  },

  async set(data) {
    try {
      const json = JSON.stringify(data);
      if (Platform.OS === "web") {
        localStorage.setItem(STORAGE_KEY, json);
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, json);
      }
    } catch (err) {
      console.error("Erro ao salvar favoritos:", err);
    }
  },
};

export function useFavoritos() {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carregar ao montar
  useEffect(() => {
    let isMounted = true;

    const carregar = async () => {
      const data = await Storage.get();
      if (isMounted) {
        setFavoritos(data);
        setLoading(false);
      }
    };

    carregar();

    return () => {
      isMounted = false;
    };
  }, []);

  // Toggle com callback para evitar race condition
  const toggleFavorito = useCallback((produto) => {
    setFavoritos((prev) => {
      const existe = prev.some((p) => p.id === produto.id);
      const novoArray = existe
        ? prev.filter((p) => p.id !== produto.id)
        : [...prev, produto];

      // Salvar async (não bloqueia UI)
      Storage.set(novoArray);

      return novoArray;
    });
  }, []);

  // Verificar se é favorito
  const isFavorito = useCallback(
    (id) => favoritos.some((p) => p.id === id),
    [favoritos]
  );

  // Limpar todos
  const limparFavoritos = useCallback(() => {
    setFavoritos([]);
    Storage.set([]);
  }, []);

  return {
    favoritos,
    loading,
    toggleFavorito,
    isFavorito,
    limparFavoritos,
    totalFavoritos: favoritos.length,
  };
}