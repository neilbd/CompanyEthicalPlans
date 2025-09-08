import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess } from '../utils/responses';
import { DocumentProcessor } from '../utils/documentProcessor';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const dp = new DocumentProcessor(process.env.ANTHROPIC_KEY_TOKEN as string);
// POST /api/v1/users
router.post('/getanalysis', asyncHandler(async (req: Request, res: Response) => {
  // Simulate async operation
  const messageResponse = await dp.processDocument(req.body["filePath"], req.body["question"]);
  
  sendSuccess(res, messageResponse);
}));

export default router;
