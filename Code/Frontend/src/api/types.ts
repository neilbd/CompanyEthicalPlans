// Backend API response types (matching backend structure)
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  timestamp: string;
  statusCode: number;
}

// Claude API content types (matching backend DocumentTypes)
export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageContent {
  type: 'image';
  source: {
    type: 'base64';
    media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    data: string;
  };
}

// Request types
export interface UploadFileRequest {
  file: File;
}

export interface AnalysisRequest {
  filePath: string;
  question: string;
}

// Response types
export interface UploadFileResponse {
  filePath: string;
}

export type ClaudeContentBlock = TextContent | ImageContent;
export type AnalysisResponse = ClaudeContentBlock[];

// Auth types
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  email: string;
}
