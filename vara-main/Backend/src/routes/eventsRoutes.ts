import { Router, Request, Response } from 'express';
import * as eventsService from '../services/eventsService';
import * as adminService from '../services/adminService';

const router = Router();

// ============ Public Event Routes (Read-Only) ============

// GET: Get all published announcements (must be before /:id route)
router.get('/announcements', async (req: Request, res: Response) => {
  try {
    const announcements = await adminService.getPublishedAnnouncements();
    res.json({ 
      success: true, 
      data: announcements,
      count: announcements?.length || 0
    });
  } catch (error: any) {
    console.error('❌ Error in GET /api/events/announcements:', {
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

// GET: Get all published events
router.get('/', async (req: Request, res: Response) => {
  try {
    const events = await eventsService.getPublishedEvents();
    res.json({ 
      success: true, 
      data: events,
      count: events?.length || 0
    });
  } catch (error: any) {
    console.error('❌ Error in GET /api/events:', {
      message: error.message,
      error: error.toString(),
      stack: error.stack,
    });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch events',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
});

// GET: Get single published event by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await eventsService.getPublishedEventById(id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, data: event });
  } catch (error: any) {
    console.error(`❌ Error in GET /api/events/${req.params.id}:`, {
      message: error.message,
      error: error.toString(),
      stack: error.stack,
    });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch event',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
});

export default router;
