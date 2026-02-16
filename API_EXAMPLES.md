# API do Servidor WhatsApp Baileys

## Autenticação

Todos os endpoints da API (exceto registro e login) agora são protegidos por JWT. Você deve incluir o token no cabeçalho `Authorization`.

### 1. Registro de Usuário
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "yourpassword123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "yourpassword123"
  }'
```
*Resposta:* `{"access_token": "eyJhbG..."}`

---

## Gerenciamento de Webhooks

### 1. Registrar um Webhook
Cadastra uma URL para receber eventos de uma sessão específica.
```bash
curl -X POST http://localhost:3000/webhooks \
  -H "Authorization: Bearer <SEU_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://seu-servidor.com/webhook",
    "sessionId": "minha-sessao",
    "events": ["messages.upsert"]
  }'
```

### 2. Listar Webhooks
```bash
curl -X GET http://localhost:3000/webhooks \
  -H "Authorization: Bearer <SEU_TOKEN>"
```

### 3. Excluir Webhook
```bash
curl -X DELETE http://localhost:3000/webhooks/:id \
  -H "Authorization: Bearer <SEU_TOKEN>"
```

---

## Envio de Mensagens

### Endpoint
```
POST /whatsapp/sessions/:sessionId/send
```
**Cabeçalho Obrigatório:** `Authorization: Bearer <SEU_TOKEN>`

### Parâmetros
- **sessionId** (path): ID da sessão do WhatsApp que você quer usar

### Body (JSON)
```json
{
  "to": "string",           // Número de telefone ou ID do grupo
  "type": "string",         // Tipo: "text", "image", "video", "audio", "document"
  "content": "string",      // Texto da mensagem ou legenda (opcional para mídia)
  "mediaUrl": "string",     // URL da mídia (obrigatório para image, video, audio, document)
  "fileName": "string"      // Nome do arquivo (opcional, usado para documentos)
}
```

### Exemplo de Uso
```bash
curl -X POST http://localhost:3000/whatsapp/sessions/minha-sessao/send \
  -H "Authorization: Bearer <SEU_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999999999",
    "type": "text",
    "content": "Olá! Esta é uma mensagem de teste protegida."
  }'
```

---

## Gerenciamento de Sessões

### 1. Criar/Conectar Sessão
```bash
curl -X POST http://localhost:3000/whatsapp/sessions/minha-sessao \
  -H "Authorization: Bearer <SEU_TOKEN>"
```

### 2. Listar Todas as Sessões
```bash
curl -X GET http://localhost:3000/whatsapp/sessions \
  -H "Authorization: Bearer <SEU_TOKEN>"
```

---

## Formatos de Destinatário
... (restante do arquivo mantido)

### Número de Telefone
- Formato: `5511999999999` (código do país + DDD + número)
- O sistema adiciona automaticamente `@s.whatsapp.net`

### Grupo
- Formato: `120363123456789012@g.us`
- Você precisa obter o ID do grupo através das mensagens recebidas

### JID Completo
- Se você já tem o JID completo (ex: `5511999999999@s.whatsapp.net`), pode usar diretamente

## Respostas

### Sucesso (200)
```json
{
  "success": true,
  "message": "image message sent successfully"
}
```

### Erro (400)
```json
{
  "success": false,
  "message": "Session minha-sessao not found or not connected"
}
```

## Notas Importantes

1. **Sessão Conectada**: A sessão precisa estar com status `connected` para enviar mensagens
2. **URLs de Mídia**: As URLs precisam ser públicas e acessíveis
3. **Formatos Suportados**:
   - Imagens: JPG, PNG, WEBP
   - Vídeos: MP4, AVI, MOV
   - Áudio: MP3, OGG, M4A
   - Documentos: PDF, DOC, DOCX, XLS, XLSX, etc.
4. **Grupos**: Para obter o ID de um grupo, você pode verificar as mensagens recebidas no log do backend

## Como Obter o ID de um Grupo

Quando você recebe uma mensagem de um grupo, o backend loga o ID. Procure nos logs por algo como:

```
[minha-sessao] Received 1 message(s)
```

O ID do grupo estará no formato `120363123456789012@g.us`.
