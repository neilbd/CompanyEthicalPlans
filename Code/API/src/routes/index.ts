import { Router } from 'express';
import claudeRoutes from './claudeRoute';

const router = Router();

// Mount route modules
router.use('/users', claudeRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'API Server v1.0',
    version: '1.0.0',
    endpoints: {
      claudeRoute: '/getanalysis'
    },
    documentation: 'Add your API documentation URL here',
  });
});

export default router;
