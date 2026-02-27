import { supabaseAdmin } from '../config/supabase';

// ============================================
// Admin Service - Board Members & Admin Profiles
// ============================================

export interface AdminProfile {
  id?: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
  admin_since?: string;
}

export interface BoardMember {
  id?: string;
  user_id?: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin';
  assigned_date: string;
  status: 'active' | 'inactive';
  last_login?: string;
}

// ============ Admin Profile Operations ============

// Get admin profile by user ID
export const getAdminProfile = async (userId: string) => {
  // First, get user info from users table
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('email, role, name, phone, created_at')
    .eq('id', userId)
    .single();

  if (userError) throw userError;

  // Get job title from member_profiles (if exists)
  const { data: memberProfile, error: memberError } = await supabaseAdmin
    .from('member_profiles')
    .select('job_title')
    .eq('user_id', userId)
    .single();

  // If not in member_profiles, try membership_applications
  let jobTitle = memberProfile?.job_title;
  if (!jobTitle) {
    const { data: appData, error: appError } = await supabaseAdmin
      .from('membership_applications')
      .select('job_title')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    jobTitle = appData?.job_title;
  }

  // Then, get admin profile data
  const { data: profileData, error: profileError } = await supabaseAdmin
    .from('admin_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  // If no admin profile exists yet, return user data with job title as department
  if (profileError && profileError.code === 'PGRST116') {
    return {
      user_id: userId,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      department: jobTitle || userData.role,
      admin_since: null,
      user_created_at: userData.created_at,
    };
  }

  if (profileError) throw profileError;

  // Merge user data with profile data
  return {
    ...profileData,
    email: userData.email,
    role: userData.role,
    name: profileData.name || userData.name,
    phone: profileData.phone || userData.phone,
    department: profileData.department || jobTitle || userData.role,
    user_created_at: userData.created_at,
  };
};

// Create or update admin profile
export const upsertAdminProfile = async (profile: AdminProfile) => {
  const { data, error } = await supabaseAdmin
    .from('admin_profiles')
    .upsert([profile], { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============ Board Members Operations ============

// Get all board members (fetch from users table where role is admin or superadmin)
export const getAllBoardMembers = async () => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, name, email, role, created_at, is_active')
    .in('role', ['admin', 'superadmin'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Transform users data to match BoardMember interface
  return data.map((user: any) => ({
    id: user.id,
    name: user.name || user.email,
    email: user.email,
    role: user.role as 'admin' | 'superadmin',
    assignedDate: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A',
    status: user.is_active ? 'active' : 'inactive',
    lastLogin: undefined
  }));
};

// Get board member by ID
export const getBoardMemberById = async (id: string) => {
  const { data, error } = await supabaseAdmin
    .from('board_members')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// Create board member
export const createBoardMember = async (member: Omit<BoardMember, 'id'>) => {
  const { data, error } = await supabaseAdmin
    .from('board_members')
    .insert([member])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update board member
export const updateBoardMember = async (id: string, updates: Partial<BoardMember>) => {
  const { data, error } = await supabaseAdmin
    .from('board_members')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete board member
export const deleteBoardMember = async (id: string) => {
  const { error } = await supabaseAdmin
    .from('board_members')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

// Update last login for board member
export const updateBoardMemberLogin = async (email: string) => {
  const { data, error } = await supabaseAdmin
    .from('board_members')
    .update({ last_login: new Date().toISOString() })
    .eq('email', email)
    .select()
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// ============ Dashboard Stats ============

// Get admin dashboard stats
export const getDashboardStats = async () => {
  const [
    { data: members },
    { data: activeMemberships },
    { data: pendingApps },
    { data: income },
  ] = await Promise.all([
    supabaseAdmin.from('member_profiles').select('id', { count: 'exact' }),
    supabaseAdmin.from('memberships').select('id', { count: 'exact' }).eq('status', 'active'),
    supabaseAdmin.from('membership_applications').select('id', { count: 'exact' }).eq('status', 'pending'),
    supabaseAdmin.from('income_records').select('amount_aed').gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ]);

  const monthlyRevenue = income?.reduce((sum: number, r: { amount_aed?: number }) => sum + (r.amount_aed || 0), 0) || 0;

  return {
    totalMembers: members?.length || 0,
    activeMembers: activeMemberships?.length || 0,
    pendingApprovals: pendingApps?.length || 0,
    monthlyRevenueAed: monthlyRevenue,
  };
};

// ============ Activity Logs ============

// Log activity
export const logActivity = async (
  userId: string | undefined,
  action: string,
  entityType: string,
  entityId?: string,
  oldData?: any,
  newData?: any,
  ipAddress?: string,
  userAgent?: string
) => {
  const { error } = await supabaseAdmin
    .from('activity_logs')
    .insert([{
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_data: oldData,
      new_data: newData,
      ip_address: ipAddress,
      user_agent: userAgent,
    }]);

  if (error) console.error('Error logging activity:', error);
};

// Get activity logs
export const getActivityLogs = async (limit: number = 50, offset: number = 0) => {
  const { data, error } = await supabaseAdmin
    .from('activity_logs')
    .select(`
      *,
      users (email)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
};

// ============ Notifications ============

// Create notification
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info',
  link?: string
) => {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .insert([{ user_id: userId, title, message, type, link }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get user notifications
export const getUserNotifications = async (userId: string, unreadOnly: boolean = false) => {
  let query = supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (unreadOnly) {
    query = query.eq('is_read', false);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Mark notification as read
export const markNotificationRead = async (notificationId: string) => {
  const { error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) throw error;
  return true;
};

// Mark all notifications as read
export const markAllNotificationsRead = async (userId: string) => {
  const { error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
  return true;
};
// ============ Income Records ============

export interface IncomeRecord {
  id?: string;
  income_id?: string;
  source: string;
  category_id?: string;
  description?: string;
  amount_aed: number;
  date: string;
  status: 'received' | 'pending';
  payment_mode: string;
  receipt_number?: string;
  notes?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

// Create income record
export const createIncomeRecord = async (record: IncomeRecord, userId?: string) => {
  try {
    // Generate unique income_id: INC-{base36_timestamp}-{randomString}
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomStr = Math.random().toString(36).substr(2, 8).toUpperCase();
    const incomeId = `INC-${timestamp}-${randomStr}`;
    
    const { data, error } = await supabaseAdmin
      .from('income_records')
      .insert([{
        income_id: incomeId,
        source: record.source,
        category_id: record.category_id || null,
        description: record.description || null,
        amount_aed: record.amount_aed,
        date: record.date,
        status: record.status,
        payment_mode: record.payment_mode,
        receipt_number: record.receipt_number || null,
        notes: record.notes || null,
        created_by: userId || null,
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating income record:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    return data;
  } catch (error: any) {
    console.error('Error in createIncomeRecord:', error.message);
    throw error;
  }
};

// Get all income records with filters
export const getIncomeRecords = async (filters?: {
  status?: 'received' | 'pending';
  source?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) => {
  let query = supabaseAdmin
    .from('income_records')
    .select('*')
    .order('date', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.source) {
    query = query.eq('source', filters.source);
  }

  if (filters?.startDate) {
    query = query.gte('date', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('date', filters.endDate);
  }

  const limit = filters?.limit || 100;
  const offset = filters?.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Get income record by ID
export const getIncomeRecordById = async (id: string) => {
  const { data, error } = await supabaseAdmin
    .from('income_records')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// Update income record
export const updateIncomeRecord = async (id: string, updates: Partial<IncomeRecord>) => {
  const { data, error } = await supabaseAdmin
    .from('income_records')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete income record
export const deleteIncomeRecord = async (id: string) => {
  const { error } = await supabaseAdmin
    .from('income_records')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

// Get income summary for dashboard
export const getIncomeSummary = async (startDate?: string, endDate?: string) => {
  let query = supabaseAdmin
    .from('income_records')
    .select('amount_aed, status, source')
    .eq('status', 'received');

  if (startDate) {
    query = query.gte('date', startDate);
  }

  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data, error } = await query;
  if (error) throw error;

  const total = data?.reduce((sum, r) => sum + (r.amount_aed || 0), 0) || 0;
  const bySource = data?.reduce((acc: any, r: any) => {
    acc[r.source] = (acc[r.source] || 0) + (r.amount_aed || 0);
    return acc;
  }, {}) || {};

  return {
    total,
    count: data?.length || 0,
    bySource,
  };
};

// ============ Expense Records ============

export interface ExpenseRecord {
  id?: string;
  expense_id?: string;
  category_id?: string;
  vendor_id?: string;
  description?: string;
  amount_aed: number;
  date: string;
  status: 'paid' | 'pending';
  payment_mode: string;
  invoice_number?: string;
  notes?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

// Create expense record
export const createExpenseRecord = async (record: ExpenseRecord, userId?: string) => {
  try {
    // Generate unique expense_id: EXP-{base36_timestamp}-{randomString}
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomStr = Math.random().toString(36).substr(2, 8).toUpperCase();
    const expenseId = `EXP-${timestamp}-${randomStr}`;
    
    const { data, error } = await supabaseAdmin
      .from('expense_records')
      .insert([{
        expense_id: expenseId,
        category_id: record.category_id || null,
        vendor_id: record.vendor_id || null,
        description: record.description || null,
        amount_aed: record.amount_aed,
        date: record.date,
        status: record.status,
        payment_mode: record.payment_mode,
        invoice_number: record.invoice_number || null,
        notes: record.notes || null,
        created_by: userId || null,
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating expense record:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    return data;
  } catch (error: any) {
    console.error('Error in createExpenseRecord:', error.message);
    throw error;
  }
};

// Get all expense records with filters
export const getExpenseRecords = async (filters?: {
  status?: 'paid' | 'pending';
  category_id?: string;
  vendor_id?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) => {
  let query = supabaseAdmin
    .from('expense_records')
    .select('*')
    .order('date', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id);
  }

  if (filters?.vendor_id) {
    query = query.eq('vendor_id', filters.vendor_id);
  }

  if (filters?.startDate) {
    query = query.gte('date', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('date', filters.endDate);
  }

  const limit = filters?.limit || 100;
  const offset = filters?.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Get expense record by ID
export const getExpenseRecordById = async (id: string) => {
  const { data, error } = await supabaseAdmin
    .from('expense_records')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// Update expense record
export const updateExpenseRecord = async (id: string, updates: Partial<ExpenseRecord>) => {
  const { data, error } = await supabaseAdmin
    .from('expense_records')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete expense record
export const deleteExpenseRecord = async (id: string) => {
  const { error } = await supabaseAdmin
    .from('expense_records')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

// Get expense summary for dashboard
export const getExpenseSummary = async (startDate?: string, endDate?: string) => {
  let query = supabaseAdmin
    .from('expense_records')
    .select('amount_aed, status, category_id')
    .eq('status', 'paid');

  if (startDate) {
    query = query.gte('date', startDate);
  }

  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data, error } = await query;
  if (error) throw error;

  const total = data?.reduce((sum, r) => sum + (r.amount_aed || 0), 0) || 0;

  return {
    total,
    count: data?.length || 0,
  };
};

// ============ Announcement Operations (Admin Only) ============

export interface Announcement {
  id?: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  type: 'news' | 'alert' | 'update' | 'general';
  status: 'draft' | 'published';
  created_at?: string;
  expiry_date?: string | null;
}

// Admin: Create announcement (status can be draft or published)
export const createAnnouncement = async (announcement: Announcement, adminId?: string) => {
  const { data, error } = await supabaseAdmin
    .from('announcements')
    .insert([{
      title: announcement.title,
      content: announcement.message, // Map message to content (required field)
      message: announcement.message,
      date: announcement.created_at || new Date().toISOString().split('T')[0], // Add required date field
      priority: announcement.priority || 'medium',
      type: announcement.type || 'general',
      status: announcement.status || 'draft',
      expiry_date: announcement.expiry_date || null,
      created_by: adminId || null,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Admin: Update announcement
export const updateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
  const { data, error } = await supabaseAdmin
    .from('announcements')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Admin: Delete announcement
export const deleteAnnouncement = async (id: string) => {
  const { error } = await supabaseAdmin
    .from('announcements')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

// Admin: Get all announcements (drafts and published)
// Get all announcements for admin (draft and published)
export const getAnnouncementsByAdmin = async () => {
  const { data, error } = await supabaseAdmin
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// ============ User Operations (Read-Only) ============

// Get all admins (for registration dropdown)
export const getAllAdmins = async () => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, name, email, role')
    .in('role', ['admin', 'superadmin'])
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
};

// User: Get published announcements only
export const getPublishedAnnouncements = async () => {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabaseAdmin
    .from('announcements')
    .select('id, title, message, priority, type, status, created_at, expiry_date')
    .eq('status', 'published')
    .gte('expiry_date', today)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// User: Get single published announcement by ID
export const getPublishedAnnouncementById = async (id: string) => {
  const { data, error } = await supabaseAdmin
    .from('announcements')
    .select('id, title, message, priority, type, status, created_at, expiry_date')
    .eq('id', id)
    .eq('status', 'published')
    .gte('expiry_date', new Date().toISOString().split('T')[0])
    .single();

  if (error) throw error;
  return data;
};

// Admin: Cleanup expired announcements
export const cleanupExpiredAnnouncements = async () => {
  const today = new Date().toISOString().split('T')[0];
  const { data, error: selectError } = await supabaseAdmin
    .from('announcements')
    .select('id')
    .eq('status', 'published')
    .lt('expiry_date', today);

  if (selectError) throw selectError;

  if (data && data.length > 0) {
    const ids = data.map((a: any) => a.id);
    const { error: deleteError } = await supabaseAdmin
      .from('announcements')
      .delete()
      .in('id', ids);

    if (deleteError) throw deleteError;
    return { cleaned: data.length };
  }

  return { cleaned: 0 };
};

// ==================== Role-Based Notifications ====================

export const getRoleBasedNotifications = async (userRole: string) => {
  const today = new Date().toISOString().split('T')[0];
  
  const notifications: any = {
    upcomingEvents: [],
    announcements: [],
    jobs: [],
    pendingMembers: null,
    draftItems: null,
  };

  try {
    // FIRST: Get ALL events to see what exists
    const { data: allEvents, error: allEventsError } = await supabaseAdmin
      .from('events')
      .select('id, title, description, event_date, location, status');
    
    // Get upcoming events (if date >= today AND status = published)
    const { data: events, error: eventsError } = await supabaseAdmin
      .from('events')
      .select('id, title, description, date, location, status')
      .eq('status', 'published')
      .gte('date', today)
      .order('date', { ascending: true })
      .limit(10);

    if (eventsError) {
      console.error('❌ Events query error:', eventsError);
    }
    notifications.upcomingEvents = events || [];

    // FIRST: Get ALL announcements to see what exists
    const { data: allAnnouncements } = await supabaseAdmin
      .from('announcements')
      .select('id, title, message, created_at, expiry_date, priority, status');
    
    // Get published announcements (if not expired)
    const { data: announcementsData, error: announcementsError } = await supabaseAdmin
      .from('announcements')
      .select('id, title, message, created_at, expiry_date, priority, status')
      .eq('status', 'published')
      .gte('expiry_date', today)
      .order('created_at', { ascending: false })
      .limit(10);

    if (announcementsError) {
      console.error('❌ Announcements query error:', announcementsError);
    }
    notifications.announcements = announcementsData || [];

    // FIRST: Get ALL jobs to see what exists
    const { data: allJobs } = await supabaseAdmin
      .from('jobs')
      .select('id, job_title, company_name, location, apply_by_date, status');
    
    // Get published jobs (if not expired)
    const { data: jobsData, error: jobsError } = await supabaseAdmin
      .from('jobs')
      .select('id, job_title, location, apply_by_date, status')
      .eq('status', 'published')
      .gte('apply_by_date', today)
      .order('created_at', { ascending: false })
      .limit(10);

    if (jobsError) {
      console.error('❌ Jobs query error:', jobsError);
    }
    notifications.jobs = jobsData || [];

    // Get pending membership applications for admin/superadmin
    if (userRole === 'admin' || userRole === 'superadmin') {
      const { count: pendingCount, error: pendingError } = await supabaseAdmin
        .from('membership_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (pendingError) console.error('Pending members query error:', pendingError);
      notifications.pendingMembers = {
        count: pendingCount || 0,
        status: 'pending'
      };
    }

    // Get draft items for superadmin
    if (userRole === 'superadmin') {
      const { count: draftEventsCount } = await supabaseAdmin
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft');

      const { count: draftJobsCount } = await supabaseAdmin
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft');

      const { count: draftAnnouncementsCount } = await supabaseAdmin
        .from('announcements')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft');

      notifications.draftItems = {
        events: draftEventsCount || 0,
        jobs: draftJobsCount || 0,
        announcements: draftAnnouncementsCount || 0,
        total: (draftEventsCount || 0) + (draftJobsCount || 0) + (draftAnnouncementsCount || 0)
      };
    }

    return notifications;
  } catch (error: any) {
    console.error('❌ Error in getRoleBasedNotifications:', error);
    throw error;
  }
};
