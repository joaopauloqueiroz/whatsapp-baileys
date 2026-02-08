# WhatsApp Multi-Session Manager

Sistema completo para gerenciar múltiplas sessões do WhatsApp usando a biblioteca Baileys (API não oficial do WhatsApp).

## 🚀 Tecnologias

### Backend
- **NestJS** - Framework Node.js
- **Baileys** - API não oficial do WhatsApp
- **TypeScript** - Tipagem estática

### Frontend
- **React** - Biblioteca UI
- **Vite** - Build tool
- **CSS Moderno** - Design system com tema dark e gradientes vibrantes

## 📦 Estrutura do Projeto

```
whatsapp-baileys/
├── backend/          # API NestJS
│   ├── src/
│   │   ├── whatsapp/ # Módulo WhatsApp
│   │   └── main.ts
│   └── auth_sessions/ # Sessões autenticadas (gerado automaticamente)
└── frontend/         # Interface React
    └── src/
        ├── App.jsx
        └── index.css
```

## 🔧 Instalação e Execução

### Backend

```bash
cd backend
npm install
npm run start:dev
```

O backend estará rodando em: `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend estará rodando em: `http://localhost:5173`

## 📱 Funcionalidades

### ✅ Gerenciamento de Sessões
- ➕ Criar novas sessões
- 🔌 Conectar/Desconectar sessões
- 🗑️ Deletar sessões
- 👁️ Visualizar status em tempo real

### 📲 QR Code
- Geração automática de QR Code
- Atualização em tempo real
- Interface intuitiva para escaneamento

### 💬 Envio de Mensagens
- Enviar mensagens por sessão
- Suporte a múltiplos destinatários
- Interface amigável

### 🔄 Atualizações em Tempo Real
- Polling automático a cada 3 segundos
- Status das sessões atualizado automaticamente
- Indicadores visuais de status

## 🎨 Design

Interface moderna com:
- 🌙 Tema dark premium
- 🎨 Gradientes vibrantes
- ✨ Animações suaves
- 📱 Totalmente responsivo
- 🎯 UX intuitiva

## 📡 API Endpoints

### Sessões

- `POST /whatsapp/sessions/:sessionId` - Criar nova sessão
- `GET /whatsapp/sessions` - Listar todas as sessões
- `GET /whatsapp/sessions/:sessionId` - Obter detalhes de uma sessão
- `DELETE /whatsapp/sessions/:sessionId/disconnect` - Desconectar sessão
- `DELETE /whatsapp/sessions/:sessionId` - Deletar sessão

### Mensagens

- `POST /whatsapp/sessions/:sessionId/send` - Enviar mensagem
  ```json
  {
    "phoneNumber": "5511999999999",
    "message": "Sua mensagem aqui"
  }
  ```

## 🔐 Status das Sessões

- **connected** 🟢 - Sessão conectada e pronta
- **disconnected** 🔴 - Sessão desconectada
- **connecting** 🔵 - Conectando...
- **qr** 🟡 - Aguardando escaneamento do QR Code

## 💡 Como Usar

1. **Inicie o backend e frontend** seguindo as instruções acima
2. **Acesse** `http://localhost:5173` no navegador
3. **Clique em "Nova Sessão"** e escolha um ID
4. **Escaneie o QR Code** com seu WhatsApp
5. **Aguarde a conexão** - o status mudará para "connected"
6. **Envie mensagens** clicando em "Enviar Mensagem"

## ⚠️ Avisos Importantes

- Esta é uma API **não oficial** do WhatsApp
- Use por sua conta e risco
- O WhatsApp pode banir contas que usam APIs não oficiais
- Recomendado apenas para testes e desenvolvimento
- Não use em produção com contas importantes

## 🛠️ Desenvolvimento

### Adicionar Novos Recursos

O código está organizado de forma modular:

- **Backend**: Adicione novos endpoints em `whatsapp.controller.ts`
- **Frontend**: Adicione novos componentes em `src/components/`

### Personalizar Design

Todas as variáveis de design estão em `frontend/src/index.css`:
- Cores
- Gradientes
- Espaçamentos
- Animações

## 📝 Licença

MIT

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.
