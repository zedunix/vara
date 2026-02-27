import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// ============================================
// Accounts Routes - REMOVED
// All account-related income/expense logic has been moved to admin routes
// ============================================

// Placeholder route
router.get('/status', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Accounts module is disabled' });
});

export default router;
