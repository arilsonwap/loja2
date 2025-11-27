/**
 * Hook customizado para gerenciar categorias do Firestore
 * Fornece acesso a categorias com real-time updates
 */

import { useState, useEffect } from 'react';
import { getCategorias } from '../services/firestore/FirestoreService';

export const useCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe;

    const carregarCategorias = async () => {
      try {
        setLoading(true);
        setError(null);

        // Usar onSnapshot para real-time updates
        unsubscribe = getCategorias((categoriasAtualizadas) => {
          setCategorias(categoriasAtualizadas);
          setLoading(false);
        });
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    carregarCategorias();

    // Cleanup
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  return { categorias, loading, error };
};
