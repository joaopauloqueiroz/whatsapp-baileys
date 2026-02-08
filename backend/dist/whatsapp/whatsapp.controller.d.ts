import { WhatsAppService } from './whatsapp.service';
export declare class WhatsAppController {
    private readonly whatsappService;
    constructor(whatsappService: WhatsAppService);
    createSession(sessionId: string): Promise<{
        success: boolean;
        data: import("./whatsapp.service").SessionInfo;
    }>;
    getAllSessions(): {
        success: boolean;
        data: import("./whatsapp.service").SessionInfo[];
    };
    getSession(sessionId: string): {
        success: boolean;
        data: import("./whatsapp.service").SessionInfo;
    };
    disconnectSession(sessionId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteSession(sessionId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    sendMessage(sessionId: string, body: {
        phoneNumber: string;
        message: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
