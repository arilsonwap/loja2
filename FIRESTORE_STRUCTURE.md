# 📦 Estrutura do Firestore - APP LOJA

Este arquivo documenta a estrutura completa das coleções do Firestore que o aplicativo de loja consome.

## 🔧 Como configurar

### 1. Instalar Firebase

```bash
npm install firebase
```

### 2. Configurar credenciais

Edite o arquivo `src/services/firebase/firebaseConfig.js` e substitua as credenciais pelas suas do Firebase Console.

### 3. Criar as coleções no Firestore

Acesse [Firebase Console](https://console.firebase.google.com/) e crie as seguintes coleções:

---

## 📋 Coleções do Firestore

### 1️⃣ **Coleção: `produtos`**

Armazena todos os produtos da loja.

#### Campos:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `nome` | string | ✅ | Nome do produto |
| `descricao` | string | ✅ | Descrição detalhada |
| `categoria` | string | ✅ | Categoria do produto |
| `preco` | number | ✅ | Preço atual (ex: 99.90) |
| `precoOriginal` | number | ❌ | Preço antes do desconto (opcional) |
| `emPromocao` | boolean | ✅ | Se está em promoção (true/false) |
| `imagens` | array | ✅ | Array de URLs das imagens |
| `imagem` | string | ✅ | URL da imagem principal |
| `createdAt` | timestamp | ✅ | Data de criação (para detectar NOVO) |

#### Exemplo de documento:

```json
{
  "id": "produto-001",
  "nome": "Fone Bluetooth Premium",
  "descricao": "Fone de ouvido Bluetooth com cancelamento de ruído",
  "categoria": "Fones",
  "preco": 149.90,
  "precoOriginal": 199.90,
  "emPromocao": true,
  "imagens": [
    "https://exemplo.com/fone-1.jpg",
    "https://exemplo.com/fone-2.jpg",
    "https://exemplo.com/fone-3.jpg"
  ],
  "imagem": "https://exemplo.com/fone-1.jpg",
  "createdAt": Firebase.Timestamp.now()
}
```

#### Lógica especial:

- **NOVO**: Produto é considerado NOVO se `createdAt` for menor que 14 dias
- **PROMOÇÃO**: Selo de desconto aparece se:
  - `emPromocao === true`
  - `precoOriginal` existe e é maior que `preco`
- **Porcentagem de desconto**: Calculada automaticamente: `((precoOriginal - preco) / precoOriginal) * 100`

---

### 2️⃣ **Coleção: `categorias`**

Armazena as categorias de produtos.

#### Campos:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `nome` | string | ✅ | Nome da categoria |
| `icone` | string | ✅ | Nome do ícone (Ionicons) |

#### Exemplo de documento:

```json
{
  "id": "cat-001",
  "nome": "Fones",
  "icone": "headset"
}
```

#### Ícones válidos (Ionicons):

**Categorias comuns:**
- `headset` - Fones
- `flash` - Cabos
- `volume-high` - Caixas de som
- `hardware-chip` - Acessórios
- `apps` - Diversos

**Outros ícones disponíveis:**
- `flame`, `rocket`, `star`, `heart`, `cart`, `gift`, `pricetag`
- `megaphone`, `trophy`, `ribbon`, `sparkles`, `thumbs-up`, `trending-up`
- `notifications`, `alarm`, `time`, `calendar`, `location`
- `grid`, `list`, `home`, `storefront`, `bag`, `card`, `wallet`, `cash`

**⚠️ IMPORTANTE:** Use apenas ícones da lista acima. Ícones inválidos serão substituídos automaticamente por um ícone padrão.

---

### 3️⃣ **Coleção: `banners`**

Armazena banners para o carrossel da Home.

#### Tipos de banner:

1. **Tipo "image"**: Banner com imagem estática
2. **Tipo "dynamic"**: Banner com gradiente, ícone e textos

#### Campos comuns:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `type` | string | ✅ | "image" ou "dynamic" |
| `ordem` | number | ✅ | Ordem de exibição (0, 1, 2...) |
| `ativo` | boolean | ✅ | Se está ativo (true/false) |

#### Campos específicos do tipo "image":

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `imageUrl` | string | ✅ | URL da imagem do banner |
| `link` | string | ❌ | Link ao clicar (opcional) |

#### Campos específicos do tipo "dynamic":

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `title` | string | ✅ | Título principal |
| `subtitle` | string | ❌ | Subtítulo (opcional) |
| `description` | string | ❌ | Descrição (opcional) |
| `icon` | string | ✅ | Nome do ícone (Ionicons) |
| `backgroundColor` | string | ❌ | Cor de fundo (se não usar gradiente) |
| `gradientStart` | string | ❌ | Cor inicial do gradiente |
| `gradientEnd` | string | ❌ | Cor final do gradiente |

#### Exemplo - Banner tipo "image":

```json
{
  "id": "banner-001",
  "type": "image",
  "imageUrl": "https://exemplo.com/banner-promocao.jpg",
  "link": "https://wa.me/5592999999999",
  "ordem": 0,
  "ativo": true
}
```

#### Exemplo - Banner tipo "dynamic":

```json
{
  "id": "banner-002",
  "type": "dynamic",
  "title": "Super Ofertas",
  "subtitle": "Até 50% OFF",
  "description": "Aproveite nossas promoções imperdíveis",
  "icon": "flame",
  "gradientStart": "#FF6B6B",
  "gradientEnd": "#FFE66D",
  "ordem": 1,
  "ativo": true
}
```

---

## 🔥 Funções de leitura disponíveis

Todas as funções estão em `src/services/firestore/FirestoreService.js`:

### Produtos:

- ✅ `getProdutos()` - Todos os produtos
- ✅ `getProdutosEmPromocao()` - Apenas produtos em promoção
- ✅ `getNovidades()` - Produtos adicionados nos últimos 14 dias
- ✅ `getProdutosPorCategoria(categoria)` - Produtos de uma categoria
- ✅ `getProdutoPorId(produtoId)` - Um produto específico

### Categorias:

- ✅ `getCategorias()` - Todas as categorias

### Banners:

- ✅ `getBanners()` - Todos os banners ativos
- ✅ `getBannersPorTipo(tipo)` - Banners por tipo ("image" ou "dynamic")

### Funções auxiliares:

- ✅ `formatarData(timestamp)` - Formata timestamp para data
- ✅ `formatarPreco(preco)` - Formata preço para "R$ 99,90"

---

## 🎣 Hooks customizados

Todos os hooks estão em `src/hooks/`:

- `useProdutos()` - Gerencia todos os produtos com real-time
- `useProdutosEmPromocao()` - Gerencia ofertas com real-time
- `useNovidades()` - Gerencia novidades com real-time
- `useBanners()` - Gerencia banners com real-time
- `useCategorias()` - Gerencia categorias com real-time

### Exemplo de uso:

```javascript
import { useProdutos } from '../hooks/useProdutos';

function MeuComponente() {
  const { produtos, loading, error } = useProdutos();

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Erro: {error}</Text>;

  return (
    <FlatList
      data={produtos}
      renderItem={({ item }) => <ProductCard item={item} />}
    />
  );
}
```

---

## 🔄 Real-time Updates

Todas as funções suportam **real-time updates** através do `onSnapshot` do Firestore.

Quando você atualizar um produto no Firebase Console, a mudança aparecerá **instantaneamente** no app!

---

## 📱 Como usar na Home

Para ativar a versão com Firebase:

1. Renomeie `src/screens/HomeScreen.js` para `HomeScreen.backup.js`
2. Renomeie `src/screens/HomeScreenFirebase.js` para `HomeScreen.js`
3. Configure suas credenciais no `firebaseConfig.js`
4. Crie as coleções no Firestore seguindo esta estrutura
5. Execute o app: `npm start`

---

## 🎨 Componentes criados

### Banners:

- `BannerImagem` - Renderiza banners tipo "image"
- `BannerDinamico` - Renderiza banners tipo "dynamic"
- `BannerCarousel` - Carrossel principal (usa ambos)

### Produtos:

- `ProductCard` - Card de produto (já existente, compatível com Firebase)
- `ProductSkeleton` - Skeleton para loading
- `ProductSkeletonGrid` - Grid de skeletons
- `ProductSkeletonCarousel` - Carrossel de skeletons

---

## ✅ Checklist de implantação

- [ ] Instalar Firebase: `npm install firebase`
- [ ] Configurar credenciais em `firebaseConfig.js`
- [ ] Criar coleção `produtos` no Firestore
- [ ] Criar coleção `categorias` no Firestore
- [ ] Criar coleção `banners` no Firestore
- [ ] Adicionar produtos de exemplo
- [ ] Adicionar categorias de exemplo
- [ ] Adicionar banners de exemplo
- [ ] Ativar `HomeScreenFirebase.js`
- [ ] Testar real-time updates

---

## 🚀 Próximos passos (Admin - futuro)

O admin será implementado depois e incluirá:

- Adicionar produtos
- Editar produtos
- Remover produtos
- Gerenciar categorias
- Gerenciar banners
- Upload de imagens para Firebase Storage

---

**Desenvolvido com ❤️ para o APP LOJA**
