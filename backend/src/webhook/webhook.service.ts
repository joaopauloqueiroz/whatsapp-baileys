import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateWebhookDto } from './dto/webhook.dto';

@Injectable()
export class WebhookService {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateWebhookDto) {
        return this.prisma.webhook.create({
            data: {
                url: data.url,
                sessionId: data.sessionId,
                events: JSON.stringify(data.events),
            },
        });
    }

    async findAll() {
        return this.prisma.webhook.findMany();
    }

    async findBySession(sessionId: string) {
        return this.prisma.webhook.findMany({
            where: { sessionId, active: true },
        });
    }

    async remove(id: string) {
        return this.prisma.webhook.delete({
            where: { id },
        });
    }
}
