import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { adminAPI, eventsAPI, jobsAPI, membersAPI } from '../utils/api';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Bell,
  LogOut,
  Menu,
  X,
  Award,
  Clock,
  Users,
  Star,
  MessageCircle,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Search,
  Sun,
  Moon,
  Sparkles,
  Eye,
  Briefcase,
  ExternalLink as LinkIcon,
  CircleDollarSign,
  Activity,
  FileText,
  TrendingUp,
  Layers,
  Globe,
  AlertTriangle,
  BadgeCheck,
} from 'lucide-react';
import { VarafiedIdCard } from '../components/idCard';

// Types
interface UserProfile {
  memberId?: string;
  fullName: string;
  gender: string;
  ageCategory: string;
  bloodGroup: string;
  varaWhatsappGroup: string;
  companyName: string;
  jobTitle: string;
  visaStatus: string;
  yearsInUAE: string;
  monthsInUAE: string;
  totalIndustryExperience: string;
  primaryAreaOfWork: string;
  skillsets: string[];
  portfolioLink: string;
  linkedinLink?: string;
  behanceLink?: string;
  instagramLink?: string;
  softwareAndTools?: string;
  interestedInVolunteering: string;
  volunteeringAreas: string[];
  country: string;
  emirate: string;
  areaName: string;
  contactNumber: string;
  whatsappNumber: string;
  email: string;
  keralaDistrict: string;
  proceedWithMembershipFee: string;
  memberSince: string;
  avatarUrl?: string;
  role?: 'user' | 'admin' | 'superadmin';
}

interface Membership {
  id: string;
  type: string;
  category: string;
  status: 'active' | 'expired' | 'pending';
  expiryDate: string;
  joinedDate: string;
  benefits: string[];
}

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  registrationLink?: string;
  status?: 'draft' | 'published';
  createdAt?: string;
  maxParticipants?: number;
  category?: string;
  bannerImage?: string;
  type?: 'upcoming' | 'past';
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
  registration_link?: string;
}

interface Job {
  id: string;
  jobTitle: string;
  description: string;
  role: string;
  applicationLink: string;
  applyByDate: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  salary?: string;
  status: 'draft' | 'published';
  createdAt: string;
}

// User profile - fetched from database
const mockUser: UserProfile = {
  memberId: '',
  fullName: '',
  gender: '',
  ageCategory: '',
  bloodGroup: '',
  varaWhatsappGroup: '',
  companyName: '',
  jobTitle: '',
  visaStatus: '',
  yearsInUAE: '',
  monthsInUAE: '',
  totalIndustryExperience: '',
  primaryAreaOfWork: '',
  skillsets: [],
  portfolioLink: '',
  linkedinLink: '',
  behanceLink: '',
  instagramLink: '',
  softwareAndTools: '',
  interestedInVolunteering: '',
  volunteeringAreas: [],
  country: '',
  emirate: '',
  areaName: '',
  contactNumber: '',
  whatsappNumber: '',
  email: '',
  keralaDistrict: '',
  proceedWithMembershipFee: '',
  memberSince: '',
  role: 'user',
};

// Membership - fetched from database
const mockMembership: Membership = {
  id: '',
  type: '',
  category: '',
  status: 'pending',
  expiryDate: '',
  joinedDate: '',
  benefits: [],
};

// Events - fetched from database
const mockEvents: Event[] = [];

// Announcements - fetched from database
const mockAnnouncements: Announcement[] = [];

// Jobs - fetched from database
const mockJobs: Job[] = [];

// Navigation items
const navItems = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'membership', label: 'Membership', icon: CreditCard },
  { id: 'id-card', label: 'Varafied ID Card', icon: BadgeCheck },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'announcements', label: 'Announcements', icon: Bell },
  { id: 'jobs', label: 'Job Recruitment', icon: Briefcase },
];

// Format time to 12-hour AM/PM format
const formatTime = (timeStr: string) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

// Calculate membership progress
const calculateMembershipProgress = (membership: Membership) => {
  if (!membership.joinedDate || !membership.expiryDate) {
    return 0;
  }
  const start = new Date(membership.joinedDate);
  const end = new Date(membership.expiryDate);
  const now = new Date();
  const total = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  return Math.min(Math.max((elapsed / total) * 100, 0), 100);
};

// Calculate days until membership expiry
const calculateDaysUntilExpiry = (membership: Membership) => {
  if (!membership.expiryDate) {
    return 0;
  }
  const expiryDate = new Date(membership.expiryDate);
  const now = new Date();
  const timeDiff = expiryDate.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return daysDiff;
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, logout } = useAuthStore();
  
  // Derive section from URL path
  const getPathSegments = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    // pathParts[0] will be 'user-member', pathParts[1] will be the section
    const section = pathParts[1] || 'profile';
    return section;
  };
  
  const activeSection = getPathSegments();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  
  // Data states
  const [userProfile, setUserProfile] = useState<UserProfile>(mockUser);
  const [membership, setMembership] = useState<Membership>(mockMembership);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [jobs, setJobs] = useState<Job[]>(mockJobs);

  // Notifications state
  const [notifications, setNotifications] = useState<any>(null);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);

  // Profile completion calculation
  const calculateProfileCompletion = () => {
    const fields = [userProfile.fullName, userProfile.email, userProfile.contactNumber, userProfile.areaName, userProfile.memberSince];
    const filled = fields.filter(f => f && f.length > 0).length;
    return (filled / fields.length) * 100;
  };

  // Construct proper Supabase storage URL for profile photos
  const constructSupabaseImageUrl = (photoUrl: string | null): string | null => {
    if (!photoUrl) return null;
    
    // If it's already a full URL, return as-is
    if (photoUrl.startsWith('http')) {
      console.log('✅ URL already complete:', photoUrl);
      return photoUrl;
    }
    
    // If it's just a filename, construct the full URL
    const supabaseUrl = 'https://nxyjkwbrbgpctjlkonoi.supabase.co'; // Your Supabase URL
    const fullUrl = `${supabaseUrl}/storage/v1/object/public/profiles/${photoUrl}`;
    console.log('🔧 Constructed URL:', fullUrl);
    return fullUrl;
  };

  // Calculate membership expiry
  const membershipProgress = calculateMembershipProgress(membership);
  const daysUntilExpiry = calculateDaysUntilExpiry(membership);
  const profileCompletion = calculateProfileCompletion();

  // Fetch data from API
  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch member profile and membership data from backend
      let memberProfileData = null;
      
      // Try to fetch from API first
      try {
        const memberRes = await membersAPI.getProfile();
        memberProfileData = memberRes.data?.data;
        console.log('✅ Member Profile Data:', memberProfileData);
        console.log('✅ Memberships:', memberProfileData?.memberships);
      } catch (error: any) {
        console.log('❌ Could not fetch from API, using auth store data', error?.message);
        // Fallback to auth store if API call fails
        memberProfileData = authUser?.memberProfile;
      }

      // If member profile is available, use it
      if (memberProfileData) {
        setUserProfile({
          memberId: memberProfileData.member_id || memberProfileData.id || '',
          fullName: memberProfileData.full_name || '',
          gender: memberProfileData.gender || '',
          ageCategory: memberProfileData.age_category || '',
          bloodGroup: memberProfileData.blood_group || '',
          varaWhatsappGroup: memberProfileData.vara_whatsapp_group ? 'yes' : 'no',
          companyName: memberProfileData.company_name || '',
          jobTitle: memberProfileData.job_title || '',
          visaStatus: memberProfileData.visa_status || '',
          yearsInUAE: memberProfileData.years_in_uae?.toString() || '',
          monthsInUAE: memberProfileData.months_in_uae?.toString() || '',
          totalIndustryExperience: memberProfileData.total_industry_experience || '',
          primaryAreaOfWork: memberProfileData.primary_area_of_work || '',
          skillsets: memberProfileData.skillsets || [],
          portfolioLink: memberProfileData.portfolio_link || '',
          linkedinLink: memberProfileData.linkedin_link || '',
          behanceLink: memberProfileData.behance_link || '',
          instagramLink: memberProfileData.instagram_link || '',
          softwareAndTools: memberProfileData.software_and_tools || '',
          interestedInVolunteering: memberProfileData.interested_in_volunteering ? 'yes' : 'no',
          volunteeringAreas: memberProfileData.volunteering_areas || [],
          country: memberProfileData.country || '',
          emirate: memberProfileData.emirate || '',
          areaName: memberProfileData.area_name || '',
          contactNumber: memberProfileData.contact_number || '',
          whatsappNumber: memberProfileData.whatsapp_number || '',
          email: memberProfileData.email || authUser?.email || '',
          keralaDistrict: memberProfileData.kerala_district || '',
          proceedWithMembershipFee: memberProfileData.proceed_with_membership_fee ? 'yes' : 'no',
          memberSince: memberProfileData.created_at || '',
          avatarUrl: memberProfileData.profile_photo_url || memberProfileData.profile_photo || '',
        });

        // Extract and set profile photo URL
        // Profile photo is no longer needed since ID card was removed
        console.log('ℹ️ Profile loaded successfully');

        // Fetch and set membership details from database
        if (memberProfileData.memberships && Array.isArray(memberProfileData.memberships) && memberProfileData.memberships.length > 0) {
          const activeMembership = memberProfileData.memberships[0];
          const membershipType = activeMembership.membership_types || {};
          
          console.log('✅ Active Membership:', activeMembership);
          console.log('✅ Membership Type:', membershipType);
          
          setMembership({
            id: activeMembership.id || memberProfileData.member_id || memberProfileData.id || '',
            type: membershipType.name || 'Standard',
            category: membershipType.category || 'Individual Member',
            status: activeMembership.status || 'pending',
            joinedDate: activeMembership.joined_date || '',
            expiryDate: activeMembership.expiry_date || '',
            benefits: (membershipType.benefits && Array.isArray(membershipType.benefits)) ? membershipType.benefits : [],
          });
        } else {
          console.log('⚠️ No memberships found for user');
          // Set a default membership if none exists
          setMembership({
            id: memberProfileData.member_id || memberProfileData.id || '',
            type: 'Standard',
            category: 'Individual Member',
            status: 'pending',
            joinedDate: memberProfileData.created_at || '',
            expiryDate: '',
            benefits: [],
          });
        }
      }
      
      // Fetch events, announcements, and jobs in parallel
      const [eventsRes, announcementsRes, jobsRes] = await Promise.allSettled([
        eventsAPI.getAll({ status: 'published' }),
        eventsAPI.getAnnouncements(),
        jobsAPI.getAll({ status: 'published' }),
      ]);

      // Update events - map snake_case to camelCase
      if (eventsRes.status === 'fulfilled' && eventsRes.value.data?.data) {
        const mappedEvents = eventsRes.value.data.data.map((evt: any) => ({
          id: evt.id,
          title: evt.title,
          description: evt.description,
          date: evt.date,
          time: evt.time,
          location: evt.location,
          registrationLink: evt.registration_link, // Map snake_case to camelCase
          status: evt.status,
          createdAt: evt.created_at,
          maxParticipants: evt.max_participants,
          category: evt.category,
          bannerImage: evt.banner_image,
          type: evt.type,
        }));
        setEvents(mappedEvents);
      }

      // Update announcements - map snake_case to camelCase
      if (announcementsRes.status === 'fulfilled' && announcementsRes.value.data?.data) {
        const mappedAnnouncements = announcementsRes.value.data.data.map((ann: any) => ({
          id: ann.id,
          title: ann.title,
          content: ann.content || ann.message,
          date: ann.date,
          priority: ann.priority,
          registration_link: ann.registration_link, // Keep snake_case for consistency with existing code
        }));
        setAnnouncements(mappedAnnouncements);
      }

      // Update jobs - map snake_case to camelCase
      if (jobsRes.status === 'fulfilled' && jobsRes.value.data?.data) {
        const mappedJobs = jobsRes.value.data.data.map((job: any) => ({
          id: job.id,
          jobTitle: job.job_title,
          description: job.description,
          role: job.role,
          applicationLink: job.application_link,
          applyByDate: job.apply_by_date,
          location: job.location,
          employmentType: job.employment_type,
          experienceLevel: job.experience_level,
          salary: job.salary,
          status: job.status,
          createdAt: job.created_at,
        }));
        setJobs(mappedJobs);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Fetch role-based notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      setNotificationsLoading(true);
      try {
        const response = await adminAPI.getRoleBasedNotifications();
        console.log('📡 Raw Axios Response:', response);
        console.log('📦 Response.data:', response.data);
        
        // Get the correct data - response.data contains { success: true, data: {...} }
        const notificationsData = response.data?.data;
        console.log('🔔 Extracted Notifications Data:', notificationsData);
        console.log('   upcomingEvents:', notificationsData?.upcomingEvents?.length || 0);
        console.log('   jobs:', notificationsData?.jobs?.length || 0);
        console.log('   announcements:', notificationsData?.announcements?.length || 0);
        
        if (notificationsData) {
          setNotifications(notificationsData);
          console.log('✅ Notifications loaded successfully');
        } else {
          console.log('⚠️ No notifications data received');
          setNotifications(null);
        }
      } catch (error: any) {
        console.error('❌ Error fetching notifications:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        setNotifications(null);
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle default route - redirect to profile if at base path
  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    // If at /user-member with no section, redirect to profile
    if (pathParts.length === 1 && pathParts[0] === 'user-member') {
      navigate('/user-member/profile', { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Loading skeleton with premium animation
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
            <div className="absolute inset-0 rounded-full border-2 border-t-white/80 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border border-white/5"></div>
          </div>
          <p className="text-white/60 text-sm font-light tracking-wide">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex overflow-x-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#09090b]' : 'bg-[#f8fafc]'}`}>
      {/* Premium Multi-Layer Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Base Gradient Layer */}
        <div className={`absolute inset-0 ${isDarkMode 
          ? 'bg-gradient-to-br from-[#0c0a1d] via-[#09090b] to-[#0a0d12]' 
          : 'bg-gradient-to-br from-violet-50/80 via-white to-cyan-50/60'}`}></div>
        
        {/* Animated Gradient Orbs - Dark Mode */}
        {isDarkMode && (
          <>
            <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-gradient-to-br from-violet-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute top-[30%] right-[-15%] w-[600px] h-[600px] bg-gradient-to-bl from-cyan-500/15 via-blue-600/8 to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-[-15%] left-[15%] w-[550px] h-[550px] bg-gradient-to-tr from-emerald-500/12 via-teal-600/6 to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-[60%] left-[50%] w-[400px] h-[400px] bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
            
            {/* Mesh Gradient Overlay */}
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: `radial-gradient(at 40% 20%, rgba(139, 92, 246, 0.15) 0px, transparent 50%),
                               radial-gradient(at 80% 0%, rgba(14, 165, 233, 0.1) 0px, transparent 50%),
                               radial-gradient(at 0% 50%, rgba(168, 85, 247, 0.12) 0px, transparent 50%),
                               radial-gradient(at 80% 50%, rgba(34, 197, 94, 0.08) 0px, transparent 50%),
                               radial-gradient(at 0% 100%, rgba(244, 63, 94, 0.1) 0px, transparent 50%),
                               radial-gradient(at 80% 100%, rgba(6, 182, 212, 0.1) 0px, transparent 50%)`
            }}></div>
            
            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.02]" style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}></div>
          </>
        )}
        
        {/* Light Mode Background Effects */}
        {!isDarkMode && (
          <>
            <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-violet-200/40 via-purple-100/30 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-bl from-cyan-200/35 via-blue-100/25 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-5%] left-[30%] w-[450px] h-[450px] bg-gradient-to-tr from-emerald-200/30 via-teal-100/20 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute top-[50%] right-[20%] w-[350px] h-[350px] bg-gradient-to-l from-rose-200/25 via-pink-100/15 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-[20%] right-[-5%] w-[400px] h-[400px] bg-gradient-to-tl from-amber-200/20 via-yellow-100/10 to-transparent rounded-full blur-3xl"></div>
            
            {/* Light Mode Mesh Gradient */}
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(at 30% 20%, rgba(139, 92, 246, 0.08) 0px, transparent 50%),
                               radial-gradient(at 70% 10%, rgba(14, 165, 233, 0.06) 0px, transparent 50%),
                               radial-gradient(at 10% 60%, rgba(168, 85, 247, 0.07) 0px, transparent 50%),
                               radial-gradient(at 90% 40%, rgba(34, 197, 94, 0.05) 0px, transparent 50%),
                               radial-gradient(at 50% 80%, rgba(244, 63, 94, 0.05) 0px, transparent 50%)`
            }}></div>
            
            {/* Light Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.4]" style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}></div>
          </>
        )}
        
        {/* Top Gradient Fade */}
        <div className={`absolute top-0 left-0 right-0 h-32 ${isDarkMode 
          ? 'bg-gradient-to-b from-[#09090b] to-transparent' 
          : 'bg-gradient-to-b from-white/50 to-transparent'}`}></div>
      </div>

      {/* Left Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 z-50 flex flex-col transition-all duration-300 ${isDarkMode ? 'bg-[#0c0c0e]/95 border-r border-white/[0.08]' : 'bg-white/95 border-r border-gray-200'} backdrop-blur-xl ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Logo Section */}
        <div className={`flex items-center gap-3 px-6 py-5 border-b ${isDarkMode ? 'border-white/[0.08]' : 'border-gray-200'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-white/10' : 'bg-gray-900'}`}>
            <img 
              src="/Images/image logo.png" 
              alt="VARA Logo" 
              className="h-6 w-auto"
            />
          </div>
          <span className={`text-xl font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>VARA</span>
        </div>

        {/* User Profile Section */}
        <div className={`px-4 py-5 border-b ${isDarkMode ? 'border-white/[0.08]' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-br from-violet-500/30 to-cyan-500/30 ring-1 ring-white/10' : 'bg-gray-900'}`}>
              <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-white'}`}>
                {userProfile.fullName.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userProfile.fullName}</p>
              <p className={`text-xs truncate ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>{mockMembership.type} Member</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  navigate(`/user-member/${item.id}`);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeSection === item.id
                    ? isDarkMode 
                      ? 'text-white bg-white/10 shadow-lg shadow-white/5' 
                      : 'text-gray-900 bg-gray-100 shadow-md'
                    : isDarkMode
                      ? 'text-white/60 hover:text-white hover:bg-white/5'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <item.icon className={`w-5 h-5 ${activeSection === item.id ? (isDarkMode ? 'text-cyan-400' : 'text-gray-900') : ''}`} />
                {item.label}
                {activeSection === item.id && (
                  <div className={`ml-auto w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-cyan-400' : 'bg-gray-900'}`}></div>
                )}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className={`my-4 border-t ${isDarkMode ? 'border-white/[0.08]' : 'border-gray-200'}`}></div>

          {/* Notifications Button */}
          <button
            onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative ${isDarkMode ? 'text-white/60 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
          >
            <Bell className="w-5 h-5" />
            Notifications
            {notifications && (notifications.upcomingEvents?.length > 0 || notifications.announcements?.length > 0 || notifications.jobs?.length > 0) && (
              <span className={`ml-auto w-2 h-2 rounded-full animate-pulse ${isDarkMode ? 'bg-blue-400' : 'bg-blue-600'}`}></span>
            )}
          </button>
        </nav>

        {/* Bottom Section */}
        <div className={`px-3 py-4 border-t ${isDarkMode ? 'border-white/[0.08]' : 'border-gray-200'}`}>
          {/* Theme Toggle */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${isDarkMode ? 'text-white/60 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${isDarkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Toggle - Fixed position */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className={`fixed top-4 left-4 z-50 md:hidden p-3 rounded-xl shadow-lg transition-all duration-300 ${isDarkMode ? 'bg-[#14161A] text-white/80 hover:text-white border border-white/10' : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'}`}
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Main Content Wrapper */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-24 px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSearchOpen(false)}></div>
          <div className={`relative w-full max-w-xl rounded-2xl shadow-2xl border p-4 animate-in fade-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#14161A] border-white/10' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <Search className={`w-5 h-5 ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search anything..."
                autoFocus
                className={`flex-1 bg-transparent text-base outline-none ${isDarkMode ? 'text-white placeholder:text-white/40' : 'text-gray-900 placeholder:text-gray-400'}`}
              />
              <kbd className={`px-2 py-1 text-xs rounded-md ${isDarkMode ? 'bg-white/10 text-white/40' : 'bg-gray-100 text-gray-500'}`}>ESC</kbd>
            </div>
          </div>
        </div>
      )}

      {/* Notification Panel */}
      {notificationPanelOpen && (
        <>
          <div 
            className="fixed inset-0 z-[55]"
            onClick={() => setNotificationPanelOpen(false)}
          ></div>
          <div className={`fixed top-20 left-4 md:left-72 w-96 max-h-96 rounded-2xl shadow-2xl border overflow-y-auto z-[56] animate-in fade-in slide-in-from-left-2 duration-200 ${isDarkMode ? 'bg-[#14161A] border-white/10' : 'bg-white border-gray-200'}`}>
            {/* Header */}
            <div className={`sticky top-0 px-6 py-4 border-b ${isDarkMode ? 'border-white/10 bg-[#1A1D22]' : 'border-gray-200 bg-gray-50'}`}>
              <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
            </div>

            {/* Content */}
            {notificationsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className={`w-6 h-6 rounded-full border-2 ${isDarkMode ? 'border-white/20 border-t-white' : 'border-gray-300 border-t-gray-900'} animate-spin`}></div>
              </div>
            ) : !notifications ? (
              <div className={`text-center py-12 px-4 ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`}>
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }}>
                {/* Upcoming Events */}
                {notifications.upcomingEvents && notifications.upcomingEvents.length > 0 && (
                  <div className="px-6 py-4">
                    <h4 className={`font-semibold text-sm mb-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Upcoming Events</h4>
                    <div className="space-y-2">
                      {notifications.upcomingEvents.map((event: any) => (
                        <div key={event.id} className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                          <p className={`font-medium text-sm line-clamp-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{event.title}</p>
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-white/50' : 'text-gray-600'}`}>
                            📅 {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Announcements */}
                {notifications.announcements && notifications.announcements.length > 0 && (
                  <div className="px-6 py-4">
                    <h4 className={`font-semibold text-sm mb-3 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>Announcements</h4>
                    <div className="space-y-2">
                      {notifications.announcements.map((announcement: any) => (
                        <div key={announcement.id} className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                          <p className={`font-medium text-sm line-clamp-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{announcement.title}</p>
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-white/50' : 'text-gray-600'}`}>
                            📢 Expires: {new Date(announcement.expiry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Jobs */}
                {notifications.jobs && notifications.jobs.length > 0 && (
                  <div className="px-6 py-4">
                    <h4 className={`font-semibold text-sm mb-3 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>Job Openings</h4>
                    <div className="space-y-2">
                      {notifications.jobs.map((job: any) => (
                        <div key={job.id} className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                          <p className={`font-medium text-sm line-clamp-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{job.job_title}</p>
                          {job.company_name && (
                            <p className={`text-xs mt-1 ${isDarkMode ? 'text-white/50' : 'text-gray-600'}`}>
                              💼 {job.company_name}
                            </p>
                          )}
                          <p className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`}>
                            Apply by: {new Date(job.apply_by_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pending Members (Admin/Superadmin) */}
                {notifications.pendingMembers && (userProfile.role === 'admin' || userProfile.role === 'superadmin') && (
                  <div className="px-6 py-4">
                    <h4 className={`font-semibold text-sm mb-3 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Pending Members</h4>
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                      <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{notifications.pendingMembers.count}</p>
                      <p className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-gray-600'}`}>Awaiting approval</p>
                    </div>
                  </div>
                )}

                {/* Draft Items (Superadmin) */}
                {notifications.draftItems && userProfile.role === 'superadmin' && (
                  <div className="px-6 py-4">
                    <h4 className={`font-semibold text-sm mb-3 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>Pending Approvals</h4>
                    <div className="space-y-2">
                      {notifications.draftItems.events > 0 && (
                        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>📅 Events: <span className={`font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{notifications.draftItems.events}</span></p>
                        </div>
                      )}
                      {notifications.draftItems.jobs > 0 && (
                        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>💼 Jobs: <span className={`font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{notifications.draftItems.jobs}</span></p>
                        </div>
                      )}
                      {notifications.draftItems.announcements > 0 && (
                        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>📢 Announcements: <span className={`font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{notifications.draftItems.announcements}</span></p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Main Content */}
      <main className={`flex-1 sidebar-dashboard-main ${!isDarkMode ? 'light-gradient-bg' : ''}`}>
        {/* Welcome Section with Profile Completion */}
        <div className="dashboard-welcome animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Welcome back, {userProfile.fullName.split(' ')[0]}
                <Sparkles className="inline-block w-6 h-6 ml-2 text-white/40" />
              </h1>
              <p className={`mt-1 ${isDarkMode ? 'text-white/50' : 'text-gray-600'}`}>
                Manage your membership and stay updated with VARA activities.
              </p>
            </div>
            {/* Profile Completion */}
            <div className={`dashboard-inline-gap px-4 py-3 rounded-2xl border backdrop-blur-sm ${isDarkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="20" fill="none" strokeWidth="2.5" className={isDarkMode ? 'stroke-white/[0.08]' : 'stroke-gray-200'} />
                  <circle 
                    cx="24" cy="24" r="20" fill="none" strokeWidth="2.5" 
                    strokeDasharray={`${profileCompletion * 1.256} 999`}
                    className={isDarkMode ? 'stroke-white/80' : 'stroke-gray-900'}
                    strokeLinecap="round"
                  />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-xs font-semibold ${isDarkMode ? 'text-white/90' : 'text-gray-900'}`}>
                  {Math.round(profileCompletion)}%
                </span>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Profile Complete</p>
                <p className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`}>Complete your profile</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="dashboard-grid">
          {[
            { icon: Award, label: 'Status', value: membership.status ? membership.status.charAt(0).toUpperCase() + membership.status.slice(1) : 'Pending', accent: 'from-emerald-500/20 to-emerald-600/5', iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400', shadow: 'shadow-emerald-500/10' },
            { icon: Calendar, label: 'Events', value: `${events.length} Upcoming`, accent: 'from-blue-500/20 to-blue-600/5', iconBg: 'bg-blue-500/15', iconColor: 'text-blue-400', shadow: 'shadow-blue-500/10' },
            { icon: Users, label: 'Member Since', value: membership.joinedDate ? new Date(membership.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'N/A', accent: 'from-violet-500/20 to-violet-600/5', iconBg: 'bg-violet-500/15', iconColor: 'text-violet-400', shadow: 'shadow-violet-500/10' },
            { icon: Star, label: 'Plan', value: membership.type || 'Standard', accent: 'from-amber-500/20 to-amber-600/5', iconBg: 'bg-amber-500/15', iconColor: 'text-amber-400', shadow: 'shadow-amber-500/10' },
          ].map((stat, index) => (
            <div 
              key={index}
              className={`group relative rounded-2xl border dashboard-card-padding transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 cursor-pointer overflow-hidden ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06] hover:border-white/15' : 'bg-white border-gray-200 hover:border-gray-300'} ${isDarkMode ? `hover:shadow-xl hover:${stat.shadow}` : 'hover:shadow-lg'}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Colored gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              {/* 3D inner shadow effect */}
              <div className="absolute inset-0 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] pointer-events-none"></div>
              
              <div className="relative flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg ${isDarkMode ? `${stat.iconBg} group-hover:shadow-lg` : 'bg-gray-100'}`}>
                  <stat.icon className={`w-5 h-5 transition-colors duration-300 ${isDarkMode ? `text-white/50 group-hover:${stat.iconColor}` : 'text-gray-700'}`} />
                </div>
                <div>
                  <p className={`text-[11px] font-medium uppercase tracking-wider ${isDarkMode ? 'text-white/35' : 'text-gray-500'}`}>{stat.label}</p>
                  <p className={`text-lg font-semibold mt-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Profile Section */}
        {activeSection === 'profile' && (
          <div className="dashboard-stack-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Profile Information</h2>
              
            </div>

            <div className={`dashboard-section rounded-2xl border overflow-hidden shadow-xl ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06] shadow-black/20' : 'bg-white border-gray-200 shadow-gray-200/50'}`}>
              {/* Profile Header */}
              <div className={`p-8 border-b ${isDarkMode ? 'border-white/[0.06] bg-gradient-to-r from-violet-500/15 via-transparent to-cyan-500/10' : 'border-gray-100 bg-gradient-to-r from-gray-50 to-white'}`}>
                <div className="flex items-center gap-6">
                  <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden group shadow-2xl ${isDarkMode ? 'bg-gradient-to-br from-violet-500/50 to-cyan-500/50 ring-2 ring-white/20 shadow-violet-500/30' : 'bg-gradient-to-br from-gray-800 to-gray-900'}`}>
                    <span className="text-white text-2xl font-bold drop-shadow-lg">
                      {userProfile.fullName.split(' ').map(n => n[0]).join('')}
                    </span>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userProfile.fullName}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-sm ${isDarkMode ? 'text-white/50' : 'text-gray-600'}`}>{membership.type || 'Standard'} Member</span>
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full shadow-lg ${membership.status === 'active' ? (isDarkMode ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30 shadow-emerald-500/20' : 'bg-green-100 text-green-700') : membership.status === 'expired' ? (isDarkMode ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30 shadow-red-500/20' : 'bg-red-100 text-red-700') : (isDarkMode ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30 shadow-amber-500/20' : 'bg-amber-100 text-amber-700')}`}>
                        {membership.status ? membership.status.charAt(0).toUpperCase() + membership.status.slice(1) : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="dashboard-card-padding-lg">
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Personal Information</h3>
                <div className="dashboard-grid-2 mb-6">
                  {[
                    { icon: User, label: 'Gender', value: userProfile.gender, iconBg: 'bg-blue-500/15', iconColor: 'text-blue-400' },
                    { icon: Calendar, label: 'Age Category', value: userProfile.ageCategory, iconBg: 'bg-purple-500/15', iconColor: 'text-purple-400' },
                    { icon: Activity, label: 'Blood Group', value: userProfile.bloodGroup, iconBg: 'bg-red-500/15', iconColor: 'text-red-400' },
                    { icon: MessageCircle, label: 'VARA WhatsApp Group', value: userProfile.varaWhatsappGroup, iconBg: 'bg-green-500/15', iconColor: 'text-green-400' },
                  ].map((item, index) => (
                    <div 
                      key={index}
                      className={`group flex items-start gap-4 p-5 rounded-xl border transition-all duration-300 cursor-pointer hover:-translate-y-0.5 ${isDarkMode ? 'border-white/[0.06] hover:border-white/15 hover:bg-white/[0.03] hover:shadow-lg hover:shadow-black/20' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 hover:shadow-md'}`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${isDarkMode ? `${item.iconBg} group-hover:shadow-lg` : 'bg-gray-100'}`}>
                        <item.icon className={`w-5 h-5 ${isDarkMode ? item.iconColor : 'text-gray-600'}`} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-[11px] font-medium uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-white/35' : 'text-gray-500'}`}>{item.label}</p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white/90' : 'text-gray-900'}`}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Professional Information</h3>
                <div className="dashboard-grid-2 mb-6">
                  {[
                    { icon: Briefcase, label: 'Company Name', value: userProfile.companyName, iconBg: 'bg-indigo-500/15', iconColor: 'text-indigo-400' },
                    { icon: Award, label: 'Job Title', value: userProfile.jobTitle, iconBg: 'bg-amber-500/15', iconColor: 'text-amber-400' },
                    { icon: FileText, label: 'Visa Status', value: userProfile.visaStatus, iconBg: 'bg-cyan-500/15', iconColor: 'text-cyan-400' },
                    { icon: Clock, label: 'Time in UAE', value: `${userProfile.yearsInUAE} years ${userProfile.monthsInUAE} months`, iconBg: 'bg-teal-500/15', iconColor: 'text-teal-400' },
                    { icon: TrendingUp, label: 'Industry Experience', value: userProfile.totalIndustryExperience, iconBg: 'bg-orange-500/15', iconColor: 'text-orange-400' },
                    { icon: Layers, label: 'Primary Area of Work', value: userProfile.primaryAreaOfWork, iconBg: 'bg-pink-500/15', iconColor: 'text-pink-400' },
                  ].map((item, index) => (
                    <div 
                      key={index}
                      className={`group flex items-start gap-4 p-5 rounded-xl border transition-all duration-300 cursor-pointer hover:-translate-y-0.5 ${isDarkMode ? 'border-white/[0.06] hover:border-white/15 hover:bg-white/[0.03] hover:shadow-lg hover:shadow-black/20' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 hover:shadow-md'}`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${isDarkMode ? `${item.iconBg} group-hover:shadow-lg` : 'bg-gray-100'}`}>
                        <item.icon className={`w-5 h-5 ${isDarkMode ? item.iconColor : 'text-gray-600'}`} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-[11px] font-medium uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-white/35' : 'text-gray-500'}`}>{item.label}</p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white/90' : 'text-gray-900'}`}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Skills & Portfolio</h3>
                <div className="mb-6">
                  <div className={`p-5 rounded-xl border ${isDarkMode ? 'border-white/[0.06] bg-white/[0.02]' : 'border-gray-100 bg-gray-50'}`}>
                    <p className={`text-[11px] font-medium uppercase tracking-wider mb-3 ${isDarkMode ? 'text-white/35' : 'text-gray-500'}`}>Skillsets</p>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.skillsets.map((skill, index) => (
                        <span key={index} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-violet-500/15 text-violet-400' : 'bg-violet-100 text-violet-700'}`}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  {userProfile.portfolioLink && (
                    <div className={`mt-4 p-5 rounded-xl border ${isDarkMode ? 'border-white/[0.06] bg-white/[0.02]' : 'border-gray-100 bg-gray-50'}`}>
                      <p className={`text-[11px] font-medium uppercase tracking-wider mb-2 ${isDarkMode ? 'text-white/35' : 'text-gray-500'}`}>Portfolio Link</p>
                      <a href={userProfile.portfolioLink} target="_blank" rel="noopener noreferrer" className={`text-sm font-medium ${isDarkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-600 hover:text-blue-700'}`}>
                        {userProfile.portfolioLink}
                      </a>
                    </div>
                  )}
                  {(userProfile.linkedinLink || userProfile.behanceLink || userProfile.instagramLink) && (
                    <div className={`mt-4 p-5 rounded-xl border ${isDarkMode ? 'border-white/[0.06] bg-white/[0.02]' : 'border-gray-100 bg-gray-50'}`}>
                      <p className={`text-[11px] font-medium uppercase tracking-wider mb-3 ${isDarkMode ? 'text-white/35' : 'text-gray-500'}`}>Social Media & Professional Links</p>
                      <div className="space-y-2">
                        {userProfile.linkedinLink && (
                          <a href={userProfile.linkedinLink} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 text-sm font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                            <Linkedin className="w-4 h-4" />
                            LinkedIn Profile
                          </a>
                        )}
                        {userProfile.behanceLink && (
                          <a href={userProfile.behanceLink} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 text-sm font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                            <LinkIcon className="w-4 h-4" />
                            Behance Portfolio
                          </a>
                        )}
                        {userProfile.instagramLink && (
                          <a href={userProfile.instagramLink.startsWith('http') ? userProfile.instagramLink : `https://instagram.com/${userProfile.instagramLink.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 text-sm font-medium ${isDarkMode ? 'text-pink-400 hover:text-pink-300' : 'text-pink-600 hover:text-pink-700'}`}>
                            <Instagram className="w-4 h-4" />
                            {userProfile.instagramLink}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  {userProfile.softwareAndTools && (
                    <div className={`mt-4 p-5 rounded-xl border ${isDarkMode ? 'border-white/[0.06] bg-white/[0.02]' : 'border-gray-100 bg-gray-50'}`}>
                      <p className={`text-[11px] font-medium uppercase tracking-wider mb-3 ${isDarkMode ? 'text-white/35' : 'text-gray-500'}`}>Software & Tools</p>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.softwareAndTools.split(',').map((tool, index) => (
                          <span key={index} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-cyan-500/15 text-cyan-400' : 'bg-cyan-100 text-cyan-700'}`}>
                            {tool.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Contact Information</h3>
                <div className="dashboard-grid-2 mb-6">
                  {[
                    { icon: Mail, label: 'Email Address', value: userProfile.email, iconBg: 'bg-blue-500/15', iconColor: 'text-blue-400' },
                    { icon: Phone, label: 'Contact Number', value: userProfile.contactNumber, iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400' },
                    { icon: MessageCircle, label: 'WhatsApp Number', value: userProfile.whatsappNumber, iconBg: 'bg-green-500/15', iconColor: 'text-green-400' },
                    { icon: MapPin, label: 'Location', value: `${userProfile.areaName}, ${userProfile.emirate}, ${userProfile.country}`, iconBg: 'bg-rose-500/15', iconColor: 'text-rose-400' },
                    { icon: Globe, label: 'Kerala District', value: userProfile.keralaDistrict, iconBg: 'bg-indigo-500/15', iconColor: 'text-indigo-400' },
                    { icon: Clock, label: 'Member Since', value: userProfile.memberSince, iconBg: 'bg-violet-500/15', iconColor: 'text-violet-400' },
                  ].map((item, index) => (
                    <div 
                      key={index}
                      className={`group flex items-start gap-4 p-5 rounded-xl border transition-all duration-300 cursor-pointer hover:-translate-y-0.5 ${isDarkMode ? 'border-white/[0.06] hover:border-white/15 hover:bg-white/[0.03] hover:shadow-lg hover:shadow-black/20' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 hover:shadow-md'}`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${isDarkMode ? `${item.iconBg} group-hover:shadow-lg` : 'bg-gray-100'}`}>
                        <item.icon className={`w-5 h-5 ${isDarkMode ? item.iconColor : 'text-gray-600'}`} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-[11px] font-medium uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-white/35' : 'text-gray-500'}`}>{item.label}</p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white/90' : 'text-gray-900'}`}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Volunteering Information</h3>
                <div className="dashboard-grid-2">
                  <div className={`p-5 rounded-xl border ${isDarkMode ? 'border-white/[0.06] bg-white/[0.02]' : 'border-gray-100 bg-gray-50'}`}>
                    <p className={`text-[11px] font-medium uppercase tracking-wider mb-2 ${isDarkMode ? 'text-white/35' : 'text-gray-500'}`}>Interested in Volunteering</p>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white/90' : 'text-gray-900'}`}>{userProfile.interestedInVolunteering}</p>
                  </div>
                  {userProfile.volunteeringAreas.length > 0 && (
                    <div className={`p-5 rounded-xl border ${isDarkMode ? 'border-white/[0.06] bg-white/[0.02]' : 'border-gray-100 bg-gray-50'}`}>
                      <p className={`text-[11px] font-medium uppercase tracking-wider mb-3 ${isDarkMode ? 'text-white/35' : 'text-gray-500'}`}>Volunteering Areas</p>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.volunteeringAreas.map((area, index) => (
                          <span key={index} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Membership Section */}
        {activeSection === 'membership' && (
          <div className="dashboard-stack-lg animate-in fade-in slide-in-from-bottom-4 duration-500 pb-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Membership Details</h2>
              <span className={`px-3 py-1.5 rounded-full text-xs font-medium shadow-lg ${membership.status === 'active' ? (isDarkMode ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30 shadow-emerald-500/20' : 'bg-green-100 text-green-700') : membership.status === 'expired' ? (isDarkMode ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30 shadow-red-500/20' : 'bg-red-100 text-red-700') : (isDarkMode ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30 shadow-amber-500/20' : 'bg-amber-100 text-amber-700')}`}>
                {membership.status ? membership.status.charAt(0).toUpperCase() + membership.status.slice(1) : 'Pending'}
              </span>
            </div>

            {/* Membership Expiry Reminder */}
            {daysUntilExpiry <= 14 && daysUntilExpiry > 0 && (
              <div className={`rounded-2xl border p-5 shadow-lg animate-in fade-in slide-in-from-top-4 duration-500 ${
                daysUntilExpiry <= 1
                  ? isDarkMode ? 'bg-red-500/10 border-red-500/30 shadow-red-500/20' : 'bg-red-50 border-red-200'
                  : daysUntilExpiry <= 7
                  ? isDarkMode ? 'bg-orange-500/10 border-orange-500/30 shadow-orange-500/20' : 'bg-orange-50 border-orange-200'
                  : isDarkMode ? 'bg-amber-500/10 border-amber-500/30 shadow-amber-500/20' : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                    daysUntilExpiry <= 1
                      ? isDarkMode ? 'bg-red-500/20' : 'bg-red-100'
                      : daysUntilExpiry <= 7
                      ? isDarkMode ? 'bg-orange-500/20' : 'bg-orange-100'
                      : isDarkMode ? 'bg-amber-500/20' : 'bg-amber-100'
                  }`}>
                    <AlertTriangle className={`w-6 h-6 ${
                      daysUntilExpiry <= 1
                        ? isDarkMode ? 'text-red-400' : 'text-red-600'
                        : daysUntilExpiry <= 7
                        ? isDarkMode ? 'text-orange-400' : 'text-orange-600'
                        : isDarkMode ? 'text-amber-400' : 'text-amber-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-base font-semibold mb-2 ${
                      daysUntilExpiry <= 1
                        ? isDarkMode ? 'text-red-400' : 'text-red-700'
                        : daysUntilExpiry <= 7
                        ? isDarkMode ? 'text-orange-400' : 'text-orange-700'
                        : isDarkMode ? 'text-amber-400' : 'text-amber-700'
                    }`}>
                      {daysUntilExpiry <= 1
                        ? '⚠️ Membership Expiring Tomorrow!'
                        : daysUntilExpiry <= 7
                        ? '⚠️ Membership Expiring Soon!'
                        : '⏰ Membership Renewal Reminder'}
                    </h3>
                    <p className={`text-sm mb-3 ${
                      daysUntilExpiry <= 1
                        ? isDarkMode ? 'text-red-300' : 'text-red-600'
                        : daysUntilExpiry <= 7
                        ? isDarkMode ? 'text-orange-300' : 'text-orange-600'
                        : isDarkMode ? 'text-amber-300' : 'text-amber-600'
                    }`}>
                      Your membership will expire in <span className="font-bold">{daysUntilExpiry} {daysUntilExpiry === 1 ? 'day' : 'days'}</span> on <span className="font-bold">{membership.expiryDate ? new Date(membership.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>. Please renew to continue enjoying your benefits.
                    </p>
                    <div className="flex items-center gap-3">
                      <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                        daysUntilExpiry <= 1
                          ? isDarkMode ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30' : 'bg-red-600 text-white hover:bg-red-700'
                          : daysUntilExpiry <= 7
                          ? isDarkMode ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/30' : 'bg-orange-600 text-white hover:bg-orange-700'
                          : isDarkMode ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/30' : 'bg-amber-600 text-white hover:bg-amber-700'
                      }`}>
                        Renew Membership
                      </button>
                      <button className={`text-sm font-medium transition-colors ${
                        daysUntilExpiry <= 1
                          ? isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'
                          : daysUntilExpiry <= 7
                          ? isDarkMode ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-700'
                          : isDarkMode ? 'text-amber-400 hover:text-amber-300' : 'text-amber-600 hover:text-amber-700'
                      }`}>
                        Set Reminder
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {daysUntilExpiry <= 0 && (
              <div className={`rounded-2xl border p-5 shadow-lg animate-pulse ${isDarkMode ? 'bg-red-500/15 border-red-500/40 shadow-red-500/30' : 'bg-red-100 border-red-300'}`}>
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-red-500/30' : 'bg-red-200'}`}>
                    <AlertTriangle className={`w-6 h-6 ${isDarkMode ? 'text-red-400' : 'text-red-700'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-base font-semibold mb-2 ${isDarkMode ? 'text-red-400' : 'text-red-800'}`}>
                      🚨 Membership Expired!
                    </h3>
                    <p className={`text-sm mb-3 ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                      Your membership has expired. Renew now to restore access to all benefits and services.
                    </p>
                    <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30' : 'bg-red-700 text-white hover:bg-red-800'}`}>
                      Renew Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Membership Card with ID */}
            <div className={`dashboard-section rounded-2xl border overflow-hidden shadow-xl ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06] shadow-black/30' : 'bg-white border-gray-200'}`}>
              {/* Header */}
              <div className={`p-6 border-b ${isDarkMode ? 'border-white/[0.06] bg-gradient-to-r from-amber-500/15 via-transparent to-rose-500/10' : 'border-gray-100 bg-gradient-to-r from-gray-50 to-white'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-xl ${isDarkMode ? 'bg-gradient-to-br from-amber-500/30 to-orange-500/30 shadow-amber-500/20' : 'bg-gray-100'}`}>
                    <CreditCard className={`w-6 h-6 ${isDarkMode ? 'text-amber-400' : 'text-gray-700'}`} />
                  </div>
                  <div>
                    <p className={`text-[11px] font-medium uppercase tracking-wider ${isDarkMode ? 'text-white/35' : 'text-gray-500'}`}>Membership ID</p>
                    <p className={`text-lg font-bold font-mono tracking-wide ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {userProfile.memberId ? userProfile.memberId : membership.id ? membership.id : 'VARA-' + userProfile.fullName.substring(0, 2).toUpperCase() || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="dashboard-card-padding-lg">
                <div className="dashboard-grid-4">
                  {[
                    { icon: Award, label: 'Membership Type', value: membership.type && membership.type !== '' ? membership.type : 'Loading...', iconBg: 'bg-amber-500/15', iconColor: 'text-amber-400' },
                    { icon: Users, label: 'Category', value: membership.category && membership.category !== '' ? membership.category : 'Loading...', iconBg: 'bg-cyan-500/15', iconColor: 'text-cyan-400' },
                    { icon: Calendar, label: 'Joined Date', value: membership.joinedDate ? new Date(membership.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A', iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400' },
                    { icon: Clock, label: 'Valid Until', value: membership.expiryDate ? new Date(membership.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A', iconBg: 'bg-rose-500/15', iconColor: 'text-rose-400' },
                  ].map((item, index) => (
                    <div 
                      key={index}
                      className={`group flex items-start gap-3 p-4 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 ${isDarkMode ? 'border-white/[0.06] hover:border-white/15 hover:bg-white/[0.03] hover:shadow-lg hover:shadow-black/20' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${isDarkMode ? item.iconBg : 'bg-gray-100'}`}>
                        <item.icon className={`w-4 h-4 ${isDarkMode ? item.iconColor : 'text-gray-600'}`} />
                      </div>
                      <div>
                        <p className={`text-[10px] font-medium uppercase tracking-wider ${isDarkMode ? 'text-white/35' : 'text-gray-500'}`}>{item.label}</p>
                        <p className={`text-sm font-semibold mt-1 ${isDarkMode ? 'text-white/90' : 'text-gray-900'}`}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Membership Progress Bar */}
              <div className="dashboard-card-padding-lg pt-0">
                <div className={`dashboard-card-padding rounded-xl border ${isDarkMode ? 'border-white/[0.06] bg-white/[0.01]' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[11px] font-medium uppercase tracking-wider ${isDarkMode ? 'text-white/35' : 'text-gray-500'}`}>Membership Timeline</span>
                    <span className={`text-xs font-semibold ${isDarkMode ? 'text-cyan-400' : 'text-gray-700'}`}>{Math.round(membershipProgress)}% completed</span>
                  </div>
                  <div className={`h-3 rounded-full overflow-hidden shadow-inner ${isDarkMode ? 'bg-white/[0.08]' : 'bg-gray-200'}`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg ${isDarkMode ? 'bg-gradient-to-r from-violet-500 via-cyan-500 to-emerald-500 shadow-cyan-500/30' : 'bg-gradient-to-r from-gray-400 to-gray-600'}`}
                      style={{ width: `${membershipProgress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className={`text-[10px] ${isDarkMode ? 'text-white/25' : 'text-gray-400'}`}>{membership.joinedDate ? new Date(membership.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Start'}</span>
                    <span className={`text-[10px] ${isDarkMode ? 'text-white/25' : 'text-gray-400'}`}>{membership.expiryDate ? new Date(membership.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'End'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits Section */}
            <div className={`rounded-2xl border dashboard-card-padding-lg shadow-xl ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06] shadow-black/20' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-base font-semibold mb-5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Membership Benefits</h3>
              <div className="dashboard-grid-3">
                {(membership.benefits && membership.benefits.length > 0) ? (
                  membership.benefits.map((benefit, index) => (
                    <div 
                      key={index} 
                      className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 ${isDarkMode ? 'border-white/[0.06] hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/10' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
                    >
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 transition-colors duration-300 ${isDarkMode ? 'text-emerald-500/50 group-hover:text-emerald-400' : 'text-gray-400 group-hover:text-green-500'}`} />
                      <span className={`text-sm ${isDarkMode ? 'text-white/60 group-hover:text-white' : 'text-gray-700'}`}>{benefit}</span>
                    </div>
                  ))
                ) : (
                  <div className={`col-span-3 p-6 rounded-xl border text-center ${isDarkMode ? 'border-white/[0.06] bg-white/[0.02]' : 'border-gray-100 bg-gray-50'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>
                      {!membership.id ? '📋 Loading membership details...' : 'No specific benefits listed for this membership'}
                    </p>
                    {!membership.id && (
                      <p className={`text-xs mt-2 ${isDarkMode ? 'text-white/25' : 'text-gray-400'}`}>
                        Check browser console (F12) for debugging info
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Member Information */}
            <div className={`rounded-2xl border dashboard-card-padding-lg shadow-xl ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06] shadow-black/20' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-base font-semibold mb-5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Member Information</h3>
            <div className="space-y-1">
              {[
                { icon: User, label: 'Full Name', value: userProfile.fullName, iconColor: 'text-violet-400' },
                { icon: Mail, label: 'Email', value: userProfile.email, iconColor: 'text-blue-400' },
                { icon: Phone, label: 'Contact Number', value: userProfile.contactNumber, iconColor: 'text-emerald-400' },
                { icon: MapPin, label: 'Location', value: `${userProfile.areaName}, ${userProfile.emirate}`, iconColor: 'text-rose-400' },
              ].map((item, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between py-3.5 px-3 -mx-3 rounded-xl transition-colors duration-200 ${isDarkMode ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${isDarkMode ? item.iconColor : 'text-gray-400'}`} />
                    <span className={`text-sm ${isDarkMode ? 'text-white/45' : 'text-gray-500'}`}>{item.label}</span>
                  </div>
                  <span className={`text-sm font-medium text-right max-w-[200px] truncate ${isDarkMode ? 'text-white/90' : 'text-gray-900'}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          </div>
        )}

        {/* Varafied ID Card Section */}
        {activeSection === 'id-card' && (
          <VarafiedIdCard />
        )}

        {/* Events Section */}
        {activeSection === 'events' && (
          <div className="dashboard-stack-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Upcoming Events</h2>
              
            </div>

            <div className={`dashboard-grid-2 max-h-[650px] overflow-y-auto pr-2 pb-2 scrollbar-thin ${isDarkMode ? 'scrollbar-thumb-white/10 scrollbar-track-transparent' : 'scrollbar-thumb-gray-300 scrollbar-track-gray-100'}`}>
              {events.map((event, index) => (
                <div 
                  key={event.id} 
                  className={`group rounded-2xl border overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer shadow-lg ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06] hover:border-cyan-500/40 hover:bg-cyan-500/5 shadow-black/20 hover:shadow-cyan-500/10' : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xl'}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Banner Image */}
                  {event.bannerImage && (
                    <div className="w-full h-48 overflow-hidden">
                      <img 
                        src={event.bannerImage} 
                        alt={event.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex gap-4">
                      {/* Date Badge */}
                      <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg ${isDarkMode ? 'bg-gradient-to-br from-cyan-500/25 to-blue-500/25 shadow-cyan-500/20' : 'bg-gray-100'}`}>
                        <span className={`text-[10px] font-semibold uppercase ${isDarkMode ? 'text-cyan-400' : 'text-gray-500'}`}>
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className={`text-2xl font-bold -mt-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {new Date(event.date).getDate()}
                        </span>
                      </div>

                      {/* Event Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{event.title}</h3>
                        {event.description && (
                          <p className={`text-sm mb-2 ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
                            {event.description}
                          </p>
                        )}
                        <div className="space-y-2">
                          <p className={`text-sm flex items-center gap-2 ${isDarkMode ? 'text-white/45' : 'text-gray-500'}`}>
                            <Clock className={`w-3.5 h-3.5 ${isDarkMode ? 'text-amber-400' : ''}`} />
                            {formatTime(event.time)}
                          </p>
                          <p className={`text-sm flex items-center gap-2 ${isDarkMode ? 'text-white/45' : 'text-gray-500'}`}>
                            <MapPin className={`w-3.5 h-3.5 ${isDarkMode ? 'text-rose-400' : ''}`} />
                            {event.location}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Register Button */}
                    <div className={`mt-5 pt-5 border-t ${isDarkMode ? 'border-white/[0.06]' : 'border-gray-100'}`}>
                      {event.registrationLink ? (
                        <a
                          href={event.registrationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 inline-block ${isDarkMode ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 hover:from-cyan-500/30 hover:to-blue-500/30 hover:shadow-lg hover:shadow-cyan-500/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                          Register for event
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <button disabled className={`w-full py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${isDarkMode ? 'bg-white/5 text-white/40 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                          Registration link not available
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {events.length === 0 && (
              <div className={`rounded-2xl border p-12 text-center ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-gray-200'}`}>
                <Calendar className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-white/15' : 'text-gray-300'}`} />
                <p className={isDarkMode ? 'text-white/45' : 'text-gray-500'}>No upcoming events at the moment.</p>
              </div>
            )}
          </div>
        )}

        {/* Announcements Section */}
        {activeSection === 'announcements' && (
          <div className="dashboard-stack-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Announcements</h2>
              
            </div>

            <div className={`dashboard-stack-md max-h-[650px] overflow-y-auto pr-2 pb-2 scrollbar-thin ${isDarkMode ? 'scrollbar-thumb-white/10 scrollbar-track-transparent' : 'scrollbar-thumb-gray-300 scrollbar-track-gray-100'}`}>
              {announcements.map((announcement, index) => {
                const priorityStyles = {
                  high: { border: 'border-l-rose-500', glow: 'hover:shadow-rose-500/15', icon: 'text-rose-400' },
                  medium: { border: 'border-l-amber-500', glow: 'hover:shadow-amber-500/15', icon: 'text-amber-400' },
                  low: { border: 'border-l-blue-500', glow: 'hover:shadow-blue-500/15', icon: 'text-blue-400' },
                };
                const style = priorityStyles[announcement.priority] || priorityStyles.low;
                
                return (
                  <div 
                    key={announcement.id} 
                    className={`group rounded-2xl border border-l-4 p-6 transition-all duration-500 hover:scale-[1.01] hover:-translate-y-0.5 cursor-pointer shadow-lg ${isDarkMode ? `bg-white/[0.02] border-white/[0.06] hover:border-white/15 ${style.border} hover:shadow-xl ${style.glow}` : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {announcement.priority === 'high' && (
                            <AlertCircle className={`w-4 h-4 animate-pulse ${isDarkMode ? style.icon : 'text-red-500'}`} />
                          )}
                          <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{announcement.title}</h3>
                        </div>
                        <p className={`text-sm mb-3 leading-relaxed ${isDarkMode ? 'text-white/50' : 'text-gray-600'}`}>{announcement.content}</p>
                      </div>
                    </div>
                    {announcement.registration_link && (
                      <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-white/[0.06]' : 'border-gray-200'}`}>
                        <a
                          href={announcement.registration_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 ${isDarkMode ? 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 hover:shadow-lg hover:shadow-violet-500/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                          View Details
                          <LinkIcon className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {announcements.length === 0 && (
              <div className={`rounded-2xl border p-12 text-center ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-gray-200'}`}>
                <Bell className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-white/15' : 'text-gray-300'}`} />
                <p className={isDarkMode ? 'text-white/45' : 'text-gray-500'}>No announcements at the moment.</p>
              </div>
            )}
          </div>
        )}

        {/* Job Recruitment Section */}
        {activeSection === 'jobs' && (
          <div className="dashboard-stack-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Job Recruitment</h2>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-white/50' : 'text-gray-600'}`}>Browse available job opportunities</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {jobs.map((job, index) => (
                <div 
                  key={job.id}
                  className={`group rounded-2xl border p-6 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 shadow-lg ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06] hover:border-white/15 hover:shadow-xl hover:shadow-violet-500/10' : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Job Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {job.jobTitle}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-violet-400' : 'text-gray-600'}`}>
                        {job.role}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-800'}`}>
                      Open
                    </span>
                  </div>

                  {/* Job Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <MapPin className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`} />
                      <span className={isDarkMode ? 'text-white/60' : 'text-gray-700'}>{job.location}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Briefcase className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`} />
                      <span className={isDarkMode ? 'text-white/60' : 'text-gray-700'}>
                        {job.employmentType} • {job.experienceLevel}
                      </span>
                    </div>
                    {job.salary && (
                      <div className="flex items-center text-sm">
                        <CircleDollarSign className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`} />
                        <span className={isDarkMode ? 'text-white/60' : 'text-gray-700'}>{job.salary}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm">
                      <Calendar className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`} />
                      <span className={isDarkMode ? 'text-white/60' : 'text-gray-700'}>
                        Apply by: {new Date(job.applyByDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Job Description */}
                  <p className={`text-sm leading-relaxed mb-6 line-clamp-3 ${isDarkMode ? 'text-white/50' : 'text-gray-600'}`}>
                    {job.description}
                  </p>

                  {/* Apply Button */}
                  <div className={`flex items-center justify-between pt-4 border-t ${isDarkMode ? 'border-white/[0.06]' : 'border-gray-200'}`}>
                    <p className={`text-xs ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>
                      Posted on {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                    <a
                      href={job.applicationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${isDarkMode ? 'bg-violet-600 text-white hover:bg-violet-500 hover:shadow-violet-500/30' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                    >
                      Apply Now
                      <LinkIcon className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {jobs.length === 0 && (
              <div className={`rounded-2xl border p-12 text-center ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-gray-200'}`}>
                <Briefcase className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-white/15' : 'text-gray-300'}`} />
                <p className={isDarkMode ? 'text-white/45' : 'text-gray-500'}>No job openings at the moment.</p>
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>Check back later for new opportunities.</p>
              </div>
            )}
          </div>
        )}
     
      </main>

      {/* Footer */}
      <footer className={`mt-auto border-t relative z-50 ${isDarkMode ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-300'}`}>
        {/* Main Footer Content */}
        <div className="w-full max-w-[1400px] mx-auto px-8 lg:px-12 pt-12 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            
            {/* Brand Section */}
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-10 h-10 rounded-xl p-1.5 flex items-center justify-center ${isDarkMode ? 'bg-white/[0.08]' : 'bg-gray-900'}`}>
                  <img src="/Images/image logo.png" alt="VARA" className="h-7 w-auto object-contain" />
                </div>
                <span className={`text-xl font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>VARA</span>
              </div>
              <p className={`text-sm leading-relaxed text-center md:text-left max-w-[260px] ${isDarkMode ? 'text-white' : 'text-black'}`}>
                Empowering members through community and professional development.
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col items-center">
              <h4 className={`text-xs font-semibold uppercase tracking-widest mb-5 ${isDarkMode ? 'text-white' : 'text-black'}`}>Quick Links</h4>
              <nav className="flex flex-col items-center gap-3">
                {['My Profile', 'Membership', 'Events', 'Support'].map((link) => (
                  <a 
                    key={link} 
                    href="#" 
                    className={`text-sm transition-all duration-200 hover:translate-x-1 ${isDarkMode ? 'text-white hover:text-white/80' : 'text-black hover:text-blue-600'}`}
                  >
                    {link}
                  </a>
                ))}
              </nav>
            </div>

            {/* Contact */}
            <div className="flex flex-col items-center md:items-end">
              <h4 className={`text-xs font-semibold uppercase tracking-widest mb-5 ${isDarkMode ? 'text-white' : 'text-black'}`}>Contact Us</h4>
              <div className="flex flex-col items-center md:items-end gap-2 mb-5">
                <a href="mailto:info@vara.org" className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-white hover:text-white/80' : 'text-black hover:text-blue-600'}`}>
                  info@vara.org
                </a>
                <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>+1 (555) 123-4567</p>
              </div>
              {/* Social Icons */}
              <div className="flex items-center gap-3">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                  <a 
                    key={index} 
                    href="#" 
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20 hover:text-white' : 'bg-gray-800 text-white hover:bg-blue-600 hover:text-white'}`}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className={`border-t ${isDarkMode ? 'border-white/10 bg-black' : 'border-gray-300 bg-gray-50'}`}>
          <div className="w-full max-w-[1400px] mx-auto px-8 lg:px-12 py-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${isDarkMode ? 'bg-white/[0.08]' : 'bg-gray-900'}`}>
                  <img src="/Images/image logo.png" alt="VARA" className="h-3.5 w-auto object-contain" />
                </div>
                <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  © 2026 VARA Association. All rights reserved.
                </p>
              </div>
              <div className={`flex items-center gap-6 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                <a href="#" className={`transition-colors duration-200 ${isDarkMode ? 'hover:text-white/80' : 'hover:text-blue-600'}`}>Privacy Policy</a>
                <span className={isDarkMode ? 'text-white/20' : 'text-gray-400'}>|</span>
                <a href="#" className={`transition-colors duration-200 ${isDarkMode ? 'hover:text-white/80' : 'hover:text-blue-600'}`}>Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      </div> {/* End of Main Content Wrapper */}

      {/* Custom Styles for Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        
        .slide-in-from-bottom-4 {
          transform: translateY(1rem);
          animation: slide-up 0.5s ease-out forwards;
        }
        
        @keyframes slide-up {
          to { transform: translateY(0); }
        }
        
        .slide-in-from-top-2 {
          transform: translateY(-0.5rem);
          animation: slide-down 0.2s ease-out forwards;
        }
        
        @keyframes slide-down {
          to { transform: translateY(0); }
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        
        .backface-hidden {
          backface-visibility: hidden;
        }
        
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'};
        }
      `}</style>
    </div>
  );
}
