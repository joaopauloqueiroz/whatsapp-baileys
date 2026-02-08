import { Injectable, Logger } from '@nestjs/common';
import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
    WASocket,
    ConnectionState,
    fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as fs from 'fs';
import * as path from 'path';

export interface SessionInfo {
    id: string;
    status: 'disconnected' | 'connecting' | 'connected' | 'qr';
    qr?: string;
    phoneNumber?: string;
    lastConnected?: Date;
}

@Injectable()
export class WhatsAppService {
    private readonly logger = new Logger(WhatsAppService.name);
    private sessions: Map<string, WASocket> = new Map();
    private sessionInfos: Map<string, SessionInfo> = new Map();
    private readonly authDir = path.join(process.cwd(), 'auth_sessions');

    constructor() {
        // Criar diretório de autenticação se não existir
        if (!fs.existsSync(this.authDir)) {
            fs.mkdirSync(this.authDir, { recursive: true });
        }
        this.logger.log('WhatsApp Service initialized');
    }

    async createSession(sessionId: string): Promise<SessionInfo> {
        if (this.sessions.has(sessionId)) {
            throw new Error(`Session ${sessionId} already exists`);
        }

        const sessionPath = path.join(this.authDir, sessionId);
        if (!fs.existsSync(sessionPath)) {
            fs.mkdirSync(sessionPath, { recursive: true });
        }

        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        const { version } = await fetchLatestBaileysVersion();

        const logger = {
            level: 'silent' as const,
            fatal: () => { },
            error: () => { },
            warn: () => { },
            info: () => { },
            debug: () => { },
            trace: () => { },
            child: () => logger,
        };

        const sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false,
            logger,
        });

        // Inicializar info da sessão
        this.sessionInfos.set(sessionId, {
            id: sessionId,
            status: 'connecting',
        });

        // Event handlers
        sock.ev.on('connection.update', async (update) => {
            await this.handleConnectionUpdate(sessionId, update);
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('messages.upsert', async ({ messages }) => {
            this.logger.log(
                `[${sessionId}] Received ${messages.length} message(s)`,
            );
            // Aqui você pode processar as mensagens recebidas
        });

        this.sessions.set(sessionId, sock);
        return this.sessionInfos.get(sessionId)!;
    }

    private async handleConnectionUpdate(
        sessionId: string,
        update: Partial<ConnectionState>,
    ) {
        const { connection, lastDisconnect, qr } = update;
        const sessionInfo = this.sessionInfos.get(sessionId);
        if (!sessionInfo) return;

        if (qr) {
            this.logger.log(`[${sessionId}] QR Code generated`);
            sessionInfo.qr = qr;
            sessionInfo.status = 'qr';
            this.sessionInfos.set(sessionId, sessionInfo);
        }

        if (connection === 'close') {
            const shouldReconnect =
                (lastDisconnect?.error as Boom)?.output?.statusCode !==
                DisconnectReason.loggedOut;

            this.logger.log(
                `[${sessionId}] Connection closed. Reconnect: ${shouldReconnect}`,
            );

            if (shouldReconnect) {
                // Remover a sessão atual antes de reconectar
                this.sessions.delete(sessionId);
                sessionInfo.status = 'connecting';
                this.sessionInfos.set(sessionId, sessionInfo);
                // Reconectar
                setTimeout(() => {
                    this.createSession(sessionId).catch((err) => {
                        this.logger.error(`[${sessionId}] Reconnection failed: ${err.message}`);
                    });
                }, 2000); // Aguardar 2 segundos antes de reconectar
            } else {
                sessionInfo.status = 'disconnected';
                sessionInfo.qr = undefined;
                this.sessionInfos.set(sessionId, sessionInfo);
                this.sessions.delete(sessionId);
            }
        } else if (connection === 'open') {
            this.logger.log(`[${sessionId}] Connection opened`);
            const sock = this.sessions.get(sessionId);
            sessionInfo.status = 'connected';
            sessionInfo.qr = undefined;
            sessionInfo.lastConnected = new Date();
            sessionInfo.phoneNumber = sock?.user?.id?.split(':')[0];
            this.sessionInfos.set(sessionId, sessionInfo);
        }
    }

    async disconnectSession(sessionId: string): Promise<void> {
        const sock = this.sessions.get(sessionId);
        if (!sock) {
            throw new Error(`Session ${sessionId} not found`);
        }

        await sock.logout();
        this.sessions.delete(sessionId);

        const sessionInfo = this.sessionInfos.get(sessionId);
        if (sessionInfo) {
            sessionInfo.status = 'disconnected';
            sessionInfo.qr = undefined;
            this.sessionInfos.set(sessionId, sessionInfo);
        }

        // Remover arquivos de autenticação
        const sessionPath = path.join(this.authDir, sessionId);
        if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, { recursive: true, force: true });
        }
    }

    async deleteSession(sessionId: string): Promise<void> {
        if (this.sessions.has(sessionId)) {
            await this.disconnectSession(sessionId);
        }

        this.sessionInfos.delete(sessionId);

        // Remover arquivos de autenticação
        const sessionPath = path.join(this.authDir, sessionId);
        if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, { recursive: true, force: true });
        }
    }

    getSession(sessionId: string): WASocket | undefined {
        return this.sessions.get(sessionId);
    }

    getSessionInfo(sessionId: string): SessionInfo | undefined {
        return this.sessionInfos.get(sessionId);
    }

    getAllSessions(): SessionInfo[] {
        return Array.from(this.sessionInfos.values());
    }

    async sendMessage(
        sessionId: string,
        to: string,
        type: 'text' | 'image' | 'video' | 'audio' | 'document',
        content?: string,
        mediaUrl?: string,
        fileName?: string,
    ): Promise<void> {
        const sock = this.sessions.get(sessionId);
        if (!sock) {
            throw new Error(`Session ${sessionId} not found or not connected`);
        }

        const sessionInfo = this.sessionInfos.get(sessionId);
        if (!sessionInfo || sessionInfo.status !== 'connected') {
            throw new Error(`Session ${sessionId} is not connected`);
        }

        // Formatar JID (suporta grupos e contatos)
        let jid: string;
        if (to.includes('@')) {
            jid = to; // Já está formatado
        } else if (to.endsWith('@g.us')) {
            jid = to; // É um grupo
        } else {
            // É um número de telefone
            jid = `${to}@s.whatsapp.net`;
        }

        try {
            switch (type) {
                case 'text':
                    if (!content) {
                        throw new Error('Content is required for text messages');
                    }
                    await sock.sendMessage(jid, { text: content });
                    break;

                case 'image':
                    if (!mediaUrl) {
                        throw new Error('Media URL is required for image messages');
                    }
                    const imageBuffer = await this.fetchMedia(mediaUrl);
                    await sock.sendMessage(jid, {
                        image: imageBuffer,
                        caption: content || '',
                    });
                    break;

                case 'video':
                    if (!mediaUrl) {
                        throw new Error('Media URL is required for video messages');
                    }
                    const videoBuffer = await this.fetchMedia(mediaUrl);
                    await sock.sendMessage(jid, {
                        video: videoBuffer,
                        caption: content || '',
                    });
                    break;

                case 'audio':
                    if (!mediaUrl) {
                        throw new Error('Media URL is required for audio messages');
                    }
                    const audioBuffer = await this.fetchMedia(mediaUrl);
                    await sock.sendMessage(jid, {
                        audio: audioBuffer,
                        mimetype: 'audio/mp4',
                    });
                    break;

                case 'document':
                    if (!mediaUrl) {
                        throw new Error('Media URL is required for document messages');
                    }
                    const docBuffer = await this.fetchMedia(mediaUrl);
                    await sock.sendMessage(jid, {
                        document: docBuffer,
                        mimetype: 'application/pdf',
                        fileName: fileName || 'document.pdf',
                        caption: content || '',
                    });
                    break;

                default:
                    throw new Error(`Unsupported message type: ${type}`);
            }

            this.logger.log(`[${sessionId}] ${type} message sent to ${to}`);
        } catch (error) {
            this.logger.error(`[${sessionId}] Error sending message: ${error.message}`);
            throw error;
        }
    }

    private async fetchMedia(url: string): Promise<Buffer> {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch media: ${response.statusText}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            return Buffer.from(arrayBuffer);
        } catch (error) {
            this.logger.error(`Error fetching media from ${url}: ${error.message}`);
            throw new Error(`Failed to download media: ${error.message}`);
        }
    }
}
