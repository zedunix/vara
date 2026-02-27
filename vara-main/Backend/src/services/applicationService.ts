import { supabaseAdmin } from '../config/supabase';

// ============================================
// Applications Service - Membership Applications
// ============================================

export interface MembershipApplication {
  id?: string;
  application_id: string;
  full_name: string;
  email: string;
  gender: string;
  age_category: string;
  blood_group?: string;
  profile_photo?: string;
  country?: string;
  emirate?: string;
  area_name?: string;
  country_code?: string;
  contact_number?: string;
  whatsapp_country_code?: string;
  whatsapp_number?: string;
  kerala_district?: string;
  company_name?: string;
  job_title?: string;
  visa_status?: string;
  years_in_uae?: number;
  months_in_uae?: number;
  total_industry_experience?: string;
  primary_area_of_work?: string;
  skillsets?: string[];
  other_skill?: string;
  portfolio_link?: string;
  linkedin_link?: string;
  behance_link?: string;
  instagram_link?: string;
  software_and_tools?: string;
  vara_whatsapp_group?: boolean;
  interested_in_volunteering?: boolean;
  volunteering_areas?: string[];
  proceed_with_membership_fee?: boolean;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  application_date?: string;
}

// Get all pending applications
export const getPendingApplications = async (userId?: string) => {
  // Check user role if userId provided
  let userRole = 'superadmin';
  if (userId) {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    userRole = user?.role || 'admin';
  }

  let query = supabaseAdmin
    .from('membership_applications')
    .select('*')
    .eq('status', 'pending');

  // Regular admins only see applications assigned to them
  if (userId && userRole === 'admin') {
    query = query.eq('assigned_admin_id', userId);
  }

  query = query.order('application_date', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;

  // Deduplicate by email - keep only the most recent application per email
  if (data && data.length > 0) {
    const uniqueAppsMap = new Map<string, any>();
    data.forEach((app: any) => {
      const email = (app.email || '').toLowerCase();
      // Keep the first (most recent) entry for each email
      if (!uniqueAppsMap.has(email)) {
        uniqueAppsMap.set(email, app);
      }
    });
    const deduplicatedData = Array.from(uniqueAppsMap.values());
    return deduplicatedData;
  }

  return data;
};

// Get all applications
export const getAllApplications = async (status?: string, userId?: string) => {
  // Check user role if userId provided
  let userRole = 'superadmin';
  if (userId) {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    userRole = user?.role || 'admin';
  }

  let query = supabaseAdmin
    .from('membership_applications')
    .select('*');

  if (status) {
    query = query.eq('status', status);
  }

  // Regular admins only see applications assigned to them
  if (userId && userRole === 'admin') {
    query = query.eq('assigned_admin_id', userId);
  }

  query = query.order('application_date', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;

  // Deduplicate by email - keep only the most recent application per email
  if (data && data.length > 0) {
    const uniqueAppsMap = new Map<string, any>();
    data.forEach((app: any) => {
      const email = (app.email || '').toLowerCase();
      // Keep the first (most recent) entry for each email
      if (!uniqueAppsMap.has(email)) {
        uniqueAppsMap.set(email, app);
      }
    });
    const deduplicatedData = Array.from(uniqueAppsMap.values());
    if (deduplicatedData.length < data.length) {
      // Deduplication occurred
    }
    return deduplicatedData;
  }

  return data;
};

// Get application by ID
export const getApplicationById = async (applicationId: string) => {
  const { data, error } = await supabaseAdmin
    .from('membership_applications')
    .select('*')
    .eq('application_id', applicationId)
    .single();

  if (error) throw error;
  return data;
};

// Create new application
export const createApplication = async (application: MembershipApplication) => {
  // Generate application ID
  const { data: lastApp } = await supabaseAdmin
    .from('membership_applications')
    .select('application_id')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const year = new Date().getFullYear();
  let nextNum = 1;
  if (lastApp?.application_id) {
    const match = lastApp.application_id.match(/APP-\d+-(\d+)/);
    if (match) nextNum = parseInt(match[1]) + 1;
  }
  
  const applicationId = `APP-${year}-${String(nextNum).padStart(3, '0')}`;

  const { data, error } = await supabaseAdmin
    .from('membership_applications')
    .insert([{ ...application, application_id: applicationId }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Approve application
export const approveApplication = async (applicationId: string, reviewerId: string) => {
  // Get application details
  const { data: application, error: fetchError } = await supabaseAdmin
    .from('membership_applications')
    .select('*')
    .eq('application_id', applicationId)
    .single();

  if (fetchError) throw fetchError;

  // Update application status
  const { error: updateError } = await supabaseAdmin
    .from('membership_applications')
    .update({
      status: 'approved',
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('application_id', applicationId);

  if (updateError) throw updateError;

  // Generate member ID
  const { data: lastMember } = await supabaseAdmin
    .from('member_profiles')
    .select('member_id')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const year = new Date().getFullYear();
  let nextNum = 1;
  if (lastMember?.member_id) {
    const match = lastMember.member_id.match(/VARA-\d+-(\d+)/);
    if (match) nextNum = parseInt(match[1]) + 1;
  }
  
  const memberId = `VARA-${year}-${String(nextNum).padStart(3, '0')}`;

  // Create member profile from application
  const { data: member, error: memberError } = await supabaseAdmin
    .from('member_profiles')
    .insert([{
      member_id: memberId,
      user_id: application.user_id,
      full_name: application.full_name,
      gender: application.gender,
      age_category: application.age_category,
      blood_group: application.blood_group,
      profile_photo: application.profile_photo,
      country: application.country,
      emirate: application.emirate,
      area_name: application.area_name,
      country_code: application.country_code,
      contact_number: application.contact_number,
      whatsapp_country_code: application.whatsapp_country_code,
      whatsapp_number: application.whatsapp_number,
      kerala_district: application.kerala_district,
      company_name: application.company_name,
      job_title: application.job_title,
      visa_status: application.visa_status,
      years_in_uae: application.years_in_uae,
      months_in_uae: application.months_in_uae,
      total_industry_experience: application.total_industry_experience,
      primary_area_of_work: application.primary_area_of_work,
      skillsets: application.skillsets,
      other_skill: application.other_skill,
      portfolio_link: application.portfolio_link,
      linkedin_link: application.linkedin_link,
      behance_link: application.behance_link,
      instagram_link: application.instagram_link,
      software_and_tools: application.software_and_tools,
      vara_whatsapp_group: application.vara_whatsapp_group,
      interested_in_volunteering: application.interested_in_volunteering,
      volunteering_areas: application.volunteering_areas,
      proceed_with_membership_fee: application.proceed_with_membership_fee,
      message: application.message,
    }])
    .select()
    .single();

  if (memberError) throw memberError;

  return { application, member };
};

// Reject application
export const rejectApplication = async (
  applicationId: string,
  reviewerId: string,
  reason: string
) => {
  const { data, error } = await supabaseAdmin
    .from('membership_applications')
    .update({
      status: 'rejected',
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason,
    })
    .eq('application_id', applicationId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
