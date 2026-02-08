"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WhatsAppService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
const common_1 = require("@nestjs/common");
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let WhatsAppService = WhatsAppService_1 = class WhatsAppService {
    logger = new common_1.Logger(WhatsAppService_1.name);
    sessions = new Map();
    sessionInfos = new Map();
    authDir = path.join(process.cwd(), 'auth_sessions');
    constructor() {
        if (!fs.existsSync(this.authDir)) {
            fs.mkdirSync(this.authDir, { recursive: true });
        }
        this.logger.log('WhatsApp Service initialized');
    }
    async createSession(sessionId) {
        if (this.sessions.has(sessionId)) {
            throw new Error(`Session ${sessionId} already exists`);
        }
        const sessionPath = path.join(this.authDir, sessionId);
        if (!fs.existsSync(sessionPath)) {
            fs.mkdirSync(sessionPath, { recursive: true });
        }
        const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(sessionPath);
        const { version } = await (0, baileys_1.fetchLatestBaileysVersion)();
        const logger = {
            level: 'silent',
            fatal: () => { },
            error: () => { },
            warn: () => { },
            info: () => { },
            debug: () => { },
            trace: () => { },
            child: () => logger,
        };
        const sock = (0, baileys_1.default)({
            version,
            auth: state,
            printQRInTerminal: false,
            logger,
        });
        this.sessionInfos.set(sessionId, {
            id: sessionId,
            status: 'connecting',
        });
        sock.ev.on('connection.update', async (update) => {
            await this.handleConnectionUpdate(sessionId, update);
        });
        sock.ev.on('creds.update', saveCreds);
        sock.ev.on('messages.upsert', async ({ messages }) => {
            this.logger.log(`[${sessionId}] Received ${messages.length} message(s)`);
        });
        this.sessions.set(sessionId, sock);
        return this.sessionInfos.get(sessionId);
    }
    async handleConnectionUpdate(sessionId, update) {
        const { connection, lastDisconnect, qr } = update;
        const sessionInfo = this.sessionInfos.get(sessionId);
        if (!sessionInfo)
            return;
        if (qr) {
            this.logger.log(`[${sessionId}] QR Code generated`);
            sessionInfo.qr = qr;
            sessionInfo.status = 'qr';
            this.sessionInfos.set(sessionId, sessionInfo);
        }
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !==
                baileys_1.DisconnectReason.loggedOut;
            this.logger.log(`[${sessionId}] Connection closed. Reconnect: ${shouldReconnect}`);
            if (shouldReconnect) {
                this.sessions.delete(sessionId);
                sessionInfo.status = 'connecting';
                this.sessionInfos.set(sessionId, sessionInfo);
                setTimeout(() => {
                    this.createSession(sessionId).catch((err) => {
                        this.logger.error(`[${sessionId}] Reconnection failed: ${err.message}`);
                    });
                }, 2000);
            }
            else {
                sessionInfo.status = 'disconnected';
                sessionInfo.qr = undefined;
                this.sessionInfos.set(sessionId, sessionInfo);
                this.sessions.delete(sessionId);
            }
        }
        else if (connection === 'open') {
            this.logger.log(`[${sessionId}] Connection opened`);
            const sock = this.sessions.get(sessionId);
            sessionInfo.status = 'connected';
            sessionInfo.qr = undefined;
            sessionInfo.lastConnected = new Date();
            sessionInfo.phoneNumber = sock?.user?.id?.split(':')[0];
            this.sessionInfos.set(sessionId, sessionInfo);
        }
    }
    async disconnectSession(sessionId) {
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
        const sessionPath = path.join(this.authDir, sessionId);
        if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, { recursive: true, force: true });
        }
    }
    async deleteSession(sessionId) {
        if (this.sessions.has(sessionId)) {
            await this.disconnectSession(sessionId);
        }
        this.sessionInfos.delete(sessionId);
        const sessionPath = path.join(this.authDir, sessionId);
        if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, { recursive: true, force: true });
        }
    }
    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }
    getSessionInfo(sessionId) {
        return this.sessionInfos.get(sessionId);
    }
    getAllSessions() {
        return Array.from(this.sessionInfos.values());
    }
    async sendMessage(sessionId, phoneNumber, message) {
        const sock = this.sessions.get(sessionId);
        if (!sock) {
            throw new Error(`Session ${sessionId} not found or not connected`);
        }
        const sessionInfo = this.sessionInfos.get(sessionId);
        if (!sessionInfo || sessionInfo.status !== 'connected') {
            throw new Error(`Session ${sessionId} is not connected`);
        }
        const jid = phoneNumber.includes('@')
            ? phoneNumber
            : `${phoneNumber}@s.whatsapp.net`;
        await sock.sendMessage(jid, { text: message });
        this.logger.log(`[${sessionId}] Message sent to ${phoneNumber}`);
    }
};
exports.WhatsAppService = WhatsAppService;
exports.WhatsAppService = WhatsAppService = WhatsAppService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], WhatsAppService);
//# sourceMappingURL=whatsapp.service.js.map