import { useState, useEffect } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [showSendMessageModal, setShowSendMessageModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [newSessionId, setNewSessionId] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [messageData, setMessageData] = useState({ phoneNumber: '', message: '' });
  const [webhooks, setWebhooks] = useState([]);
  const [newWebhook, setNewWebhook] = useState({ url: '', sessionId: '', events: ['messages.upsert'] });

  useEffect(() => {
    if (token) {
      fetchSessions();
      fetchWebhooks();
      const interval = setInterval(() => {
        fetchSessions();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const authFetch = async (url, options = {}) => {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      handleLogout();
      throw new Error('Unauthorized');
    }
    return response;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = authMode === 'login' ? 'login' : 'register';
      const response = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData),
      });
      const data = await response.json();
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
      } else if (authMode === 'register' && data.id) {
        alert('Registrado com sucesso! Agora faça login.');
        setAuthMode('login');
      } else {
        alert(data.message || 'Erro na autenticação');
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setSessions([]);
    setWebhooks([]);
  };

  const fetchSessions = async () => {
    try {
      const response = await authFetch(`${API_URL}/whatsapp/sessions`);
      const data = await response.json();
      if (data.success) {
        setSessions(data.data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchWebhooks = async () => {
    try {
      const response = await authFetch(`${API_URL}/webhooks`);
      const data = await response.json();
      setWebhooks(data || []);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
    }
  };

  const createSession = async () => {
    if (!newSessionId.trim()) return;

    setLoading(true);
    try {
      const response = await authFetch(`${API_URL}/whatsapp/sessions/${newSessionId}`, {
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
      const response = await authFetch(`${API_URL}/whatsapp/sessions/${sessionId}/disconnect`, {
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
      const response = await authFetch(`${API_URL}/whatsapp/sessions/${sessionId}`, {
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

  const createWebhook = async () => {
    if (!newWebhook.url || !newWebhook.sessionId) return;
    setLoading(true);
    try {
      const response = await authFetch(`${API_URL}/webhooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWebhook),
      });
      if (response.ok) {
        setShowWebhookModal(false);
        setNewWebhook({ url: '', sessionId: '', events: ['messages.upsert'] });
        fetchWebhooks();
      }
    } catch (error) {
      console.error('Error creating webhook:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteWebhook = async (id) => {
    if (!confirm('Excluir este webhook?')) return;
    try {
      await authFetch(`${API_URL}/webhooks/${id}`, { method: 'DELETE' });
      fetchWebhooks();
    } catch (error) {
      console.error('Error deleting webhook:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageData.phoneNumber || !messageData.message) return;

    setLoading(true);
    try {
      const response = await authFetch(`${API_URL}/whatsapp/sessions/${selectedSession}/send`, {
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

  if (!token) {
    return (
      <div className="app flex items-center justify-center" style={{ minHeight: '100vh' }}>
        <div className="card" style={{ width: '400px' }}>
          <div className="logo text-center mb-4">
            <span className="logo-icon">💬</span>
            <h2 className="mt-2">WhatsApp Manager</h2>
          </div>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label className="input-label">E-mail</label>
              <input
                type="email"
                className="input"
                required
                value={authData.email}
                onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Senha</label>
              <input
                type="password"
                className="input"
                required
                value={authData.password}
                onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
              />
            </div>
            <button className="btn btn-primary w-full" type="submit" disabled={loading}>
              {loading ? '⏳ Processando...' : authMode === 'login' ? 'Entrar' : 'Registrar'}
            </button>
            <p className="text-center mt-4">
              {authMode === 'login' ? 'Não tem conta?' : 'Já tem conta?'}
              <button
                type="button"
                className="btn-link"
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginLeft: '5px' }}
              >
                {authMode === 'login' ? 'Registre-se' : 'Faça login'}
              </button>
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">💬</span>
            <span>WhatsApp Manager</span>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={() => setShowWebhookModal(true)}>
              🔗 Webhooks
            </button>
            <button className="btn btn-primary" onClick={() => setShowNewSessionModal(true)}>
              ➕ Nova Sessão
            </button>
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
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
              <button className="modal-close" onClick={() => setShowSendMessageModal(false)}>✕</button>
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

      {/* Modal Webhooks */}
      {showWebhookModal && (
        <div className="modal-overlay" onClick={() => setShowWebhookModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Gerenciar Webhooks</h3>
              <button className="modal-close" onClick={() => setShowWebhookModal(false)}>✕</button>
            </div>

            <div className="webhook-form card mb-4">
              <h4>Novo Webhook</h4>
              <div className="grid grid-2">
                <div className="input-group">
                  <label className="input-label">URL</label>
                  <input
                    type="url"
                    className="input"
                    placeholder="https://..."
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Sessão</label>
                  <select
                    className="input"
                    value={newWebhook.sessionId}
                    onChange={(e) => setNewWebhook({ ...newWebhook, sessionId: e.target.value })}
                  >
                    <option value="">Selecione uma sessão</option>
                    {sessions.map(s => <option key={s.id} value={s.id}>{s.id}</option>)}
                  </select>
                </div>
              </div>
              <button className="btn btn-primary w-full mt-2" onClick={createWebhook} disabled={loading}>
                Adicionar Webhook
              </button>
            </div>

            <div className="webhook-list">
              <h4>Webhooks Ativos</h4>
              {webhooks.length === 0 ? (
                <p className="text-muted">Nenhum webhook cadastrado.</p>
              ) : (
                <table className="w-full text-left mt-2">
                  <thead>
                    <tr>
                      <th>URL</th>
                      <th>Sessão</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {webhooks.map(wh => (
                      <tr key={wh.id}>
                        <td>{wh.url}</td>
                        <td>{wh.sessionId}</td>
                        <td>
                          <button className="btn-icon text-danger" onClick={() => deleteWebhook(wh.id)}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
