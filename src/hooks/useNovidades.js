/**
 * Hook customizado para gerenciar novidades (produtos < 14 dias) do Firestore
 * Fornece acesso a produtos novos com real-time updates
 */

import { useState, useEffect } from 'react';
import { getNovidades } from '../services/firestore/FirestoreService';

export const useNovidades = () => {
  const [novidades, setNovidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe;

    const carregarNovidades = async () => {
      try {
        setLoading(true);
        setError(null);

        // Usar onSnapshot para real-time updates
        unsubscribe = getNovidades((novidadesAtualizadas) => {
          setNovidades(novidadesAtualizadas);
          setLoading(false);
        });
      } catch (err) {
        console.error('Erro ao carregar novidades:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    carregarNovidades();

    // Cleanup
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  return { novidades, loading, error };
};
