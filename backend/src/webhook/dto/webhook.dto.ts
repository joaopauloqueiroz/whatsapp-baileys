import { IsUrl, IsNotEmpty, IsArray, IsString } from 'class-validator';

export class CreateWebhookDto {
    @IsUrl()
    url: string;

    @IsString()
    @IsNotEmpty()
    sessionId: string;

    @IsArray()
    events: string[];
}
