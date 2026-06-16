export const FILE_CONSTRAINTS = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ] as const,
  ALLOWED_EXTENSIONS: [
    '.pdf',
    '.txt',
    '.csv',
    '.doc',
    '.docx',
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
  ] as const,
} as const;

export type AllowedMimeType = typeof FILE_CONSTRAINTS.ALLOWED_TYPES[number];
export type AllowedExtension = typeof FILE_CONSTRAINTS.ALLOWED_EXTENSIONS[number];

export const API_CONFIG = {
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100,
} as const;
