/**
 * Firebase Configuration - App LOJA
 * 
 * IMPORTANTE: Este arquivo já está configurado com suas credenciais reais.
 * Você só precisa importar `db` e `storage` para usar no app.
 */

import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Suas credenciais reais
const firebaseConfig = {
  apiKey: "AIzaSyAxt2Bl2xjju9hSH_FB-KUATlF_9kQAvSQ",
  authDomain: "loja2-7578d.firebaseapp.com",
  projectId: "loja2-7578d",
  storageBucket: "loja2-7578d.appspot.com", // <-- CORREÇÃO IMPORTANTE
  messagingSenderId: "229857227724",
  appId: "1:229857227724:web:2877904e6ea0039f912369"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// 🔥 Inicializa Firestore com configurações otimizadas para React Native/Expo
// Resolve problemas de WebChannel e conexão instável
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,  // Remove WebChannel, usa Long Polling estável
  useFetchStreams: false,              // Desativa streams que causam problemas no RN
});

export const storage = getStorage(app);    // Storage

export default app;