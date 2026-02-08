"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppController = void 0;
const common_1 = require("@nestjs/common");
const whatsapp_service_1 = require("./whatsapp.service");
let WhatsAppController = class WhatsAppController {
    whatsappService;
    constructor(whatsappService) {
        this.whatsappService = whatsappService;
    }
    async createSession(sessionId) {
        try {
            const session = await this.whatsappService.createSession(sessionId);
            return {
                success: true,
                data: session,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    getAllSessions() {
        const sessions = this.whatsappService.getAllSessions();
        return {
            success: true,
            data: sessions,
        };
    }
    getSession(sessionId) {
        const session = this.whatsappService.getSessionInfo(sessionId);
        if (!session) {
            throw new common_1.HttpException({
                success: false,
                message: 'Session not found',
            }, common_1.HttpStatus.NOT_FOUND);
        }
        return {
            success: true,
            data: session,
        };
    }
    async disconnectSession(sessionId) {
        try {
            await this.whatsappService.disconnectSession(sessionId);
            return {
                success: true,
                message: 'Session disconnected successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async deleteSession(sessionId) {
        try {
            await this.whatsappService.deleteSession(sessionId);
            return {
                success: true,
                message: 'Session deleted successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async sendMessage(sessionId, body) {
        try {
            await this.whatsappService.sendMessage(sessionId, body.phoneNumber, body.message);
            return {
                success: true,
                message: 'Message sent successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.WhatsAppController = WhatsAppController;
__decorate([
    (0, common_1.Post)('sessions/:sessionId'),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "createSession", null);
__decorate([
    (0, common_1.Get)('sessions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WhatsAppController.prototype, "getAllSessions", null);
__decorate([
    (0, common_1.Get)('sessions/:sessionId'),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WhatsAppController.prototype, "getSession", null);
__decorate([
    (0, common_1.Delete)('sessions/:sessionId/disconnect'),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "disconnectSession", null);
__decorate([
    (0, common_1.Delete)('sessions/:sessionId'),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "deleteSession", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/send'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "sendMessage", null);
exports.WhatsAppController = WhatsAppController = __decorate([
    (0, common_1.Controller)('whatsapp'),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsAppService])
], WhatsAppController);
//# sourceMappingURL=whatsapp.controller.js.map