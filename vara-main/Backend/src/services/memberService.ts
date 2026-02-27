import { supabaseAdmin } from '../config/supabase';

// ============================================
// Members Service - Database Operations
// ============================================

export interface MemberProfile {
  id?: string;
  user_id?: string;
  member_id: string;
  full_name: string;
  email?: string;
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
  created_at?: string;
  updated_at?: string;
}

export interface Membership {
  id?: string;
  member_id: string;
  membership_type_id: string;
  status: 'active' | 'expired' | 'pending' | 'cancelled';
  joined_date: string;
  expiry_date: string;
}

// Get all members with their membership info
// Now supports admin filtering
export const getAllMembers = async (adminUserId?: string, adminRole?: string) => {
  let query = supabaseAdmin
    .from('member_profiles')
    .select(`
      id,
      member_id,
      user_id,
      assigned_admin_id,
      full_name,
      gender,
      age_category,
      blood_group,
      vara_whatsapp_group,
      company_name,
      job_title,
      visa_status,
      years_in_uae,
      months_in_uae,
      total_industry_experience,
      primary_area_of_work,
      skillsets,
      other_skill,
      portfolio_link,
      linkedin_link,
      behance_link,
      instagram_link,
      software_and_tools,
      interested_in_volunteering,
      volunteering_areas,
      country,
      emirate,
      area_name,
      country_code,
      contact_number,
      whatsapp_country_code,
      whatsapp_number,
      kerala_district,
      proceed_with_membership_fee,
      message,
      created_at,
      updated_at,
      memberships (
        id,
        status,
        joined_date,
        expiry_date,
        membership_types (
          name,
          category
        )
      ),
      assigned_admin:users!assigned_admin_id (
        id,
        name,
        email
      )
    `);
  
  // Regular admins only see members assigned to them
  if (adminUserId && adminRole === 'admin') {
    query = query.eq('assigned_admin_id', adminUserId);
  }
  // Superadmins see all members (no filter)
  
  query = query.order('created_at', { ascending: false });
  
  const { data, error } = await query;

  if (error) {
    console.error('❌ Error fetching members from database:', error);
    console.error('  Code:', error.code);
    console.error('  Message:', error.message);
    throw error;
  }

  return data;
};

// Get member by ID
export const getMemberById = async (memberId: string) => {
  const { data, error } = await supabaseAdmin
    .from('member_profiles')
    .select(`
      *,
      memberships (
        id,
        status,
        joined_date,
        expiry_date,
        membership_types (
          name,
          category,
          price_aed,
          benefits
        )
      )
    `)
    .eq('member_id', memberId)
    .single();

  if (error) throw error;
  return data;
};

// Get member by user ID
export const getMemberByUserId = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('member_profiles')
    .select(`
      *,
      memberships (
        id,
        status,
        joined_date,
        expiry_date,
        membership_types (
          id,
          name,
          category,
          price_aed,
          benefits,
          duration_months
        )
      )
    `)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('❌ Error fetching member by user ID:', error);
    throw error;
  }
  
  return data;
};

// Create new member profile
export const createMember = async (member: MemberProfile) => {
  const { data, error } = await supabaseAdmin
    .from('member_profiles')
    .insert([member])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update member profile
export const updateMember = async (memberId: string, updates: Partial<MemberProfile>) => {
  const { data, error } = await supabaseAdmin
    .from('member_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('member_id', memberId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete member
export const deleteMember = async (memberId: string) => {
  const { error } = await supabaseAdmin
    .from('member_profiles')
    .delete()
    .eq('member_id', memberId);

  if (error) throw error;
  return true;
};

// Get membership types
export const getMembershipTypes = async () => {
  const { data, error } = await supabaseAdmin
    .from('membership_types')
    .select('*')
    .eq('is_active', true);

  if (error) throw error;
  return data;
};

// Update membership status
export const updateMembershipStatus = async (membershipId: string, status: string) => {
  const { data, error } = await supabaseAdmin
    .from('memberships')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', membershipId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get member count and stats
export const getMemberStats = async () => {
  const { data: total, error: totalError } = await supabaseAdmin
    .from('member_profiles')
    .select('id', { count: 'exact' });

  const { data: active, error: activeError } = await supabaseAdmin
    .from('memberships')
    .select('id', { count: 'exact' })
    .eq('status', 'active');

  const { data: pending, error: pendingError } = await supabaseAdmin
    .from('membership_applications')
    .select('id', { count: 'exact' })
    .eq('status', 'pending');

  if (totalError || activeError || pendingError) {
    throw totalError || activeError || pendingError;
  }

  return {
    totalMembers: total?.length || 0,
    activeMembers: active?.length || 0,
    pendingApprovals: pending?.length || 0,
  };
};
