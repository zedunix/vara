import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as adminService from '../services/adminService';
import * as eventsService from '../services/eventsService';
import * as jobsService from '../services/jobsService';
import { supabaseAdmin } from '../config/supabase';
import { upload } from '../middleware/upload';
import { uploadToSupabase } from '../utils/fileUpload';

const router = Router();

// ============ Dashboard Stats ============

// Get dashboard stats
router.get('/dashboard/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Admin Profile ============

// Get current admin profile
router.get('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const profile = await adminService.getAdminProfile(userId);
    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update admin profile
router.put('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const profile = await adminService.upsertAdminProfile({ ...req.body, user_id: userId });
    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Board Members ============

// Get all board members
router.get('/board-members', authenticateToken, async (req: Request, res: Response) => {
  try {
    const members = await adminService.getAllBoardMembers();
    res.json({ success: true, data: members });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get board member by ID
router.get('/board-members/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const member = await adminService.getBoardMemberById(id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Board member not found' });
    }
    res.json({ success: true, data: member });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create board member
router.post('/board-members', authenticateToken, async (req: Request, res: Response) => {
  try {
    const member = await adminService.createBoardMember(req.body);
    res.status(201).json({ success: true, data: member });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update board member
router.put('/board-members/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const member = await adminService.updateBoardMember(id, req.body);
    res.json({ success: true, data: member });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete board member
router.delete('/board-members/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await adminService.deleteBoardMember(id);
    res.json({ success: true, message: 'Board member removed successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Admin Role Assignment ============

// Search users by email
router.get('/search-users', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Email parameter is required' });
    }

    // Search in users table
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role')
      .ilike('email', `%${email}%`)
      .limit(1);

    if (error) {
      console.error('❌ Error searching users:', error);
      return res.status(500).json({ success: false, message: 'Error searching for user' });
    }

    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];

    res.json({ 
      success: true, 
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        currentRole: user.role
      }
    });
  } catch (error: any) {
    console.error('❌ Search users error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Assign admin role to user
router.post('/assign-role', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ success: false, message: 'userId and role are required' });
    }

    if (!['admin', 'superadmin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be admin or superadmin' });
    }

    // Update user role in database
    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select();

    if (error) {
      console.error('❌ Error updating user role:', error);
      return res.status(500).json({ success: false, message: 'Error updating user role' });
    }

    if (!updatedUser || updatedUser.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ 
      success: true, 
      message: `User assigned as ${role}`,
      data: {
        id: updatedUser[0].id,
        name: updatedUser[0].name,
        email: updatedUser[0].email,
        role: updatedUser[0].role
      }
    });
  } catch (error: any) {
    console.error('❌ Assign role error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user role (alternative endpoint)
router.put('/users/:userId/role', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['admin', 'superadmin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be admin or superadmin' });
    }

    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select();

    if (error) {
      console.error('❌ Error updating user role:', error);
      return res.status(500).json({ success: false, message: 'Error updating user role' });
    }

    if (!updatedUser || updatedUser.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ 
      success: true, 
      message: 'User role updated',
      data: updatedUser[0]
    });
  } catch (error: any) {
    console.error('❌ Update role error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Activity Logs ============

// Get activity logs
router.get('/activity-logs', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const logs = await adminService.getActivityLogs(Number(limit), Number(offset));
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Income Records ============

// Get all income records
router.get('/income-records', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { status, source, startDate, endDate, limit, offset } = req.query;
    const filters = {
      status: status as 'received' | 'pending' | undefined,
      source: source as string | undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    };
    const records = await adminService.getIncomeRecords(filters);
    res.json({ success: true, data: records });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get income record by ID
router.get('/income-records/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const record = await adminService.getIncomeRecordById(id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Income record not found' });
    }
    res.json({ success: true, data: record });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create income record
router.post('/income-records', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    // Validate required fields
    if (!req.body.source || !req.body.amount_aed || !req.body.date || !req.body.status || !req.body.payment_mode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: source, amount_aed, date, status, payment_mode' 
      });
    }

    // Validate payment mode
    const validPaymentModes = ['Cash', 'Bank Transfer', 'UPI', 'NEFT', 'Credit Card', 'Cheque'];
    if (!validPaymentModes.includes(req.body.payment_mode)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid payment_mode. Must be one of: ${validPaymentModes.join(', ')}` 
      });
    }

    // Validate status
    const validStatuses = ['received', 'pending'];
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be either "received" or "pending"' 
      });
    }

    const record = await adminService.createIncomeRecord(req.body, userId);
    res.status(201).json({ success: true, data: record });
  } catch (error: any) {
    console.error('Error creating income record:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create income record',
      details: error.details || error.hint || undefined
    });
  }
});

// Update income record
router.put('/income-records/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const record = await adminService.updateIncomeRecord(id, req.body);
    res.json({ success: true, data: record });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete income record
router.delete('/income-records/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await adminService.deleteIncomeRecord(id);
    res.json({ success: true, message: 'Income record deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get income summary
router.get('/income-summary', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = await adminService.getIncomeSummary(
      startDate as string | undefined,
      endDate as string | undefined
    );
    res.json({ success: true, data: summary });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Expense Records ============

// Get all expense records
router.get('/expense-records', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { status, category_id, vendor_id, startDate, endDate, limit, offset } = req.query;
    const filters = {
      status: status as 'paid' | 'pending' | undefined,
      category_id: category_id as string | undefined,
      vendor_id: vendor_id as string | undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    };
    const records = await adminService.getExpenseRecords(filters);
    res.json({ success: true, data: records });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get expense record by ID
router.get('/expense-records/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const record = await adminService.getExpenseRecordById(id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }
    res.json({ success: true, data: record });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create expense record
router.post('/expense-records', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    // Validate required fields
    if (!req.body.amount_aed || !req.body.date || !req.body.status || !req.body.payment_mode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: amount_aed, date, status, payment_mode' 
      });
    }

    // Validate payment mode
    const validPaymentModes = ['Cash', 'Bank Transfer', 'UPI', 'NEFT', 'Credit Card', 'Cheque'];
    if (!validPaymentModes.includes(req.body.payment_mode)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid payment_mode. Must be one of: ${validPaymentModes.join(', ')}` 
      });
    }

    // Validate status
    const validStatuses = ['paid', 'pending'];
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be either "paid" or "pending"' 
      });
    }

    const record = await adminService.createExpenseRecord(req.body, userId);
    res.status(201).json({ success: true, data: record });
  } catch (error: any) {
    console.error('Error creating expense record:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create expense record',
      details: error.details || error.hint || undefined
    });
  }
});

// Update expense record
router.put('/expense-records/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const record = await adminService.updateExpenseRecord(id, req.body);
    res.json({ success: true, data: record });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete expense record
router.delete('/expense-records/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await adminService.deleteExpenseRecord(id);
    res.json({ success: true, message: 'Expense record deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get expense summary
router.get('/expense-summary', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = await adminService.getExpenseSummary(
      startDate as string | undefined,
      endDate as string | undefined
    );
    res.json({ success: true, data: summary });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Announcement Management Routes (Admin Only) ============

// POST: Create announcement
router.post('/announcements', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { title, message, priority, type, status, expiry_date, date, content } = req.body;

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    // Validate priority
    if (priority && !['high', 'medium', 'low'].includes(priority)) {
      return res.status(400).json({ success: false, message: 'Priority must be: high, medium, or low' });
    }

    // Validate type
    if (type && !['news', 'alert', 'update', 'general'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Type must be: general, news, alert, or update' });
    }

    // Validate status
    if (status && !['draft', 'published'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be draft or published' });
    }

    const userId = req.user?.userId;

    // Only superadmins can create published announcements directly
    if (status === 'published') {
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (userError || !user || user.role !== 'superadmin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Only superadmins can create published announcements. Announcements are created as drafts and can be published by superadmins later.' 
        });
      }
    }

    const announcement = await adminService.createAnnouncement({
        title,
        message,
        priority: priority || 'medium',
        type: type || 'general',
        status: status || 'draft',
        expiry_date,
        created_at: date || new Date().toISOString().split('T')[0],
      }, userId);

    res.status(201).json({ success: true, data: announcement });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET: Get all announcements (admin view - shows drafts and published)
router.get('/announcements-admin', authenticateToken, async (req: Request, res: Response) => {
  try {
    const announcements = await adminService.getAnnouncementsByAdmin();
    res.json({ success: true, data: announcements });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT: Update announcement
router.put('/announcements/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate fields if provided
    if (updates.priority && !['high', 'medium', 'low'].includes(updates.priority)) {
      return res.status(400).json({ success: false, message: 'Priority must be high, medium, or low' });
    }

    if (updates.type && !['news', 'alert', 'update', 'general'].includes(updates.type)) {
      return res.status(400).json({ success: false, message: 'Type must be news, alert, update, or general' });
    }

    if (updates.status && !['draft', 'published'].includes(updates.status)) {
      return res.status(400).json({ success: false, message: 'Status must be draft or published' });
    }

    // Check if trying to publish - only superadmins allowed
    if (updates.status === 'published') {
      const userId = req.user?.userId;
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (userError || !user || user.role !== 'superadmin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Only superadmins can publish announcements' 
        });
      }
    }

    const announcement = await adminService.updateAnnouncement(id, updates);
    res.json({ success: true, data: announcement });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE: Delete announcement
router.delete('/announcements/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await adminService.deleteAnnouncement(id);
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Event Management Routes (Admin Only) ============

// POST: Create event
router.post('/events', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { title, description, date, time, location, registration_link, status, category, max_participants, banner_image, type } = req.body;
    const userId = req.user?.userId;

    // Validate required fields
    if (!title || !date || !time || !location) {
      return res.status(400).json({ success: false, message: 'Missing required fields: title, date, time, location' });
    }

    // Validate status is draft or published
    if (status && !['draft', 'published'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be draft or published' });
    }

    // Only superadmins can create published events directly
    if (status === 'published') {
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (userError || !user || user.role !== 'superadmin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Only superadmins can create published events. Events are created as drafts and can be published by superadmins later.' 
        });
      }
    }

    const event = await eventsService.createEvent({
      title,
      description,
      date,
      time,
      location,
      registration_link,
      status: status || 'published',
      category,
      max_participants,
      banner_image,
      type,
    }, userId);

    res.status(201).json({ success: true, data: event });
  } catch (error: any) {
    console.error('Error creating event:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create event',
      details: process.env.NODE_ENV === 'development' ? error.details || error.hint || error : undefined
    });
  }
});

// GET: Get all events (admin view - shows drafts and published)
router.get('/events', authenticateToken, async (req: Request, res: Response) => {
  try {
    const events = await eventsService.getEventsByAdmin();
    res.json({ success: true, data: events, count: events?.length || 0 });
  } catch (error: any) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT: Update event
router.put('/events/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user?.userId;

    // Validate status if provided
    if (updates.status && !['draft', 'published'].includes(updates.status)) {
      return res.status(400).json({ success: false, message: 'Status must be draft or published' });
    }

    // Check if trying to publish - only superadmins allowed
    if (updates.status === 'published') {
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (userError || !user || user.role !== 'superadmin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Only superadmins can publish events' 
        });
      }
    }

    const event = await eventsService.updateEvent(id, updates);
    res.json({ success: true, data: event });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE: Delete event
router.delete('/events/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await eventsService.deleteEvent(id);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST: Upload event banner image
router.post('/events/:id/banner', authenticateToken, upload.single('eventBanner'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Validate file type

    // Upload to Supabase storage
    const bannerUrl = await uploadToSupabase(file, 'event', 'banners');

    // Update event with banner URL
    const event = await eventsService.updateEvent(id, { banner_image: bannerUrl });

    res.json({ 
      success: true, 
      data: { 
        banner_image: bannerUrl, 
        event 
      } 
    });
  } catch (error: any) {
    console.error('❌ Error uploading event banner:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Job Management Routes (Admin Only) ============

// POST: Create job
router.post('/jobs', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { job_title, description, role, company_name, application_link, apply_by_date, location, employment_type, experience_level, salary, status } = req.body;

    // Validate required fields
    if (!job_title || !description || !role || !application_link || !apply_by_date || !location || !employment_type || !experience_level) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Validate employment type
    const validEmploymentTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
    if (!validEmploymentTypes.includes(employment_type)) {
      return res.status(400).json({ success: false, message: 'Employment type must be: Full-time, Part-time, Contract, or Internship' });
    }

    // Validate experience level
    const validExperienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Expert Level'];
    if (!validExperienceLevels.includes(experience_level)) {
      return res.status(400).json({ success: false, message: 'Experience level must be: Entry Level, Mid Level, Senior Level, or Expert Level' });
    }

    // Validate status is draft or published
    if (status && !['draft', 'published'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be draft or published' });
    }

    const userId = req.user?.userId;

    // Only superadmins can create published jobs directly
    if (status === 'published') {
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (userError || !user || user.role !== 'superadmin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Only superadmins can create published jobs. Jobs are created as drafts and can be published by superadmins later.' 
        });
      }
    }

    const job = await jobsService.createJob({
      job_title,
      description,
      role,
      application_link,
      apply_by_date,
      location,
      employment_type,
      experience_level,
      salary,
      status: status || 'published',
    }, userId);

    res.status(201).json({ success: true, data: job });
  } catch (error: any) {
    console.error('Error creating job:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create job',
      details: process.env.NODE_ENV === 'development' ? error.details || error.hint || error : undefined
    });
  }
});

// GET: Get all jobs (admin view)
router.get('/jobs', authenticateToken, async (req: Request, res: Response) => {
  try {
    const jobs = await jobsService.getJobsByAdmin();
    res.json({ success: true, data: jobs, count: jobs?.length || 0 });
  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT: Update job
router.put('/jobs/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate employment type if provided
    if (updates.employment_type) {
      const validEmploymentTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
      if (!validEmploymentTypes.includes(updates.employment_type)) {
        return res.status(400).json({ success: false, message: 'Employment type must be: Full-time, Part-time, Contract, or Internship' });
      }
    }

    // Validate experience level if provided
    if (updates.experience_level) {
      const validExperienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Expert Level'];
      if (!validExperienceLevels.includes(updates.experience_level)) {
        return res.status(400).json({ success: false, message: 'Experience level must be: Entry Level, Mid Level, Senior Level, or Expert Level' });
      }
    }

    // Validate status if provided
    if (updates.status && !['draft', 'published'].includes(updates.status)) {
      return res.status(400).json({ success: false, message: 'Status must be draft or published' });
    }

    // Check if trying to publish - only superadmins allowed
    if (updates.status === 'published') {
      const userId = req.user?.userId;
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (userError || !user || user.role !== 'superadmin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Only superadmins can publish jobs' 
        });
      }
    }

    const job = await jobsService.updateJob(id, updates);
    res.json({ success: true, data: job });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE: Delete job
router.delete('/jobs/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await jobsService.deleteJob(id);
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Cleanup Expired Content ============

// POST: Cleanup expired events (superadmin only)
router.post('/cleanup/events', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || !user || user.role !== 'superadmin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only superadmins can trigger cleanup' 
      });
    }

    const result = await eventsService.cleanupExpiredEvents();
    res.json({ 
      success: true, 
      message: `Cleaned up ${result.cleaned} expired events`,
      data: result 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST: Cleanup expired announcements (superadmin only)
router.post('/cleanup/announcements', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || !user || user.role !== 'superadmin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only superadmins can trigger cleanup' 
      });
    }

    const result = await adminService.cleanupExpiredAnnouncements();
    res.json({ 
      success: true, 
      message: `Cleaned up ${result.cleaned} expired announcements`,
      data: result 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST: Cleanup expired jobs (superadmin only)
router.post('/cleanup/jobs', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || !user || user.role !== 'superadmin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only superadmins can trigger cleanup' 
      });
    }

    const result = await jobsService.cleanupExpiredJobs();
    res.json({ 
      success: true, 
      message: `Cleaned up ${result.cleaned} expired jobs`,
      data: result 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Role-Based Notifications ============

// Get notifications based on user role
router.get('/notifications/dashboard', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userRole = req.user?.userRole || 'user';
    const notifications = await adminService.getRoleBasedNotifications(userRole);
    
    res.json({ success: true, data: notifications });
  } catch (error: any) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
