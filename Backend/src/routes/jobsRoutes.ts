import { Router, Request, Response } from 'express';
import * as jobsService from '../services/jobsService';

const router = Router();

// ============ Public Job Routes (Read-Only) ============

// GET: Get all published jobs
router.get('/', async (req: Request, res: Response) => {
  try {
    const jobs = await jobsService.getPublishedJobs();
    res.json({ 
      success: true, 
      data: jobs,
      count: jobs?.length || 0
    });
  } catch (error: any) {
    console.error('❌ Error in GET /api/jobs:', {
      message: error.message,
      error: error.toString(),
      stack: error.stack,
    });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch jobs',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
});

// GET: Get single published job by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const job = await jobsService.getPublishedJobById(id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, data: job });
  } catch (error: any) {
    console.error(`❌ Error in GET /api/jobs/${req.params.id}:`, {
      message: error.message,
      error: error.toString(),
      stack: error.stack,
    });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch job',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
});

export default router;
