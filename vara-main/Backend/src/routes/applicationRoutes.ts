import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as applicationService from '../services/applicationService';

const router = Router();

// Get all applications (Admin only)
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const userId = req.user?.userId;
    const applications = await applicationService.getAllApplications(status as string, userId);
    res.json({ success: true, data: applications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get pending applications (Admin only)
router.get('/pending', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const applications = await applicationService.getPendingApplications(userId);
    res.json({ success: true, data: applications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get application by ID
router.get('/:applicationId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;
    const application = await applicationService.getApplicationById(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    res.json({ success: true, data: application });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit new application (Public)
router.post('/', async (req: Request, res: Response) => {
  try {
    const application = await applicationService.createApplication(req.body);
    res.status(201).json({ success: true, data: application, message: 'Application submitted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Approve application (Admin only)
router.post('/:applicationId/approve', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;
    const reviewerId = req.user?.userId;
    if (!reviewerId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const result = await applicationService.approveApplication(applicationId, reviewerId);
    res.json({ success: true, data: result, message: 'Application approved successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reject application (Admin only)
router.post('/:applicationId/reject', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;
    const { reason } = req.body;
    const reviewerId = req.user?.userId;
    if (!reviewerId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const application = await applicationService.rejectApplication(applicationId, reviewerId, reason);
    res.json({ success: true, data: application, message: 'Application rejected' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
