# API de Envio de Mensagens WhatsApp

## Endpoint

```
POST /whatsapp/sessions/:sessionId/send
```

## Parâmetros

- **sessionId** (path): ID da sessão do WhatsApp que você quer usar

## Body (JSON)

```json
{
  "to": "string",           // Número de telefone ou ID do grupo
  "type": "string",         // Tipo: "text", "image", "video", "audio", "document"
  "content": "string",      // Texto da mensagem ou legenda (opcional para mídia)
  "mediaUrl": "string",     // URL da mídia (obrigatório para image, video, audio, document)
  "fileName": "string"      // Nome do arquivo (opcional, usado para documentos)
}
```

## Exemplos de Uso

### 1. Enviar Mensagem de Texto

```bash
curl -X POST http://localhost:3000/whatsapp/sessions/minha-sessao/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999999999",
    "type": "text",
    "content": "Olá! Esta é uma mensagem de teste."
  }'
```

### 2. Enviar Imagem com Legenda

```bash
curl -X POST http://localhost:3000/whatsapp/sessions/minha-sessao/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999999999",
    "type": "image",
    "mediaUrl": "https://http2.mlstatic.com/D_Q_NP_2X_684905-MLA106055190360_022026-AB.webp",
    "content": "Tablet Lenovo Tab 10.1¨ Wifi 5 64gb 4gb De Ram Android 14 Cinza \n🔥 *Mega promoção* \n💰 De: R$1.170 por R$ 755,92 \n📉 Desconto de: 35% OFF no Pix\n👉https://mercadolivre.com/sec/2z2DNsW"
  }'
```

### 3. Enviar para Grupo

Para enviar para um grupo, você precisa do ID do grupo que termina com `@g.us`:

```bash
curl -X POST http://localhost:3000/whatsapp/sessions/minha-sessao/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "120363123456789012@g.us",
    "type": "image",
    "mediaUrl": "https://example.com/image.jpg",
    "content": "Mensagem para o grupo!"
  }'
```

### 4. Enviar Vídeo

```bash
curl -X POST http://localhost:3000/whatsapp/sessions/minha-sessao/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999999999",
    "type": "video",
    "mediaUrl": "https://example.com/video.mp4",
    "content": "Confira este vídeo incrível!"
  }'
```

### 5. Enviar Áudio

```bash
curl -X POST http://localhost:3000/whatsapp/sessions/minha-sessao/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999999999",
    "type": "audio",
    "mediaUrl": "https://example.com/audio.mp3"
  }'
```

### 6. Enviar Documento (PDF)

```bash
curl -X POST http://localhost:3000/whatsapp/sessions/minha-sessao/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999999999",
    "type": "document",
    "mediaUrl": "https://example.com/documento.pdf",
    "fileName": "Contrato.pdf",
    "content": "Segue o documento solicitado"
  }'
```

## Formatos de Destinatário

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
