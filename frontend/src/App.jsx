import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:3001';

function App() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [showSendMessageModal, setShowSendMessageModal] = useState(false);
  const [newSessionId, setNewSessionId] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [messageData, setMessageData] = useState({ phoneNumber: '', message: '' });

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 3000); // Atualizar a cada 3 segundos
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`${API_URL}/whatsapp/sessions`);
      const data = await response.json();
      if (data.success) {
        setSessions(data.data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const createSession = async () => {
    if (!newSessionId.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/whatsapp/sessions/${newSessionId}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setShowNewSessionModal(false);
        setNewSessionId('');
        fetchSessions();
      }
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setLoading(false);
    }
  };

  const disconnectSession = async (sessionId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/whatsapp/sessions/${sessionId}/disconnect`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        fetchSessions();
      }
    } catch (error) {
      console.error('Error disconnecting session:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId) => {
    if (!confirm(`Tem certeza que deseja deletar a sessão ${sessionId}?`)) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/whatsapp/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        fetchSessions();
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageData.phoneNumber || !messageData.message) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/whatsapp/sessions/${selectedSession}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
      const data = await response.json();
      if (data.success) {
        setShowSendMessageModal(false);
        setMessageData({ phoneNumber: '', message: '' });
        alert('Mensagem enviada com sucesso!');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Erro ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'connected':
        return 'status-connected';
      case 'disconnected':
        return 'status-disconnected';
      case 'connecting':
        return 'status-connecting';
      case 'qr':
        return 'status-qr';
      default:
        return 'status-disconnected';
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">💬</span>
            <span>WhatsApp Multi-Session Manager</span>
          </div>
          <button className="btn btn-primary" onClick={() => setShowNewSessionModal(true)}>
            ➕ Nova Sessão
          </button>
        </div>
      </header>

      <main className="container">
        <div className="sessions-header">
          <h2>Sessões Ativas ({sessions.length})</h2>
          <p className="text-muted">Gerencie múltiplas sessões do WhatsApp</p>
        </div>

        {sessions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📱</div>
            <h3>Nenhuma sessão criada</h3>
            <p className="text-muted">Clique em "Nova Sessão" para começar</p>
          </div>
        ) : (
          <div className="grid grid-2">
            {sessions.map((session) => (
              <div key={session.id} className="card session-card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">{session.id}</h3>
                    {session.phoneNumber && (
                      <p className="text-muted">📞 {session.phoneNumber}</p>
                    )}
                  </div>
                  <span className={`status-badge ${getStatusClass(session.status)}`}>
                    {session.status}
                  </span>
                </div>

                <div className="session-content">
                  {session.status === 'qr' && session.qr && (
                    <div className="qr-container">
                      <p className="text-center"><strong>Escaneie o QR Code</strong></p>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(session.qr)}`}
                        alt="QR Code"
                        className="qr-code"
                      />
                      <p className="text-muted text-center">Use o WhatsApp no seu celular para escanear</p>
                    </div>
                  )}

                  {session.lastConnected && (
                    <p className="text-muted">
                      🕐 Última conexão: {new Date(session.lastConnected).toLocaleString('pt-BR')}
                    </p>
                  )}
                </div>

                <div className="session-actions">
                  {session.status === 'connected' && (
                    <>
                      <button
                        className="btn btn-success"
                        onClick={() => {
                          setSelectedSession(session.id);
                          setShowSendMessageModal(true);
                        }}
                      >
                        📤 Enviar Mensagem
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => disconnectSession(session.id)}
                        disabled={loading}
                      >
                        🔌 Desconectar
                      </button>
                    </>
                  )}
                  <button
                    className="btn btn-danger"
                    onClick={() => deleteSession(session.id)}
                    disabled={loading}
                  >
                    🗑️ Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Nova Sessão */}
      {showNewSessionModal && (
        <div className="modal-overlay" onClick={() => setShowNewSessionModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nova Sessão</h3>
              <button className="modal-close" onClick={() => setShowNewSessionModal(false)}>
                ✕
              </button>
            </div>
            <div className="input-group">
              <label className="input-label">ID da Sessão</label>
              <input
                type="text"
                className="input"
                placeholder="Ex: session-1"
                value={newSessionId}
                onChange={(e) => setNewSessionId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createSession()}
              />
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-primary"
                onClick={createSession}
                disabled={loading || !newSessionId.trim()}
                style={{ flex: 1 }}
              >
                {loading ? '⏳ Criando...' : '✅ Criar Sessão'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowNewSessionModal(false)}
                style={{ flex: 1 }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Enviar Mensagem */}
      {showSendMessageModal && (
        <div className="modal-overlay" onClick={() => setShowSendMessageModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Enviar Mensagem - {selectedSession}</h3>
              <button className="modal-close" onClick={() => setShowSendMessageModal(false)}>
                ✕
              </button>
            </div>
            <div className="input-group">
              <label className="input-label">Número de Telefone</label>
              <input
                type="text"
                className="input"
                placeholder="Ex: 5511999999999"
                value={messageData.phoneNumber}
                onChange={(e) => setMessageData({ ...messageData, phoneNumber: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Mensagem</label>
              <textarea
                className="input textarea"
                placeholder="Digite sua mensagem..."
                value={messageData.message}
                onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-success"
                onClick={sendMessage}
                disabled={loading || !messageData.phoneNumber || !messageData.message}
                style={{ flex: 1 }}
              >
                {loading ? '⏳ Enviando...' : '📤 Enviar'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowSendMessageModal(false)}
                style={{ flex: 1 }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
