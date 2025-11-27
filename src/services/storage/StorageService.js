/**
 * Storage Service - Gerenciamento de imagens do Firebase Storage
 *
 * Este serviço contém funções para download e gerenciamento de imagens
 * armazenadas no Firebase Storage.
 */

import { ref, getDownloadURL, listAll } from 'firebase/storage';
import { storage } from '../firebase/firebaseConfig';

/**
 * Obtém a URL de download de uma imagem
 * @param {string} caminho - Caminho da imagem no Storage (ex: 'produtos/imagem.jpg')
 * @returns {Promise<string>} URL de download da imagem
 */
export const getImagemUrl = async (caminho) => {
  try {
    if (!caminho) {
      throw new Error('Caminho da imagem não fornecido');
    }

    const imageRef = ref(storage, caminho);
    const url = await getDownloadURL(imageRef);
    return url;
  } catch (error) {
    console.error('Erro ao obter URL da imagem:', error);
    // Retorna uma imagem placeholder em caso de erro
    return null;
  }
};

/**
 * Obtém URLs de múltiplas imagens
 * @param {Array<string>} caminhos - Array de caminhos das imagens
 * @returns {Promise<Array<string>>} Array de URLs de download
 */
export const getMultiplasImagensUrl = async (caminhos) => {
  try {
    if (!caminhos || !Array.isArray(caminhos) || caminhos.length === 0) {
      return [];
    }

    const promises = caminhos.map(caminho => getImagemUrl(caminho));
    const urls = await Promise.all(promises);

    // Filtra URLs nulas (imagens que falharam)
    return urls.filter(url => url !== null);
  } catch (error) {
    console.error('Erro ao obter múltiplas URLs de imagens:', error);
    return [];
  }
};

/**
 * Lista todas as imagens de uma pasta
 * @param {string} pasta - Caminho da pasta no Storage
 * @returns {Promise<Array<string>>} Array de URLs das imagens
 */
export const listarImagensPasta = async (pasta) => {
  try {
    const folderRef = ref(storage, pasta);
    const result = await listAll(folderRef);

    const urlPromises = result.items.map(itemRef => getDownloadURL(itemRef));
    const urls = await Promise.all(urlPromises);

    return urls;
  } catch (error) {
    console.error('Erro ao listar imagens da pasta:', error);
    return [];
  }
};

/**
 * Obtém URL de imagem de produto
 * @param {string} produtoId - ID do produto
 * @param {string} nomeImagem - Nome do arquivo da imagem
 * @returns {Promise<string>} URL da imagem
 */
export const getImagemProduto = async (produtoId, nomeImagem) => {
  const caminho = `produtos/${produtoId}/${nomeImagem}`;
  return await getImagemUrl(caminho);
};

/**
 * Obtém todas as imagens de um produto
 * @param {string} produtoId - ID do produto
 * @returns {Promise<Array<string>>} Array de URLs das imagens
 */
export const getImagensProduto = async (produtoId) => {
  const pasta = `produtos/${produtoId}`;
  return await listarImagensPasta(pasta);
};

/**
 * Obtém URL de imagem de banner
 * @param {string} bannerId - ID do banner
 * @param {string} nomeImagem - Nome do arquivo da imagem
 * @returns {Promise<string>} URL da imagem
 */
export const getImagemBanner = async (bannerId, nomeImagem) => {
  const caminho = `banners/${bannerId}/${nomeImagem}`;
  return await getImagemUrl(caminho);
};

/**
 * Obtém URL de imagem de categoria
 * @param {string} categoriaId - ID da categoria
 * @param {string} nomeImagem - Nome do arquivo da imagem
 * @returns {Promise<string>} URL da imagem
 */
export const getImagemCategoria = async (categoriaId, nomeImagem) => {
  const caminho = `categorias/${categoriaId}/${nomeImagem}`;
  return await getImagemUrl(caminho);
};

/**
 * Cache de URLs de imagens para melhorar performance
 */
const cacheUrls = new Map();

/**
 * Obtém URL de imagem com cache
 * @param {string} caminho - Caminho da imagem
 * @returns {Promise<string>} URL da imagem
 */
export const getImagemUrlComCache = async (caminho) => {
  if (cacheUrls.has(caminho)) {
    return cacheUrls.get(caminho);
  }

  const url = await getImagemUrl(caminho);
  if (url) {
    cacheUrls.set(caminho, url);
  }

  return url;
};

/**
 * Limpa o cache de URLs
 */
export const limparCache = () => {
  cacheUrls.clear();
};

/**
 * Remove uma URL específica do cache
 * @param {string} caminho - Caminho da imagem a remover do cache
 */
export const removerDoCache = (caminho) => {
  cacheUrls.delete(caminho);
};
