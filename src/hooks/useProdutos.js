/**
 * Hook customizado para gerenciar produtos do Firestore
 * Fornece acesso a todos os produtos com real-time updates
 */

import { useState, useEffect } from 'react';
import { getProdutos } from '../services/firestore/FirestoreService';

export const useProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe;

    const carregarProdutos = async () => {
      try {
        setLoading(true);
        setError(null);

        // Usar onSnapshot para real-time updates
        unsubscribe = getProdutos((produtosAtualizados) => {
          setProdutos(produtosAtualizados);
          setLoading(false);
        });
      } catch (err) {
        console.error('Erro ao carregar produtos:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    carregarProdutos();

    // Cleanup: cancela a inscrição quando o componente for desmontado
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  return { produtos, loading, error };
};
