import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { CreateWebhookDto } from './dto/webhook.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('webhooks')
@UseGuards(JwtAuthGuard)
export class WebhookController {
    constructor(private readonly webhookService: WebhookService) { }

    @Post()
    create(@Body() createWebhookDto: CreateWebhookDto) {
        return this.webhookService.create(createWebhookDto);
    }

    @Get()
    findAll() {
        return this.webhookService.findAll();
    }

    @Get('session/:sessionId')
    findBySession(@Param('sessionId') sessionId: string) {
        return this.webhookService.findBySession(sessionId);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.webhookService.remove(id);
    }
}
