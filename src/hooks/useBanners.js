/**
 * Hook customizado para gerenciar banners do Firestore
 * Fornece acesso a banners com real-time updates
 */

import { useState, useEffect } from 'react';
import { getBanners } from '../services/firestore/FirestoreService';

export const useBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe;

    const carregarBanners = async () => {
      try {
        setLoading(true);
        setError(null);

        // Usar onSnapshot para real-time updates
        unsubscribe = getBanners((bannersAtualizados) => {
          setBanners(bannersAtualizados);
          setLoading(false);
        });
      } catch (err) {
        console.error('Erro ao carregar banners:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    carregarBanners();

    // Cleanup
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  return { banners, loading, error };
};
