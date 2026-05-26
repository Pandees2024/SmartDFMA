import { Router } from 'express';
import authRoutes from './v1/auth.routes';
import entityRoutes from './v1/entity.routes';
import ppvcTransactionRoutes from './v1/ppvc-transaction.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount all route groups
router.use('/', authRoutes);
router.use('/', entityRoutes);
router.use('/', ppvcTransactionRoutes);

export default router;
