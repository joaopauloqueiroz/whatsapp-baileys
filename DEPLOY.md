# Deploy para Produção com Traefik

Este guia explica como fazer o deploy da aplicação WhatsApp Baileys em produção usando Docker e Traefik.

## Pré-requisitos

- Docker e Docker Compose instalados no servidor
- Traefik já configurado e rodando na rede `traefik-public`
- Domínios configurados:
  - `api-baileys.archcode.space` → Backend
  - `baileys.archcode.space` → Frontend

## Configuração

### 1. Configurar variáveis de ambiente

Copie o arquivo de exemplo e edite conforme necessário:

```bash
cp .env.production.example .env.production
```

Edite `.env.production` com suas configurações.

### 2. Ajustar domínios no docker-compose.traefik.yml

Verifique se os domínios nos labels do Traefik estão corretos:

- Backend: `api-baileys.archcode.space`
- Frontend: `baileys.archcode.space`

### 3. Portas utilizadas

- **Backend**: 3010 (interna ao container)
- **Frontend**: 3011 (interna ao container)

Essas portas foram escolhidas para evitar conflitos com outros serviços. O Traefik fará o roteamento externo via HTTPS.

## Deploy

### Build e inicialização

```bash
# Build das imagens
docker compose -f docker-compose.traefik.yml build

# Subir os serviços
docker compose -f docker-compose.traefik.yml up -d
```

### Verificar logs

```bash
# Logs do backend
docker compose -f docker-compose.traefik.yml logs -f backend

# Logs do frontend
docker compose -f docker-compose.traefik.yml logs -f frontend
```

### Verificar status

```bash
docker compose -f docker-compose.traefik.yml ps
```

## Estrutura de volumes

- `./backend/auth_sessions` → Sessões do WhatsApp (persistidas)
- `./logs/backend` → Logs da aplicação

## Healthchecks

Ambos os serviços possuem healthchecks configurados:

- **Backend**: `http://localhost:3010` (verificado via wget)
- **Frontend**: `http://localhost:3011` (verificado via wget)

## Atualização

Para atualizar a aplicação:

```bash
# Pull das últimas alterações
git pull

# Rebuild e restart
docker compose -f docker-compose.traefik.yml up -d --build
```

## Troubleshooting

### Ver QR Code do WhatsApp

O QR Code será exibido nos logs do backend:

```bash
docker compose -f docker-compose.traefik.yml logs backend | grep -A 20 "QR Code"
```

### Limpar sessões

Se precisar resetar as sessões do WhatsApp:

```bash
rm -rf backend/auth_sessions/*
docker compose -f docker-compose.traefik.yml restart backend
```

### Verificar conectividade com Traefik

```bash
# Verificar se os containers estão na rede traefik-public
docker network inspect traefik-public
```

## Segurança

- ✅ HTTPS automático via Traefik + Let's Encrypt
- ✅ Headers de segurança configurados no frontend
- ✅ CORS configurado no backend
- ✅ Multi-stage builds para imagens otimizadas
- ✅ Apenas dependências de produção nas imagens finais

## Monitoramento

Acesse os endpoints de health:

- Backend: `https://api-baileys.archcode.space/` (deve retornar "Hello World!")
- Frontend: `https://baileys.archcode.space/health` (deve retornar "healthy")
