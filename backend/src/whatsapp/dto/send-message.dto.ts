export class SendMessageDto {
    to: string; // Número de telefone ou ID do grupo
    type: 'text' | 'image' | 'video' | 'audio' | 'document';
    content?: string; // Texto da mensagem ou caption para mídia
    mediaUrl?: string; // URL da mídia (imagem, vídeo, etc.)
    fileName?: string; // Nome do arquivo (para documentos)
}
