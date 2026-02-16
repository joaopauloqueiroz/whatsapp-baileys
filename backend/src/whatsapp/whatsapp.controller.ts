import {
    Controller,
    Post,
    Get,
    Delete,
    Param,
    Body,
    HttpException,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('whatsapp')
@UseGuards(JwtAuthGuard)
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
        @Body() body: any, // Accept both old and new formats
    ) {
        try {
            // Support legacy format (phoneNumber, message) and new format (to, type, content, mediaUrl)
            let to: string;
            let type: 'text' | 'image' | 'video' | 'audio' | 'document';
            let content: string | undefined;
            let mediaUrl: string | undefined;
            let fileName: string | undefined;

            // Check if it's the old format
            if (body.phoneNumber && body.message) {
                // Legacy format
                to = body.phoneNumber;
                type = 'text';
                content = body.message;
            } else if (body.to && body.type) {
                // New format
                to = body.to;
                type = body.type;
                content = body.content;
                mediaUrl = body.mediaUrl;
                fileName = body.fileName;
            } else {
                throw new Error('Invalid request format. Use either {phoneNumber, message} or {to, type, content, mediaUrl}');
            }

            await this.whatsappService.sendMessage(
                sessionId,
                to,
                type,
                content,
                mediaUrl,
                fileName,
            );
            return {
                success: true,
                message: `${type} message sent successfully`,
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
