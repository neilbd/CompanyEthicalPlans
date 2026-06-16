import Anthropic from "@anthropic-ai/sdk";
import { ContentBlockParam, ImageBlockParam, DocumentBlockParam, TextBlockParam } from "@anthropic-ai/sdk/resources/messages";
import fs from 'fs/promises';
import path from "path";
import { AppError } from '../middleware/errorHandler';

class DocumentProcessor {
    private anthropicClient: Anthropic;
    private uploadsDir: string;

    constructor(apiKey: string) {
        this.anthropicClient = new Anthropic({apiKey});
        this.uploadsDir = path.resolve(__dirname, '../../uploads');
    }

    // Validate that file path is within uploads directory
    private validateFilePath(filePath: string): void {
        const resolvedPath = path.resolve(filePath);
        if (!resolvedPath.startsWith(this.uploadsDir)) {
            throw new AppError('Invalid file path: access denied', 403);
        }
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
        try {
            // Validate file path is within uploads directory
            this.validateFilePath(filePath);

            // Read file
            const fileBuffer = await fs.readFile(filePath);
            const mediaType = this.getMediaType(filePath);

            let content: ContentBlockParam[] = [];

            // Handle text files differently - send as text content
            if (mediaType === 'text/plain' || mediaType === 'text/csv') {
                const textContent = fileBuffer.toString('utf-8');
                content = [
                    {
                        type: 'text',
                        text: `Here is the document content:\n\n${textContent}\n\nQuestion: ${question}`
                    } as TextBlockParam
                ];
            } else {
                // For PDFs and images, send as base64
                const base64Data = fileBuffer.toString('base64');

                if (mediaType.startsWith('image/')) {
                    content = [
                        {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                                data: base64Data
                            }
                        } as ImageBlockParam,
                        {
                            type: 'text',
                            text: question
                        } as TextBlockParam
                    ];
                } else {
                    content = [
                        {
                            type: 'document',
                            source: {
                                type: 'base64',
                                media_type: mediaType as 'application/pdf',
                                data: base64Data
                            }
                        } as DocumentBlockParam,
                        {
                            type: 'text',
                            text: question
                        } as TextBlockParam
                    ];
                }
            }

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
        } catch (error: any) {
            // Handle file system errors
            if (error.code === 'ENOENT') {
                throw new AppError('File not found', 404);
            }
            if (error.code === 'EACCES') {
                throw new AppError('File access denied', 403);
            }

            // Re-throw AppError instances
            if (error instanceof AppError) {
                throw error;
            }

            // Re-throw other errors
            throw error;
        }
    }
}

export { DocumentProcessor };
