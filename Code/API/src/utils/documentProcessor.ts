import Anthropic from "@anthropic-ai/sdk";
import { ContentBlockParam } from "@anthropic-ai/sdk/resources/messages";
import fs from 'fs/promises';
import path from "path";
import dotenv from 'dotenv';

dotenv.config();

class DocumentProcessor {
    private anthropicClient: Anthropic;

    constructor(apiKey: string) {
        this.anthropicClient = new Anthropic({apiKey});
    }

    // Helper to determine media type from file extension
    private getMediaType(filePath: string): string {
        const ext = path.extname(filePath).toLowerCase();
        const mediaTypes: { [key: string]: string } = {
            '.pdf': 'application/pdf',
            '.txt': 'text/plain',
            '.csv': 'text/csv',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };
        
        return mediaTypes[ext] || 'application/octet-stream';
    }

    // Process single document
    async processDocument(filePath: string, question: string) {
        const fileBuffer = await fs.readFile(filePath);
        const base64Data = fileBuffer.toString('base64');
        const mediaType = this.getMediaType(filePath);

        const contentType = mediaType.startsWith('image/') ? 'image' : 'document';

        const content: ContentBlockParam[] = [
            {
                type: contentType as any,
                source: {
                    type: 'base64',
                    media_type: mediaType as any,
                    data: base64Data
                }
            } as any,
            {
                type: 'text',
                text: question
            }
        ];

        const message = await this.anthropicClient.messages.create({
            model: process.env.CLAUDE_VERSION as string,
            max_tokens: parseInt(process.env.MAX_TOKENS || "1024"),
            messages: [
                {
                    role: 'user',
                    content
            }]
        });

        return message.content;
    }
}

export { DocumentProcessor };
