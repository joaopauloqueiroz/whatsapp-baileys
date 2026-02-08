import {
    Controller,
    Post,
    Get,
    Delete,
    Param,
    Body,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsAppController {
    constructor(private readonly whatsappService: WhatsAppService) { }

    @Post('sessions/:sessionId')
    async createSession(@Param('sessionId') sessionId: string) {
        try {
            const session = await this.whatsappService.createSession(sessionId);
            return {
                success: true,
                data: session,
            };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: error.message,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('sessions')
    getAllSessions() {
        const sessions = this.whatsappService.getAllSessions();
        return {
            success: true,
            data: sessions,
        };
    }

    @Get('sessions/:sessionId')
    getSession(@Param('sessionId') sessionId: string) {
        const session = this.whatsappService.getSessionInfo(sessionId);
        if (!session) {
            throw new HttpException(
                {
                    success: false,
                    message: 'Session not found',
                },
                HttpStatus.NOT_FOUND,
            );
        }
        return {
            success: true,
            data: session,
        };
    }

    @Delete('sessions/:sessionId/disconnect')
    async disconnectSession(@Param('sessionId') sessionId: string) {
        try {
            await this.whatsappService.disconnectSession(sessionId);
            return {
                success: true,
                message: 'Session disconnected successfully',
            };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: error.message,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Delete('sessions/:sessionId')
    async deleteSession(@Param('sessionId') sessionId: string) {
        try {
            await this.whatsappService.deleteSession(sessionId);
            return {
                success: true,
                message: 'Session deleted successfully',
            };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: error.message,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post('sessions/:sessionId/send')
    async sendMessage(
        @Param('sessionId') sessionId: string,
        @Body() body: { to: string; type: 'text' | 'image' | 'video' | 'audio' | 'document'; content?: string; mediaUrl?: string; fileName?: string },
    ) {
        try {
            await this.whatsappService.sendMessage(
                sessionId,
                body.to,
                body.type,
                body.content,
                body.mediaUrl,
                body.fileName,
            );
            return {
                success: true,
                message: `${body.type} message sent successfully`,
            };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: error.message,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }
}
