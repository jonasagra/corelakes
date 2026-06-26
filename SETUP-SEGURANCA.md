# Segurança e configuração — Corelakes

Este documento explica **o que foi corrigido**, **por que** e o **passo a passo**
para colocar tudo no ar com Neon + Vercel.

---

## 1. O problema que existia

A versão antiga não tinha back-end: o navegador falava direto com o banco.

- **"Admin" era só uma marca no navegador.** O acesso era decidido por
  `localStorage.admin_authenticated === 'true'`. Qualquer visitante abria o DevTools,
  digitava uma linha e virava admin.
- **A chave do banco ia para todo mundo.** A `anon key` do Supabase estava fixa no
  código e era baixada por qualquer visitante. Com ela, dava para criar/editar/apagar
  posts direto pelo Console, sem nem passar pela tela de login.
- **Conteúdo era injetado sem sanitização** (`dangerouslySetInnerHTML` cru), abrindo
  espaço para XSS.

> **A verdade técnica:** não existe como impedir alguém de mexer no DevTools **do
> próprio navegador dele** — é a máquina dele. O que dá para garantir é que **nada do
> que ele faça ali chegue ao seu banco**. Para isso, a decisão de segurança precisa
> acontecer no **servidor**, não no navegador. É exatamente o que foi feito.

---

## 2. O que mudou (modelo de segurança)

```
ANTES:   navegador  ──(chave pública)──►  banco        ❌ qualquer um escreve
AGORA:   navegador  ──►  /api/* (servidor)  ──►  Neon   ✅ servidor decide tudo
```

- **O navegador nunca mais toca no banco.** Ele só conversa com `/api/*`. A
  `DATABASE_URL` do Neon fica só no servidor (variável de ambiente), nunca no bundle.
- **Login de verdade, com sessão impossível de forjar.** A senha é conferida no
  servidor contra um *hash* (scrypt). Em caso de sucesso, o servidor cria um cookie de
  sessão **httpOnly + Secure + SameSite=Strict**:
  - `httpOnly`: o JavaScript da página (e o DevTools via `document.cookie`) **não
    consegue ler nem alterar** o cookie.
  - Assinado (JWT/HS256): sem o `AUTH_SECRET`, ninguém fabrica uma sessão válida.
- **Toda escrita é reautorizada e revalidada no servidor.** Cada `POST/PUT/DELETE`
  exige a sessão válida e passa por validação de tamanho e **sanitização de HTML**
  (remove `<script>`, `onerror`, etc.) antes de gravar.
- **Render também sanitiza** (DOMPurify), como segunda camada.
- **A tela de "configurar Supabase" foi removida** — não há mais credencial no navegador.

### Camadas extras de endurecimento

Depois da migração, fechamos mais quatro pontos que um pentest acusaria:

1. **Limite de tentativas no login (anti força-bruta).** Tentativas são contadas por IP
   na tabela `login_attempts`; passando de 10 em 15 minutos, o login responde `429`
   (bloqueado temporariamente).
2. **Login em tempo constante.** O servidor roda a verificação de senha (scrypt)
   **mesmo quando o e-mail não existe**, usando um hash "isca". Assim a resposta demora
   o mesmo nos dois casos e ninguém descobre quais e-mails são válidos pelo tempo.
3. **2ª camada anti-CSRF (check de `Origin`).** Além do `SameSite=Strict`, toda escrita
   confere se o header `Origin` bate com o domínio do servidor; se não bater, responde
   `403`.
4. **Revogação de sessão.** A coluna `users.token_version` é embutida no crachá. Para
   "deslogar de todos os lugares" (ex.: suspeita de vazamento), basta incrementá-la e
   todos os crachás antigos param de valer. Trocar a senha já faz isso automaticamente.

---

## 3. Passo a passo para colocar no ar

### 3.1. Criar o banco no Neon

1. Crie uma conta em [neon.tech](https://neon.tech) e um projeto novo.
2. Em **Connection Details**, copie a *connection string* (use a versão **Pooled**).
3. Abra o **SQL Editor** do Neon, cole o conteúdo de [`db/schema.sql`](./db/schema.sql)
   e execute. Cria as tabelas `posts`, `users` e `login_attempts`.
   - *Já tinha rodado uma versão antiga do schema?* Rode também
     [`db/hardening.sql`](./db/hardening.sql) (seguro rodar mais de uma vez).

### 3.2. Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

| Variável | O que é | Onde conseguir |
|---|---|---|
| `DATABASE_URL` | conexão com o Neon | Neon → Connection Details (Pooled) |
| `AUTH_SECRET` | segredo p/ assinar a sessão | gere você (veja abaixo) |
| `BLOB_READ_WRITE_TOKEN` | token do storage de imagens | Vercel → Storage → Blob |

Gere um `AUTH_SECRET` forte:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> O `.env` **não** vai para o Git (já está no `.gitignore`). Na Vercel, configure as
> mesmas variáveis em **Settings → Environment Variables**.

### 3.3. Storage de imagens (Vercel Blob)

1. Na Vercel, abra seu projeto → **Storage** → **Create** → **Blob**.
2. Conecte ao projeto. A Vercel injeta `BLOB_READ_WRITE_TOKEN` no deploy. Para rodar
   local, copie esse token para o seu `.env`.

### 3.4. Criar o usuário admin

Com o `.env` preenchido (precisa do `DATABASE_URL`):

```bash
npm run create-admin -- "seu@email.com" "suaSenhaForte"
```

Grava o usuário com a senha em *hash*. Rodar de novo com o mesmo e-mail **troca a
senha** (e revoga sessões antigas). Use senha de 8+ caracteres.

### 3.5. Rodar localmente

As funções em `/api` **não** rodam com `npm run dev` (esse é só o front Vite).
Use o `vercel dev`, que sobe o front **e** a API juntos:

```bash
npm i -g vercel      # uma vez
vercel link          # uma vez, conecta a pasta ao projeto da Vercel
vercel dev           # http://localhost:3000  (front + /api)
```

### 3.6. Deploy

1. Commit e push para o GitHub.
2. Na Vercel (preset **Vite**) a pasta `/api` é detectada automaticamente.
3. Confirme as 3 variáveis em **Settings → Environment Variables** (Production e Preview).
4. Deploy.

### 3.7. Revogar sessões (quando precisar)

Se suspeitar que um cookie vazou, derrube todas as sessões ativas:

```bash
npm run revoke-sessions -- "seu@email.com"
```

---

## 4. Faça isto também (importante)

- **Aposente o projeto Supabase antigo.** A `anon key` antiga ficou exposta no histórico
  do Git e em deploys anteriores. Como você não vai mais usar o Supabase, **delete o
  projeto** (ou rotacione as chaves) para não deixar uma porta aberta.
- **Nunca comite o `.env`.** Já está protegido pelo `.gitignore`; mantenha assim.
- **Troque a senha do admin** se ela já tiver sido digitada em algum lugar inseguro.

---

## 5. Como testar que está seguro

No site publicado, abra o DevTools → Console e tente:

```js
// 1) Forjar admin não funciona mais — não há flag de localStorage que valha.
localStorage.setItem('admin_authenticated', 'true');   // sem efeito

// 2) Tentar gravar sem sessão deve voltar 401:
fetch('/api/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'hack', content: 'x' })
}).then(r => console.log('status:', r.status));   // esperado: 401
```

Logado de verdade, tente enviar um título gigante ou um `<script>` no conteúdo: o
servidor corta o tamanho e remove o script antes de salvar.

---

## 6. Verificação em duas etapas (2FA)

Camada extra opcional: além da senha, o login passa a exigir um código de 6 dígitos
de um app autenticador (Google Authenticator, Authy, etc.). Protege a conta mesmo que
a senha vaze.

**Para ativar** (você logado no painel):

1. No Dashboard, vá na seção **🛡️ Verificação em duas etapas (2FA)** → **Ativar 2FA**.
2. Escaneie o QR code no seu app autenticador (ou digite o segredo manualmente).
3. Digite o código de 6 dígitos que o app mostrar e confirme.

A partir daí, todo login pede e-mail + senha e, em seguida, o código do app.

**Para desativar:** na mesma seção, confirme com um código atual.

**Perdeu o celular / app?** Recupere o acesso pelo terminal (precisa do `DATABASE_URL`):

```bash
npm run disable-2fa -- "seu@email.com"
```

Isso desliga o 2FA e libera o login só com a senha. Como exige acesso ao banco, é um
caminho de recuperação seguro.

> Nota técnica: o segredo do 2FA fica guardado no servidor (coluna `users.totp_secret`)
> e os códigos são validados lá — o navegador nunca decide se o código é válido.
