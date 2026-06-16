import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess } from '../utils/responses';
import { AppError } from '../middleware/errorHandler';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads')); // Temp storage
  },
  filename: (_req, file, cb) => {
    // Derive the stored name purely from a random suffix + sanitized extension.
    // Never trust file.originalname, which may contain path separators (../) or NULs.
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    const safeBase = path.basename(file.originalname).replace(/[^A-Za-z0-9._-]/g, '_');
    const ext = path.extname(safeBase).slice(0, 10);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'text/csv',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
        )
      );
    }
  },
});

router.post(
  '/upload',
  requireAuth,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    // Normalize file path to use forward slashes (works on both Windows and Unix)
    const normalizedPath = req.file.path.replace(/\\/g, '/');

    sendSuccess(res, { filePath: normalizedPath }, 'File uploaded successfully');
  })
);

export default router;
