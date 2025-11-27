/**
 * Firestore Service - Todas as funções de leitura do Firestore
 *
 * Este serviço contém todas as funções para ler dados do Firestore
 * incluindo produtos, categorias, banners, ofertas e novidades.
 */

import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// ============================================
// CONSTANTES
// ============================================

const DIAS_NOVIDADE = 14; // Produto é considerado NOVO se createdAt < 14 dias

// ============================================
// FUNÇÕES DE PRODUTOS
// ============================================

/**
 * Busca todos os produtos
 * @param {Function} onUpdate - Callback para real-time updates (opcional)
 * @returns {Promise<Array>|Function} Array de produtos ou função de unsubscribe
 */
export const getProdutos = async (onUpdate = null) => {
  try {
    const produtosRef = collection(db, 'produtos');
    const q = query(produtosRef, orderBy('createdAt', 'desc'));

    // Se onUpdate for fornecido, usar onSnapshot para real-time
    if (onUpdate) {
      return onSnapshot(q, (snapshot) => {
        const produtos = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Adiciona flag de novidade
          isNovo: isNovidade(doc.data().createdAt),
          // Calcula porcentagem de desconto
          porcentagemDesconto: calcularDesconto(doc.data())
        }));
        onUpdate(produtos);
      }, (error) => {
        console.error('Erro ao buscar produtos:', error);
        onUpdate([]);
      });
    }

    // Senão, buscar uma vez
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      isNovo: isNovidade(doc.data().createdAt),
      porcentagemDesconto: calcularDesconto(doc.data())
    }));
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    throw error;
  }
};

/**
 * Busca produtos em promoção
 * @param {Function} onUpdate - Callback para real-time updates (opcional)
 * @returns {Promise<Array>|Function} Array de produtos em promoção ou função de unsubscribe
 */
export const getProdutosEmPromocao = async (onUpdate = null) => {
  try {
    const produtosRef = collection(db, 'produtos');
    const q = query(
      produtosRef,
      where('emPromocao', '==', true),
      orderBy('createdAt', 'desc')
    );

    if (onUpdate) {
      return onSnapshot(q, (snapshot) => {
        const produtos = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          isNovo: isNovidade(doc.data().createdAt),
          porcentagemDesconto: calcularDesconto(doc.data())
        }));
        onUpdate(produtos);
      }, (error) => {
        console.error('Erro ao buscar produtos em promoção:', error);
        onUpdate([]);
      });
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      isNovo: isNovidade(doc.data().createdAt),
      porcentagemDesconto: calcularDesconto(doc.data())
    }));
  } catch (error) {
    console.error('Erro ao buscar produtos em promoção:', error);
    throw error;
  }
};

/**
 * Busca produtos novos (adicionados nos últimos 14 dias)
 * @param {Function} onUpdate - Callback para real-time updates (opcional)
 * @returns {Promise<Array>|Function} Array de produtos novos ou função de unsubscribe
 */
export const getNovidades = async (onUpdate = null) => {
  try {
    const produtosRef = collection(db, 'produtos');

    // Calcula a data de 14 dias atrás
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - DIAS_NOVIDADE);
    const timestampLimite = Timestamp.fromDate(dataLimite);

    const q = query(
      produtosRef,
      where('createdAt', '>=', timestampLimite),
      orderBy('createdAt', 'desc')
    );

    if (onUpdate) {
      return onSnapshot(q, (snapshot) => {
        const produtos = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          isNovo: true, // Todos aqui são novos
          porcentagemDesconto: calcularDesconto(doc.data())
        }));
        onUpdate(produtos);
      }, (error) => {
        console.error('Erro ao buscar novidades:', error);
        onUpdate([]);
      });
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      isNovo: true,
      porcentagemDesconto: calcularDesconto(doc.data())
    }));
  } catch (error) {
    console.error('Erro ao buscar novidades:', error);
    throw error;
  }
};

/**
 * Busca produtos por categoria
 * @param {string} categoria - Nome da categoria
 * @param {Function} onUpdate - Callback para real-time updates (opcional)
 * @returns {Promise<Array>|Function} Array de produtos da categoria ou função de unsubscribe
 */
export const getProdutosPorCategoria = async (categoria, onUpdate = null) => {
  try {
    const produtosRef = collection(db, 'produtos');
    const q = query(
      produtosRef,
      where('categoria', '==', categoria),
      orderBy('createdAt', 'desc')
    );

    if (onUpdate) {
      return onSnapshot(q, (snapshot) => {
        const produtos = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          isNovo: isNovidade(doc.data().createdAt),
          porcentagemDesconto: calcularDesconto(doc.data())
        }));
        onUpdate(produtos);
      }, (error) => {
        console.error('Erro ao buscar produtos por categoria:', error);
        onUpdate([]);
      });
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      isNovo: isNovidade(doc.data().createdAt),
      porcentagemDesconto: calcularDesconto(doc.data())
    }));
  } catch (error) {
    console.error('Erro ao buscar produtos por categoria:', error);
    throw error;
  }
};

/**
 * Busca um produto específico por ID
 * @param {string} produtoId - ID do produto
 * @returns {Promise<Object>} Dados do produto
 */
export const getProdutoPorId = async (produtoId) => {
  try {
    const produtoRef = doc(db, 'produtos', produtoId);
    const snapshot = await getDoc(produtoRef);

    if (!snapshot.exists()) {
      throw new Error('Produto não encontrado');
    }

    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data,
      isNovo: isNovidade(data.createdAt),
      porcentagemDesconto: calcularDesconto(data)
    };
  } catch (error) {
    console.error('Erro ao buscar produto por ID:', error);
    throw error;
  }
};

// ============================================
// FUNÇÕES DE CATEGORIAS
// ============================================

/**
 * Busca todas as categorias
 * @param {Function} onUpdate - Callback para real-time updates (opcional)
 * @returns {Promise<Array>|Function} Array de categorias ou função de unsubscribe
 */
export const getCategorias = async (onUpdate = null) => {
  try {
    const categoriasRef = collection(db, 'categorias');
    const q = query(categoriasRef, orderBy('nome', 'asc'));

    if (onUpdate) {
      return onSnapshot(q, (snapshot) => {
        const categorias = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        onUpdate(categorias);
      }, (error) => {
        console.error('Erro ao buscar categorias:', error);
        onUpdate([]);
      });
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  }
};

// ============================================
// FUNÇÕES DE BANNERS
// ============================================

/**
 * Busca todos os banners ativos
 * @param {Function} onUpdate - Callback para real-time updates (opcional)
 * @returns {Promise<Array>|Function} Array de banners ou função de unsubscribe
 */
export const getBanners = async (onUpdate = null) => {
  try {
    const bannersRef = collection(db, 'banners');
    const q = query(
      bannersRef,
      where('ativo', '==', true),
      orderBy('ordem', 'asc')
    );

    if (onUpdate) {
      return onSnapshot(q, (snapshot) => {
        const banners = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        onUpdate(banners);
      }, (error) => {
        console.error('Erro ao buscar banners:', error);
        onUpdate([]);
      });
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erro ao buscar banners:', error);
    throw error;
  }
};

/**
 * Busca banners por tipo (image ou dynamic)
 * @param {string} tipo - Tipo do banner ('image' ou 'dynamic')
 * @param {Function} onUpdate - Callback para real-time updates (opcional)
 * @returns {Promise<Array>|Function} Array de banners ou função de unsubscribe
 */
export const getBannersPorTipo = async (tipo, onUpdate = null) => {
  try {
    const bannersRef = collection(db, 'banners');
    const q = query(
      bannersRef,
      where('ativo', '==', true),
      where('type', '==', tipo),
      orderBy('ordem', 'asc')
    );

    if (onUpdate) {
      return onSnapshot(q, (snapshot) => {
        const banners = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        onUpdate(banners);
      }, (error) => {
        console.error('Erro ao buscar banners por tipo:', error);
        onUpdate([]);
      });
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erro ao buscar banners por tipo:', error);
    throw error;
  }
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Verifica se um produto é novidade (< 14 dias)
 * @param {Timestamp} createdAt - Timestamp de criação do produto
 * @returns {boolean} True se for novidade
 */
const isNovidade = (createdAt) => {
  if (!createdAt) return false;

  const agora = new Date();
  const dataCriacao = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  const diferencaMs = agora - dataCriacao;
  const diferencaDias = diferencaMs / (1000 * 60 * 60 * 24);

  return diferencaDias <= DIAS_NOVIDADE;
};

/**
 * Calcula a porcentagem de desconto de um produto
 * @param {Object} produto - Dados do produto
 * @returns {number} Porcentagem de desconto (0 se não houver)
 */
const calcularDesconto = (produto) => {
  if (!produto.precoOriginal || !produto.preco || !produto.emPromocao) {
    return 0;
  }

  const desconto = ((produto.precoOriginal - produto.preco) / produto.precoOriginal) * 100;
  return Math.round(desconto);
};

/**
 * Formata timestamp do Firestore para data legível
 * @param {Timestamp} timestamp - Timestamp do Firestore
 * @returns {string} Data formatada
 */
export const formatarData = (timestamp) => {
  if (!timestamp) return '';

  const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return data.toLocaleDateString('pt-BR');
};

/**
 * Formata preço para exibição
 * @param {number} preco - Preço do produto
 * @returns {string} Preço formatado (ex: "R$ 99,90")
 */
export const formatarPreco = (preco) => {
  if (!preco) return 'R$ 0,00';

  return preco.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};
