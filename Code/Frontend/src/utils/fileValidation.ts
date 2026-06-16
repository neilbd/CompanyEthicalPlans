import { FILE_CONSTRAINTS } from './constants';
import type { AllowedMimeType, AllowedExtension } from './constants';

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

const isAllowedMimeType = (type: string): type is AllowedMimeType => {
  return (FILE_CONSTRAINTS.ALLOWED_TYPES as readonly string[]).includes(type);
};

const isAllowedExtension = (ext: string): ext is AllowedExtension => {
  return (FILE_CONSTRAINTS.ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
};

export const validateFile = (file: File): FileValidationResult => {
  // Check file size
  if (file.size > FILE_CONSTRAINTS.MAX_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File size must be less than ${FILE_CONSTRAINTS.MAX_SIZE_MB}MB`,
    };
  }

  // Check file type
  if (!isAllowedMimeType(file.type)) {
    const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!ext || !isAllowedExtension(ext)) {
      return {
        isValid: false,
        error: `File type not supported. Allowed: ${FILE_CONSTRAINTS.ALLOWED_EXTENSIONS.join(', ')}`,
      };
    }
  }

  return { isValid: true };
};
