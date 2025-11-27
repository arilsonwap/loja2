/**
 * Firebase Configuration
 *
 * IMPORTANTE: Substitua as credenciais abaixo pelas suas credenciais do Firebase
 *
 * Para obter suas credenciais:
 * 1. Acesse https://console.firebase.google.com/
 * 2. Selecione seu projeto (ou crie um novo)
 * 3. Vá em Configurações do Projeto > Seus aplicativos
 * 4. Copie as credenciais do SDK do Firebase
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuração do Firebase - SUBSTITUA COM SUAS CREDENCIAIS
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX" // Opcional
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa serviços
export const db = getFirestore(app);
export const storage = getStorage(app);

// Exporta a instância do app para uso futuro
export default app;
