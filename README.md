# Loja2

Aplicativo mobile em React Native com integração ao Firebase.

## Como copiar o código do projeto

Você pode copiar o repositório inteiro de três maneiras principais. Escolha a que fizer mais sentido para o seu fluxo:

1. **Clonar com Git (recomendado)**
   ```bash
   git clone https://github.com/<sua-org>/<seu-repo>.git
   cd loja2
   npm install
   ```
   - Substitua a URL pelo endereço HTTPS ou SSH do repositório real.
   - Se quiser manter seu próprio repositório, após o clone você pode trocar o remoto:
     ```bash
     git remote set-url origin <url-do-seu-repositorio>
     git push -u origin work
     ```

2. **Baixar um arquivo ZIP**
   - No site do repositório, clique em **Code** > **Download ZIP**.
   - Extraia o conteúdo em uma pasta local.
   - Abra a pasta extraída e instale as dependências com `npm install`.
   - Se quiser versionar suas alterações, inicie um repositório dentro da pasta extraída:
     ```bash
     git init
     git add .
     git commit -m "chore: iniciar projeto local"
     ```

3. **Copiar a pasta manualmente**
   - Se já tem o projeto em sua máquina, copie a pasta `loja2/` para o destino desejado.
   - Para preservar o histórico, inclua também as pastas ocultas (por exemplo, `.git`).

### Após copiar

1. Instale dependências:
   ```bash
   npm install
   ```
2. Rode o app (ajuste conforme sua stack):
   ```bash
   npm start         # ou
   npx expo start
   ```
3. Confirme se o Git está apontando para o remoto correto com `git remote -v` antes de subir suas mudanças.

### Como garantir que as alterações apareçam no GitHub

Se você fez modificações locais e não vê essas mudanças no GitHub, confira os passos abaixo:

1. Verifique se há alterações não commitadas:
   ```bash
   git status
   ```
   - Arquivos em vermelho precisam ser adicionados ao commit.

2. Adicione e registre suas mudanças em um commit:
   ```bash
   git add .
   git commit -m "feat: descreva sua mudança"
   ```

3. Confirme se o remoto `origin` aponta para o repositório correto:
   ```bash
   git remote -v
   git remote set-url origin <url-do-seu-repositorio>   # ajuste se necessário
   ```

4. Envie o commit para o GitHub (ajuste o nome da branch se não for `work`):
   ```bash
   git push origin work
   ```
   - Se for o primeiro push dessa branch, use `git push -u origin work` para vincular o branch local ao remoto.

5. Acesse o repositório no GitHub e recarregue a página. As alterações devem aparecer no histórico de commits e nos arquivos.

### Fluxo rápido (copiar e colar)

Se quiser um roteiro direto para garantir que tudo suba para o GitHub, use esta sequência:

```bash
git status                     # veja o que mudou
git add -A                     # inclua todos os arquivos modificados/novos/removidos
git commit -m "feat: descreva sua mudança"  # registre o commit
git push origin work           # envie para a branch work (ajuste se usar outra)
```

> Dica: se o push falhar, confirme a URL do remoto com `git remote -v` e se está logado na conta correta.
