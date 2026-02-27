import { supabaseAdmin } from '../config/supabase';

// ============ Job Interface ============

export interface Job {
  id?: string;
  job_title: string;
  description: string;
  role: string;
  company_name?: string;
  application_link: string;
  apply_by_date: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary?: string;
  status?: 'draft' | 'published';
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

// ============ Job Operations (Admin Only) ============

// Admin: Create job
export const createJob = async (job: Job, adminId?: string) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .insert([{
        job_title: job.job_title,
        description: job.description,
        role: job.role,
        application_link: job.application_link,
        apply_by_date: job.apply_by_date,
        location: job.location,
        employment_type: job.employment_type,
        experience_level: job.experience_level,
        salary: job.salary || null,
        status: job.status || 'published',
        created_by: adminId || null,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating job:', error);
      throw error;
    }
    return data;
  } catch (err: any) {
    console.error('Exception creating job:', err);
    throw err;
  }
};

// Admin: Update job
export const updateJob = async (id: string, updates: Partial<Job>) => {
  const { data, error } = await supabaseAdmin
    .from('jobs')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Admin: Delete job
export const deleteJob = async (id: string) => {
  const { error } = await supabaseAdmin
    .from('jobs')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

// Admin: Get all jobs
export const getJobsByAdmin = async () => {
  const { data, error } = await supabaseAdmin
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// ============ Job Operations (Public/User Read-Only) ============

// User: Get all published jobs (excluding expired)
export const getPublishedJobs = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error, status } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('status', 'published')
      .gte('apply_by_date', today) // Only show jobs where apply_by_date is today or later
      .order('apply_by_date', { ascending: true });

    if (error) {
      console.error('❌ Supabase error fetching jobs:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }

    return data || [];
  } catch (err: any) {
    console.error('❌ Exception in getPublishedJobs:', err);
    throw err;
  }
};

// User: Get single published job by ID
export const getPublishedJobById = async (id: string) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .gte('apply_by_date', today)
      .single();

    if (error) {
      console.error('❌ Supabase error fetching job:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }

    return data;
  } catch (err: any) {
    console.error('❌ Exception in getPublishedJobById:', err);
    throw err;
  }
};

// Admin: Delete expired jobs
export const cleanupExpiredJobs = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error: selectError } = await supabaseAdmin
      .from('jobs')
      .select('id')
      .eq('status', 'published')
      .lt('apply_by_date', today);

    if (selectError) throw selectError;

    if (data && data.length > 0) {
      const ids = data.map(j => j.id);
      const { error: deleteError } = await supabaseAdmin
        .from('jobs')
        .delete()
        .in('id', ids);

      if (deleteError) throw deleteError;
      return { cleaned: data.length };
    }

    return { cleaned: 0 };
  } catch (err: any) {
    console.error('❌ Error during job cleanup:', err);
    throw err;
  }
};
