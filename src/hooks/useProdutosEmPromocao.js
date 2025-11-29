/**
 * Hook customizado para gerenciar produtos em promoção do Firestore
 * Fornece acesso a produtos em oferta com real-time updates
 */

import { useState, useEffect } from 'react';
import { getProdutosEmPromocao } from '../services/firestore/FirestoreService';

export const useProdutosEmPromocao = () => {
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe;

    const carregarOfertas = async () => {
      try {
        setLoading(true);
        setError(null);

        // Usar onSnapshot para real-time updates
        unsubscribe = getProdutosEmPromocao((ofertasAtualizadas) => {
          setOfertas(ofertasAtualizadas);
          setLoading(false);
        });
      } catch (err) {
        console.error('Erro ao carregar ofertas:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    carregarOfertas();

    // Cleanup
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  return { ofertas, loading, error };
};
