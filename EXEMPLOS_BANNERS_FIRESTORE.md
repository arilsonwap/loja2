# 🎨 Exemplos de Banners para o Firestore

## 📍 Como adicionar banners

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Vá em **Firestore Database**
3. Crie a coleção `banners` (se não existir)
4. Clique em **Adicionar documento**
5. Cole os exemplos abaixo

---

## 🖼️ BANNER TIPO IMAGE (Imagem estática)

### Exemplo 1: Banner com imagem

```javascript
{
  type: "image",
  imageUrl: "https://i.postimg.cc/V6Wcn94R/234d19ab-116a-466a-81f2-83aaee91aef1.png",
  link: "https://wa.me/5592999999999",
  ordem: 0,
  ativo: true
}
```

### Exemplo 2: Banner promocional

```javascript
{
  type: "image",
  imageUrl: "https://i.postimg.cc/63ydGzB2/179768b6-f2d1-413e-a79f-026458961c06.png",
  link: "https://shopee.com.br",
  ordem: 1,
  ativo: true
}
```

---

## 🌈 BANNER TIPO DYNAMIC (Gradiente + Ícone)

### Exemplo 1: Ofertas Quentes 🔥

```javascript
{
  type: "dynamic",
  title: "Super Ofertas",
  subtitle: "Até 50% OFF",
  description: "Aproveite descontos incríveis em produtos selecionados",
  icon: "flame",
  gradientStart: "#FF6B6B",
  gradientEnd: "#FFE66D",
  link: "https://wa.me/5592999999999",
  ordem: 2,
  ativo: true
}
```

### Exemplo 2: Lançamentos 🚀

```javascript
{
  type: "dynamic",
  title: "Novidades",
  subtitle: "Produtos Exclusivos",
  description: "Confira os últimos lançamentos da loja",
  icon: "rocket",
  gradientStart: "#667EEA",
  gradientEnd: "#764BA2",
  link: "",
  ordem: 3,
  ativo: true
}
```

### Exemplo 3: Frete Grátis 🎁

```javascript
{
  type: "dynamic",
  title: "Frete Grátis",
  subtitle: "Acima de R$ 100",
  description: "Aproveite frete grátis em compras acima de R$ 100",
  icon: "gift",
  gradientStart: "#F093FB",
  gradientEnd: "#F5576C",
  ordem: 4,
  ativo: true
}
```

### Exemplo 4: WhatsApp Direto 💬

```javascript
{
  type: "dynamic",
  title: "Atendimento VIP",
  subtitle: "Fale Conosco",
  description: "Tire suas dúvidas direto pelo WhatsApp",
  icon: "logo-whatsapp",
  gradientStart: "#00D084",
  gradientEnd: "#34D399",
  link: "https://wa.me/5592999999999",
  ordem: 5,
  ativo: true
}
```

---

## 🎨 COMBINAÇÕES DE GRADIENTES INCRÍVEIS

### Laranja → Amarelo (Vibrante)
```javascript
gradientStart: "#FF6B6B"
gradientEnd: "#FFE66D"
```

### Roxo → Azul (Elegante)
```javascript
gradientStart: "#667EEA"
gradientEnd: "#764BA2"
```

### Rosa → Vermelho (Intenso)
```javascript
gradientStart: "#F093FB"
gradientEnd: "#F5576C"
```

### Verde → Verde Claro (Suave)
```javascript
gradientStart: "#00D084"
gradientEnd: "#34D399"
```

### Azul → Ciano (Moderno)
```javascript
gradientStart: "#4FACFE"
gradientEnd: "#00F2FE"
```

### Laranja → Rosa (Tropical)
```javascript
gradientStart: "#FA709A"
gradientEnd: "#FEE140"
```

---

## 🔍 CAMPOS OBRIGATÓRIOS

### Para TODOS os banners:
- ✅ `type` - "image" ou "dynamic"
- ✅ `ordem` - número (0, 1, 2...)
- ✅ `ativo` - true ou false

### Apenas para type "image":
- ✅ `imageUrl` - URL da imagem

### Apenas para type "dynamic":
- ✅ `title` - Título principal
- ✅ `icon` - Nome do ícone ([veja lista](FIRESTORE_STRUCTURE.md#ícones-válidos-ionicons))

### Campos opcionais:
- ❌ `subtitle` - Subtítulo
- ❌ `description` - Descrição
- ❌ `link` - URL para abrir ao clicar
- ❌ `backgroundColor` - Cor sólida (se não usar gradiente)
- ❌ `gradientStart` - Cor inicial do gradiente
- ❌ `gradientEnd` - Cor final do gradiente

---

## 📊 ORDEM DOS BANNERS

Os banners aparecem na ordem do campo `ordem`:

```
ordem: 0  → Aparece primeiro
ordem: 1  → Aparece segundo
ordem: 2  → Aparece terceiro
...
```

---

## ✅ CHECKLIST RÁPIDO

Ao criar um banner, verifique:

- [ ] Campo `type` está como "image" ou "dynamic"
- [ ] Campo `ordem` é um número
- [ ] Campo `ativo` está como `true`
- [ ] Se type="image": tem `imageUrl`
- [ ] Se type="dynamic": tem `title` e `icon`
- [ ] Ícone é válido (veja lista de ícones válidos)
- [ ] URLs começam com `http://` ou `https://`

---

## 🐛 DEBUG

Se os banners não aparecerem, verifique no console:

```
[BannerCarousel] Loading: false
[BannerCarousel] Banners: Array(3)
[BannerCarousel] Banners length: 3
```

Se aparecer:
- `Banners: []` → Não há banners no Firestore
- `Banners: undefined` → Erro ao buscar banners
- `Loading: true` → Ainda carregando

---

## 🚀 EXEMPLO COMPLETO DE SETUP

Cole estes 3 banners no Firestore para começar:

### Banner 1:
```javascript
{
  type: "dynamic",
  title: "Bem-vindo!",
  subtitle: "Loja Premium",
  icon: "storefront",
  gradientStart: "#FF6B6B",
  gradientEnd: "#FFE66D",
  ordem: 0,
  ativo: true
}
```

### Banner 2:
```javascript
{
  type: "dynamic",
  title: "Ofertas",
  subtitle: "50% OFF",
  icon: "flame",
  gradientStart: "#667EEA",
  gradientEnd: "#764BA2",
  ordem: 1,
  ativo: true
}
```

### Banner 3:
```javascript
{
  type: "dynamic",
  title: "WhatsApp",
  subtitle: "Fale Conosco",
  icon: "logo-whatsapp",
  gradientStart: "#00D084",
  gradientEnd: "#34D399",
  link: "https://wa.me/5592999999999",
  ordem: 2,
  ativo: true
}
```

---

**🎉 Pronto! Seus banners devem aparecer na Home agora!**
