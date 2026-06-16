import { Router } from 'express';
import claudeRoutes from './claudeRoute';
import uploadRoutes from './uploadRoute';
import authRoutes from './authRoute';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', claudeRoutes);
router.use('/users', uploadRoutes);

// API info endpoint
router.get('/', (_req, res) => {
  res.json({
    message: 'API Server v1.0',
    version: '1.0.0',
    endpoints: {
      auth: '/auth/register | /auth/login | /auth/logout | /auth/me',
      upload: '/users/upload',
      analysis: '/users/getanalysis'
    },
    documentation: 'Add your API documentation URL here',
  });
});

export default router;
