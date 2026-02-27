export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  linkedin_url?: string;
  portfolio_link?: string;
  behance_url?: string;
  dribbble_url?: string;
  instagram_handle?: string;
  portfolio_pdf_url?: string;
  image_gallery_url?: string;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  linkedinUrl?: string;
  portfolioLink?: string;
  behanceUrl?: string;
  dribbbleUrl?: string;
  instagramHandle?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: Partial<User>;
    token: string;
  };
  error?: string;
}
