import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess } from '../utils/responses';
import { DocumentProcessor } from '../utils/documentProcessor';
import { AppError } from '../middleware/errorHandler';
import { requireAuth } from '../middleware/requireAuth';
import { extractText } from '../utils/extractText';
import { resultStore } from '../services/resultStore';

const router = Router();
const apiKey = process.env.ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_KEY_TOKEN;
const dp = new DocumentProcessor(apiKey as string);

// Validation middleware
const validateAnalysisRequest = [
  body('filePath')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('File path is required'),
  body('question')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Question is required')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Question must be between 1 and 5000 characters')
];

// POST /api/v1/users/getanalysis
router.post('/getanalysis', requireAuth, validateAnalysisRequest, asyncHandler(async (req: Request, res: Response) => {
  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed: ' + errors.array().map(e => e.msg).join(', '), 400);
  }

  const { filePath, question } = req.body;
  const messageResponse = await dp.processDocument(filePath, question);

  // Durably persist the result for this user (best-effort; never blocks the
  // response or fails the request — see ResultStore).
  await resultStore.save({
    userId: req.session.userId as string,
    resultText: extractText(messageResponse),
  });

  sendSuccess(res, messageResponse);
}));

export default router;
