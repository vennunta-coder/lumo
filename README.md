
# LUMI — Apex (Realtime + CDN + Admin Batch)

**Inclui:**
- 🔔 Web Push (likes, comentários, novos posts) **e DMs**.
- ⚡ **Realtime SSE** (`GET /realtime/stream?token=...`) para notificações e DMs quase em tempo real.
- 🌐 **CDN**: defina `CDN_BASE_URL` para reescrever URLs de media (local e S3 via CloudFront/Cloudflare).
- 🛡️ **Admin avançado**: filtros de denúncias e **ações em lote** (`/admin/batch`).
- Tudo o core: auth, feed, perfis, uploads local/S3, DMs, métricas, PWA.

## Dev
```bash
docker compose up --build
```
- Frontend: http://localhost:8080
- API/Docs: http://localhost:4000/docs
- SSE: http://localhost:4000/realtime/stream?token=BEARER_TOKEN

## CDN
- Local: defina `CDN_BASE_URL=https://cdn.seu-dominio` (Nginx/Cloudflare apontando para `/uploads`).
- S3: use CloudFront (ou R2+CDN) e também defina `CDN_BASE_URL` — o backend devolve `publicUrl` com esse host.

## Admin (batch)
- GET `/admin/reports?source=ai&minScore=0.8`
- POST `/admin/batch` com `actions: [{type:'remove_post',id:'...'}|{type:'remove_comment',id:'...'}|{type:'ban_user',id:'...'}]`.

> Antes de produção pública: autenticar Admin com SSO/2FA, proteger `/admin/*` atrás de IP allowlist, limitar SSE por IP e ativar TLS/HTTP2 atrás de Traefik/Cloudflare.
