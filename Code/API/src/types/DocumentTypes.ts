// Types for different content types
interface TextContent {
  type: 'text';
  text: string;
}

interface ImageContent {
  type: 'image';
  source: {
    type: 'base64';
    media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    data: string;
  };
}

interface DocumentContent {
  type: 'document';
  source: {
    type: 'base64';
    media_type: 'application/pdf' | 'text/plain' | 'text/csv' | 'application/msword' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    data: string;
  };
}

type MessageContent = TextContent | ImageContent | DocumentContent;
