/**
 * Configurações e constantes globais da aplicação
 */

// Configuração do WhatsApp
export const WHATSAPP_CONFIG = {
  // Número padrão da loja (formato: código do país + DDD + número)
  NUMERO_PADRAO: "5592999999999",

  // Mensagem padrão para produtos
  mensagemProduto: (nomeProduto) =>
    `Olá! Tenho interesse no produto: ${nomeProduto}`,

  // Mensagem genérica
  mensagemGenerica: () =>
    "Olá! Gostaria de mais informações sobre os produtos.",
};

// Outras configurações podem ser adicionadas aqui
export const APP_CONFIG = {
  NOME: "Minha Loja",
  VERSAO: "1.0.0",
};
