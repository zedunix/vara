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
  memberships?: Array<{
    id: string;
    status: 'active' | 'expired' | 'pending' | 'cancelled';
    joined_date: string;
    expiry_date: string;
    membership_types?: {
      name: string;
      category: string;
      price_aed: number;
      benefits?: string[];
    };
  }>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: 'user' | 'admin' | 'superadmin';
  linkedin_url?: string;
  portfolio_link?: string;
  behance_url?: string;
  dribbble_url?: string;
  instagram_handle?: string;
  portfolio_pdf_url?: string;
  image_gallery_url?: string;
  is_verified: boolean;
  created_at: string;
  memberProfile?: MemberProfile | null;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  linkedinUrl?: string;
  portfolioLink?: string;
  behanceUrl?: string;
  dribbbleUrl?: string;
  instagramHandle?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  redirectUrl?: string;
  data?: {
    user: User;
    token: string;
  };
}
