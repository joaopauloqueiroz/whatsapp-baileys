import { WASocket } from '@whiskeysockets/baileys';
export interface SessionInfo {
    id: string;
    status: 'disconnected' | 'connecting' | 'connected' | 'qr';
    qr?: string;
    phoneNumber?: string;
    lastConnected?: Date;
}
export declare class WhatsAppService {
    private readonly logger;
    private sessions;
    private sessionInfos;
    private readonly authDir;
    constructor();
    createSession(sessionId: string): Promise<SessionInfo>;
    private handleConnectionUpdate;
    disconnectSession(sessionId: string): Promise<void>;
    deleteSession(sessionId: string): Promise<void>;
    getSession(sessionId: string): WASocket | undefined;
    getSessionInfo(sessionId: string): SessionInfo | undefined;
    getAllSessions(): SessionInfo[];
    sendMessage(sessionId: string, phoneNumber: string, message: string): Promise<void>;
}
