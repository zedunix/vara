import { Router } from 'express';
import { register, login, getProfile, getPendingUsers, approveUser, rejectUser, forgotPassword, resetPassword, resetPasswordDirect, verifyResetToken } from '../controllers/authController';
import { registerValidation, loginValidation } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { uploadFields } from '../middleware/upload';

const router = Router();

// Public routes
router.post('/register', uploadFields, registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-token', verifyResetToken);
router.post('/reset-password', resetPassword);
router.post('/reset-password-direct', resetPasswordDirect);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

// Admin routes - for user approval
router.get('/pending-users', authenticateToken, getPendingUsers);
router.post('/approve/:userId', authenticateToken, approveUser);
router.post('/reject/:userId', authenticateToken, rejectUser);

export default router;
