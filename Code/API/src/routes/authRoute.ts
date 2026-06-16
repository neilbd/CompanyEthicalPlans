import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess } from '../utils/responses';
import { AppError } from '../middleware/errorHandler';
import { requireAuth } from '../middleware/requireAuth';
import { User, hashPassword } from '../models/User';

const router = Router();

const validateCredentials = [
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
  body('password')
    .isString()
    .isLength({ min: 8, max: 200 })
    .withMessage('Password must be at least 8 characters'),
];

const checkValidation = (req: Request): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(
      'Validation failed: ' + errors.array().map((e) => e.msg).join(', '),
      400
    );
  }
};

// Regenerate the session before associating it with a user, then persist it.
// Prevents session fixation: any pre-auth session id is discarded on login/register.
const establishSession = async (req: Request, userId: string): Promise<void> => {
  await new Promise<void>((resolve, reject) =>
    req.session.regenerate((err) => (err ? reject(err) : resolve()))
  );
  req.session.userId = userId;
  await new Promise<void>((resolve, reject) =>
    req.session.save((err) => (err ? reject(err) : resolve()))
  );
};

// POST /api/v1/auth/register
router.post(
  '/register',
  validateCredentials,
  asyncHandler(async (req: Request, res: Response) => {
    checkValidation(req);
    const { email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      throw new AppError('An account with this email already exists', 409);
    }

    const user = await User.create({
      email,
      passwordHash: await hashPassword(password),
    });

    await establishSession(req, user.id);
    sendSuccess(res, { email: user.email }, 'Account created', 201);
  })
);

// POST /api/v1/auth/login
router.post(
  '/login',
  validateCredentials,
  asyncHandler(async (req: Request, res: Response) => {
    checkValidation(req);
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }

    await establishSession(req, user.id);
    sendSuccess(res, { email: user.email }, 'Logged in');
  })
);

// POST /api/v1/auth/logout
router.post(
  '/logout',
  asyncHandler(async (req: Request, res: Response) => {
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((err) => (err ? reject(err) : resolve()));
    });
    res.clearCookie('connect.sid');
    sendSuccess(res, null, 'Logged out');
  })
);

// GET /api/v1/auth/me
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.session.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    sendSuccess(res, { email: user.email });
  })
);

export default router;
