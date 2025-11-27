# 🔥 Setup Firebase - Guia Rápido

## ⚡ Instalação Rápida

### 1. Instalar Firebase

```bash
npm install firebase
```

### 2. Configurar credenciais

Edite `src/services/firebase/firebaseConfig.js`:

```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

**Como obter as credenciais:**

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto (ou crie um novo)
3. Vá em **Configurações do Projeto** (ícone de engrenagem)
4. Role até **Seus aplicativos**
5. Clique no ícone **Web** (`</>`)
6. Copie as credenciais do `firebaseConfig`

### 3. Criar coleções no Firestore

No Firebase Console, vá em **Firestore Database** e crie as seguintes coleções:

#### 📦 Coleção: `produtos`

```javascript
{
  nome: "Fone Bluetooth Premium",
  descricao: "Fone com cancelamento de ruído",
  categoria: "Fones",
  preco: 149.90,
  precoOriginal: 199.90,  // Opcional - para promoções
  emPromocao: true,
  imagem: "https://sua-imagem.jpg",
  imagens: ["https://img1.jpg", "https://img2.jpg"],
  createdAt: Firebase.Timestamp.now()
}
```

#### 🏷️ Coleção: `categorias`

```javascript
{
  nome: "Fones",
  icone: "headset"  // Nome do ícone Ionicons
}
```

#### 🎨 Coleção: `banners`

**Banner tipo imagem:**
```javascript
{
  type: "image",
  imageUrl: "https://seu-banner.jpg",
  link: "https://wa.me/5592999999999",
  ordem: 0,
  ativo: true
}
```

**Banner dinâmico:**
```javascript
{
  type: "dynamic",
  title: "Super Ofertas",
  subtitle: "Até 50% OFF",
  description: "Promoções imperdíveis",
  icon: "flame",
  gradientStart: "#FF6B6B",
  gradientEnd: "#FFE66D",
  ordem: 1,
  ativo: true
}
```

### 4. Ativar Firebase na Home

**Opção A - Substituir arquivo:**

```bash
# Fazer backup do original
mv src/screens/HomeScreen.js src/screens/HomeScreen.backup.js

# Ativar versão Firebase
mv src/screens/HomeScreenFirebase.js src/screens/HomeScreen.js
```

**Opção B - Importar no App.js:**

Edite `App.js` e mude a importação:

```javascript
// Antes:
import HomeScreen from './src/screens/HomeScreen';

// Depois:
import HomeScreen from './src/screens/HomeScreenFirebase';
```

### 5. Rodar o app

```bash
npm start
```

---

## 📂 Estrutura criada

```
src/
├── services/
│   ├── firebase/
│   │   └── firebaseConfig.js          ✅ Configuração Firebase
│   ├── firestore/
│   │   └── FirestoreService.js        ✅ Funções de leitura
│   └── storage/
│       └── StorageService.js          ✅ Gerenciamento de imagens
├── hooks/
│   ├── useProdutos.js                 ✅ Hook produtos
│   ├── useProdutosEmPromocao.js       ✅ Hook ofertas
│   ├── useNovidades.js                ✅ Hook novidades
│   ├── useBanners.js                  ✅ Hook banners
│   └── useCategorias.js               ✅ Hook categorias
├── components/
│   ├── BannerImagem.js                ✅ Banner imagem
│   ├── BannerDinamico.js              ✅ Banner dinâmico
│   ├── BannerCarousel.js              ✅ Carrossel banners
│   └── ProductSkeleton.js             ✅ Loading skeleton
└── screens/
    └── HomeScreenFirebase.js          ✅ Home com Firebase
```

---

## ✅ Checklist

- [ ] Instalar: `npm install firebase`
- [ ] Configurar credenciais em `firebaseConfig.js`
- [ ] Criar coleção `produtos` com pelo menos 1 documento
- [ ] Criar coleção `categorias` com pelo menos 1 documento
- [ ] Criar coleção `banners` com pelo menos 1 documento
- [ ] Ativar `HomeScreenFirebase.js`
- [ ] Rodar: `npm start`
- [ ] Testar real-time updates (edite um produto no console)

---

## 🎯 Funcionalidades implementadas

✅ **Leitura de produtos do Firestore**
✅ **Leitura de banners (image e dynamic)**
✅ **Leitura de categorias**
✅ **Ofertas (produtos com `emPromocao: true`)**
✅ **Novidades (produtos criados há menos de 14 dias)**
✅ **Real-time updates com `onSnapshot`**
✅ **Skeleton/Shimmer durante loading**
✅ **Cálculo automático de porcentagem de desconto**
✅ **Selo NOVO para produtos recentes**
✅ **Selo de desconto para promoções**

---

## 🔄 Como funciona o Real-time

Todos os hooks usam `onSnapshot` do Firestore, que escuta mudanças em tempo real.

**Teste:**

1. Abra o Firebase Console
2. Edite o nome de um produto
3. Veja a mudança aparecer **instantaneamente** no app!

---

## 📚 Documentação completa

Para detalhes completos sobre a estrutura do Firestore, campos obrigatórios, tipos de dados e exemplos, consulte:

👉 **[FIRESTORE_STRUCTURE.md](./FIRESTORE_STRUCTURE.md)**

---

## 🆘 Problemas comuns

### Erro: "Firebase not installed"

```bash
npm install firebase
```

### Erro: "Cannot read properties of undefined"

Verifique se as credenciais em `firebaseConfig.js` estão corretas.

### Banners não aparecem

Certifique-se de que:
- Os banners têm `ativo: true`
- O campo `type` é "image" ou "dynamic"
- O campo `ordem` é um número

### Produtos sem selo NOVO

Verifique se o campo `createdAt` é um `Firebase.Timestamp`.

No console do Firebase, use:
```javascript
createdAt: Firebase.firestore.Timestamp.now()
```

---

**🚀 Pronto! Seu app agora está integrado com Firebase!**
