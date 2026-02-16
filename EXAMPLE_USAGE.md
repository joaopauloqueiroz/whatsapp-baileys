# Exemplo Prático - Envio de Imagem com Promoção

Este é um exemplo real de como enviar a mensagem que você especificou.

## Request

```bash
curl -X POST http://localhost:3000/whatsapp/sessions/testando/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511995096974",
    "type": "image",
    "mediaUrl": "https://http2.mlstatic.com/D_Q_NP_2X_684905-MLA106055190360_022026-AB.webp",
    "content": "Tablet Lenovo Tab 10.1¨ Wifi 5 64gb 4gb De Ram Android 14 Cinza \n🔥 *Mega promoção* \n💰 De: R$1.170 por R$ 755,92 \n📉 Desconto de: 35% OFF no Pix\n👉https://mercadolivre.com/sec/2z2DNsW"
  }'
```

## Usando JavaScript/Node.js

```javascript
const response = await fetch('http://localhost:3000/whatsapp/sessions/testando/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: "5511995096974",
    type: "image",
    mediaUrl: "https://http2.mlstatic.com/D_Q_NP_2X_684905-MLA106055190360_022026-AB.webp",
    content: "Tablet Lenovo Tab 10.1¨ Wifi 5 64gb 4gb De Ram Android 14 Cinza \n🔥 *Mega promoção* \n💰 De: R$1.170 por R$ 755,92 \n📉 Desconto de: 35% OFF no Pix\n👉https://mercadolivre.com/sec/2z2DNsW"
  })
});

const result = await response.json();
console.log(result);
```

## Usando Python

```python
import requests

url = "http://localhost:3000/whatsapp/sessions/testando/send"
payload = {
    "to": "5511995096974",
    "type": "image",
    "mediaUrl": "https://http2.mlstatic.com/D_Q_NP_2X_684905-MLA106055190360_022026-AB.webp",
    "content": """Tablet Lenovo Tab 10.1¨ Wifi 5 64gb 4gb De Ram Android 14 Cinza 
🔥 *Mega promoção* 
💰 De: R$1.170 por R$ 755,92 
📉 Desconto de: 35% OFF no Pix
👉https://mercadolivre.com/sec/2z2DNsW"""
}

response = requests.post(url, json=payload)
print(response.json())
```

## Resposta Esperada

```json
{
  "success": true,
  "message": "image message sent successfully"
}
```

## Múltiplas Sessões

Se você tem várias sessões configuradas, basta trocar o `sessionId` na URL:

```bash
# Sessão 1
curl -X POST http://localhost:3000/whatsapp/sessions/sessao-1/send ...

# Sessão 2
curl -X POST http://localhost:3000/whatsapp/sessions/sessao-2/send ...

# Sessão 3
curl -X POST http://localhost:3000/whatsapp/sessions/sessao-3/send ...
```

## Verificar Sessões Disponíveis

```bash
curl http://localhost:3000/whatsapp/sessions
```

Resposta:
```json
{
  "success": true,
  "data": [
    {
      "id": "testando",
      "status": "connected",
      "phoneNumber": "5511999999999",
      "lastConnected": "2026-02-08T21:19:27.000Z"
    },
    {
      "id": "sessao-2",
      "status": "connected",
      "phoneNumber": "5511888888888",
      "lastConnected": "2026-02-08T20:15:30.000Z"
    }
  ]
}
```
