# Rede Social Minimalista (MVP)

Feed vertical de vídeos curtos com ❤️ 💬 🔗, barra lateral com ícones e navegação por deslize. Monorepo com **mobile (Expo/React Native)** e **backend (Express/Prisma/Postgres + MinIO/S3)**.

---

## ✅ Passo a passo (rodar localmente)

1. **Pré-requisitos**
   - Node 20+
   - Docker + Docker Compose
   - Git

2. **Clonar e configurar env**
   ```bash
   cp apps/server/.env.example apps/server/.env
   ```

3. **Subir infraestrutura + API**
   ```bash
   docker compose up -d --build
   ```

4. **Migrar banco e popular seed**
   ```bash
   cd apps/server
   npx prisma migrate dev --name init
   node ../../scripts/seed.ts
   cd ../..
   ```

5. **Rodar o app mobile (Expo)**
   ```bash
   cd apps/mobile
   npm install
   npm start
   # Abrir no iOS/Android com Expo Go ou simulador
   ```

---

## 📦 Estrutura
- `apps/server` — API (Node/Express/TypeScript) + Prisma + PostgreSQL + MinIO/S3
- `apps/mobile` — App mobile (Expo/React Native) com feed vertical, curtida, comentários (modal) e compartilhamento
- `scripts/` — utilitários (seed, dev.sh, push.sh)
- `.github/workflows/ci.yml` — CI simples de typecheck

---

## 🧪 Endpoints (MVP)
1. `POST /api/auth/register` — body `{ username, password }` → `{ token }`
2. `POST /api/auth/login` — body `{ username, password }` → `{ token }`
3. `GET /api/videos?cursor=<id>&take=20` — paginação por cursor
4. `POST /api/videos` — **auth**, `multipart/form-data` com `file`, `caption`
5. `POST /api/videos/:id/like` — **auth**
6. `POST /api/videos/:id/comment` — **auth**, body `{ text }`
7. `GET /api/videos/:id/comments` — lista comentários

---

## 🚀 Scripts úteis
- `./scripts/dev.sh` — Sobe Docker, migra e roda seed automaticamente.
- `./scripts/push.sh <user> <repo>` — Configura `origin` e faz o primeiro `push`.

## 📄 Licença
MIT
