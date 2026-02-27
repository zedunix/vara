import { Router, Request, Response } from 'express';
import * as adminService from '../services/adminService';

const router = Router();

// ============ Public Announcement Routes (Read-Only) ============

// GET: Get all published announcements
router.get('/announcements', async (req: Request, res: Response) => {
  try {
    const announcements = await adminService.getPublishedAnnouncements();
    res.json({ 
      success: true, 
      data: announcements,
      count: announcements?.length || 0
    });
  } catch (error: any) {
    console.error('❌ Error in GET /api/public/announcements:', {
      message: error.message,
      error: error.toString(),
      stack: error.stack,
    });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch announcements',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
});

// GET: Get single published announcement by ID
router.get('/announcements/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const announcement = await adminService.getPublishedAnnouncementById(id);

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    res.json({ success: true, data: announcement });
  } catch (error: any) {
    console.error(`❌ Error in GET /api/public/announcements/${req.params.id}:`, {
      message: error.message,
      error: error.toString(),
      stack: error.stack,
    });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch announcement',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
});

// GET: Get all admins (for registration dropdown)
router.get('/admins', async (req: Request, res: Response) => {
  try {
    const admins = await adminService.getAllAdmins();
    res.json({ 
      success: true, 
      data: admins,
      count: admins?.length || 0
    });
  } catch (error: any) {
    console.error('❌ Error in GET /api/public/admins:', {
      message: error.message,
      error: error.toString(),
      stack: error.stack,
    });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch admins',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
});

export default router;
