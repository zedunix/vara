import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authAPI, adminAPI, membersAPI, applicationsAPI, API_URL } from '../utils/api';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import {
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Settings,
  HelpCircle,
  CheckCircle2,
  Shield,
  Search,
  Sun,
  Moon,
  Sparkles,
  Download,
  Eye,
  Users,
  Clock,
  TrendingUp,
  FileText,
  UserPlus,
  Activity,
  XCircle,
  Wallet,
  Receipt,
  CircleDollarSign,
  PiggyBank,
  ArrowUpCircle,
  ArrowDownCircle,
  BarChart3,
  Building2,
  ShoppingCart,
  Megaphone,
  Calendar,
  Send,
  Briefcase,
  Award,
  Heart,
  Link as LinkIcon,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  User,
  Edit,
  Plus,
  Check,
  MessageCircle,
  FileDown,
  Table,
  DollarSign,
  RefreshCw,
  MoreVertical,
  UserCheck,
  Linkedin,
  Instagram,
  BadgeCheck,
} from 'lucide-react';
import { VarafiedIdCard } from '../components/idCard';

// Types
interface AdminProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  avatarUrl?: string;
  adminSince: string;
  memberId?: string;
}

interface Membership {
  id?: string;
  type?: string;
  category?: string;
  status?: string;
  joinedDate?: string;
  expiryDate?: string;
  benefits?: string[];
}

interface MemberAccount {
  id: string;
  member_id: string;
  user_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  date_joined?: string;
  expiry_date?: string;
  last_active?: string;
  // Extended registration details
  gender: string;
  ageCategory?: string;
  age_category?: string;
  bloodGroup?: string;
  blood_group?: string;
  profilePhoto?: string;
  varaWhatsappGroup?: string;
  vara_whatsapp_group?: boolean;
  companyName?: string;
  company_name?: string;
  jobTitle?: string;
  job_title?: string;
  visaStatus?: string;
  visa_status?: string;
  yearsInUAE?: string;
  years_in_uae?: number;
  monthsInUAE?: string;
  months_in_uae?: number;
  totalIndustryExperience?: string;
  total_industry_experience?: string;
  primaryAreaOfWork?: string;
  primary_area_of_work?: string;
  skillsets: string[];
  otherSkill?: string;
  other_skill?: string;
  portfolioLink?: string;
  portfolio_link?: string;
  linkedinLink?: string;
  linkedin_link?: string;
  behanceLink?: string;
  behance_link?: string;
  instagramLink?: string;
  instagram_link?: string;
  softwareAndTools?: string;
  software_and_tools?: string;
  interestedInVolunteering?: string | boolean;
  interested_in_volunteering?: boolean;
  volunteeringAreas?: string[];
  volunteering_areas?: string[];
  country: string;
  emirate: string;
  areaName?: string;
  area_name?: string;
  countryCode?: string;
  country_code?: string;
  contactNumber?: string;
  contact_number?: string;
  whatsappCountryCode?: string;
  whatsapp_country_code?: string;
  whatsappNumber?: string;
  whatsapp_number?: string;
  keralaDistrict?: string;
  kerala_district?: string;
  proceedWithMembershipFee?: string | boolean;
  proceed_with_membership_fee?: boolean;
  message?: string;
  created_at?: string;
  updated_at?: string;
  memberships?: Array<{
    id: string;
    membership_type_id: string;
    start_date: string;
    end_date: string;
    status: string;
    membership_types?: {
      id: string;
      name: string;
      description?: string;
    };
  }>;
}

interface MembershipProof {
  id: string;
  memberId: string;
  memberName: string;
  documentType: string;
  uploadDate: string;
  status: 'verified' | 'pending' | 'rejected';
  fileUrl: string;
}

interface PendingUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
  membership_applications?: Array<{
    id: string;
    full_name: string;
    gender: string;
    age_category: string;
    blood_group: string;
    vara_whatsapp_group: string;
    company_name: string;
    job_title: string;
    visa_status: string;
    years_in_uae: number;
    months_in_uae: number;
    total_industry_experience: string;
    primary_area_of_work: string;
    skillsets: string[];
    other_skill: string;
    portfolio_link: string;
    interested_in_volunteering: boolean;
    volunteering_areas: string[];
    country: string;
    emirate: string;
    area_name: string;
    country_code: string;
    contact_number: string;
    whatsapp_country_code: string;
    whatsapp_number: string;
    kerala_district: string;
    proceed_with_membership_fee: boolean;
    message: string;
    status: string;
    created_at: string;
    assigned_admin?: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

interface PendingMemberApplication {
  id: string;
  fullName: string;
  email: string;
  gender: string;
  ageCategory: string;
  bloodGroup: string;
  profilePhoto: string;
  varaWhatsappGroup: string;
  companyName: string;
  jobTitle: string;
  visaStatus: string;
  yearsInUAE: string;
  monthsInUAE: string;
  totalIndustryExperience: string;
  primaryAreaOfWork: string;
  skillsets: string[];
  otherSkill: string;
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
  countryCode: string;
  contactNumber: string;
  whatsappCountryCode: string;
  whatsappNumber: string;
  keralaDistrict: string;
  proceedWithMembershipFee: string;
  message: string;
  applicationDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface DashboardStat {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  icon: any;
}

interface IncomeRecord {
  id: string;
  source: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  status: 'received' | 'pending';
  paymentMode: string;
}

interface ExpenseRecord {
  id: string;
  category: string;
  vendor: string;
  description: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending';
  paymentMode: string;
}

interface BalanceSheetItem {
  category: string;
  label: string;
  amount: number;
  paymentMode: string;
  type: 'income' | 'expense';
}

  interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    registrationLink: string;
    status: 'draft' | 'published';
    createdAt: string;
    maxParticipants?: number;
    category: string;
    bannerImage?: string;
  }

  interface Announcement {
    id: string;
    title: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
    type: 'news' | 'alert' | 'update' | 'general';
    status: 'draft' | 'published';
    createdAt: string;
    expiryDate?: string;
    registrationLink?: string;
  }

  interface Job {
  id: string;
  jobTitle: string;
  description: string;
  role: string;
  companyName?: string;
  applicationLink: string;
  applyByDate: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  salary?: string;
  status: 'draft' | 'published';
  createdAt: string;
  applicants: JobApplicant[];
}

interface JobApplicant {
  id: string;
  jobId: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  appliedDate: string;
  status: 'applied' | 'shortlisted' | 'rejected' | 'hired';
  resumeLink?: string;
  coverLetter?: string;
}

interface Permission {
  id: string;
  module: string;
  label: string;
  description: string;
  icon: any;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Array of permission IDs
  createdAt: string;
  color: string;
}

interface BoardMember {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin';
  roleId?: string;
  assignedDate: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
}

// Admin Profile - will be fetched from database (initialized as empty)
const initialAdminProfile: AdminProfile = {
  name: '',
  email: '',
  phone: '',
  role: '',
  department: '',
  adminSince: '',
  memberId: '',
};

// Initial membership state
const initialMembership: Membership = {
  id: '',
  type: '',
  category: '',
  status: '',
  joinedDate: '',
  expiryDate: '',
  benefits: [],
};

// Member accounts - fetched from database
const mockAccounts: MemberAccount[] = [];

// Commented out since replaced with pending applications
/* const mockProofs: MembershipProof[] = [
  {
    id: 'PROOF-001',
    memberId: 'VARA-2024-001',
    memberName: 'John Anderson',
    documentType: 'ID Card',
    uploadDate: '2024-01-15',
    status: 'verified',
    fileUrl: '/uploads/proof1.jpg',
  },
  {
    id: 'PROOF-002',
    memberId: 'VARA-2024-002',
    memberName: 'Emma Rodriguez',
    documentType: 'Passport',
    uploadDate: '2024-01-20',
    status: 'pending',
    fileUrl: '/uploads/proof2.jpg',
  },
  {
    id: 'PROOF-003',
    memberId: 'VARA-2024-003',
    memberName: 'Michael Chen',
    documentType: 'Driver License',
    uploadDate: '2023-12-10',
    status: 'verified',
    fileUrl: '/uploads/proof3.jpg',
  },
  {
    id: 'PROOF-004',
    memberId: 'VARA-2024-005',
    memberName: 'David Park',
    documentType: 'ID Card',
    uploadDate: '2024-01-05',
    status: 'verified',
    fileUrl: '/uploads/proof4.jpg',
  },
]; */

// Pending applications - fetched from database
const mockPendingApplications: PendingMemberApplication[] = [];

const dashboardStats: DashboardStat[] = [];

// Income records - fetched from database
const mockIncomeRecords: IncomeRecord[] = [];

// Expense records - fetched from database
const mockExpenseRecords: ExpenseRecord[] = [];

// Balance Sheet data - fetched from database
const mockAssets: BalanceSheetItem[] = [];

const mockLiabilities: BalanceSheetItem[] = [];

// Vendor suggestions for expense form
const vendorSuggestions = [
  'Landlord Properties LLC',
  'DEWA',
  'ADDC',
  'Etisalat',
  'Du Telecom',
  'Grand Catering Services',
  'Print Pro UAE',
  'Social Media Solutions',
  'HostGator',
  'GoDaddy',
  'Amazon Web Services',
  'Microsoft Azure',
  'Google Workspace',
  'Zoom Communications',
  'Office Supplies Co.',
  'Transportation Services LLC',
  'Security Services UAE',
];

// Events - fetched from database
const mockEvents: Event[] = [];

// Announcements - fetched from database
const mockAnnouncements: Announcement[] = [];

// Jobs - fetched from database
const mockJobs: Job[] = [];

// RBAC Mock Data
const availablePermissions: Permission[] = [
  {
    id: 'accounts-income',
    module: 'accounts',
    label: 'Accounts - Income',
    description: 'View and manage income records',
    icon: ArrowUpCircle,
  },
  {
    id: 'accounts-expenses',
    module: 'accounts',
    label: 'Accounts - Expenses',
    description: 'View and manage expense records',
    icon: ArrowDownCircle,
  },
  {
    id: 'accounts-balance',
    module: 'accounts',
    label: 'Accounts - Balance Sheet',
    description: 'View balance sheet and financial reports',
    icon: BarChart3,
  },
  {
    id: 'membership-details',
    module: 'membership',
    label: 'Membership Details',
    description: 'View and manage member accounts',
    icon: CreditCard,
  },
  {
    id: 'membership-approvals',
    module: 'proofs',
    label: 'Membership Approvals',
    description: 'Approve or reject membership applications',
    icon: FileText,
  },
  {
    id: 'events-management',
    module: 'events',
    label: 'Events Management',
    description: 'Create and manage events',
    icon: Calendar,
  },
  {
    id: 'announcements-management',
    module: 'events',
    label: 'Announcements Management',
    description: 'Create and publish announcements',
    icon: Megaphone,
  },
];

// Roles - fetched from database
const mockRoles: Role[] = [];

// Board members - fetched from database
const mockBoardMembers: BoardMember[] = [];

// Navigation items
const adminNavItems = [
  { id: 'profile', label: 'Admin Profile', icon: Shield },
  { id: 'accounts', label: 'Accounts', icon: Wallet, hasDropdown: true },
  { id: 'membership', label: 'Membership Details', icon: CreditCard },
  { id: 'id-card', label: 'Varafied ID Card', icon: BadgeCheck },
  { id: 'proofs', label: 'Membership Approvals', icon: FileText },
  { id: 'events', label: 'Events Announcements', icon: Megaphone, hasDropdown: true },
  { id: 'jobs', label: 'Job Creation', icon: Briefcase },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const accountsDropdownItems = [
  { id: 'income', label: 'Income', icon: ArrowUpCircle },
  { id: 'expenses', label: 'Expenses', icon: ArrowDownCircle },
  { id: 'balance', label: 'Balance Sheet', icon: BarChart3 },
];

const eventsDropdownItems = [
  { id: 'events-list', label: 'Events', icon: Calendar },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  
  // Derive section from URL path
  const getPathSegments = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    // pathParts[0] will be 'user-admin', pathParts[1] will be the section
    const section = pathParts[1] || 'profile';
    const subsection = pathParts[2] || null;
    return { section, subsection };
  };
  
  const { section: urlSection, subsection: urlSubsection } = getPathSegments();
  const activeSection = urlSection;
  const accountsSubSection = activeSection === 'accounts' ? (urlSubsection || 'income') : 'income';
  const eventsSubSection = activeSection === 'events' ? (urlSubsection || 'events-list') : 'events-list';
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountsDropdownOpen, setAccountsDropdownOpen] = useState(activeSection === 'accounts');
  const [eventsDropdownOpen, setEventsDropdownOpen] = useState(activeSection === 'events');
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [selectedProof, setSelectedProof] = useState<MembershipProof | null>(null);
  const [selectedMember, setSelectedMember] = useState<MemberAccount | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<PendingMemberApplication | null>(null);
  const [selectedPendingUser, setSelectedPendingUser] = useState<PendingUser | null>(null);
  const [pendingApplications, setPendingApplications] = useState<PendingMemberApplication[]>(mockPendingApplications);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [memberAccounts, setMemberAccounts] = useState<MemberAccount[]>(mockAccounts);
  
  // Modal states
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showAddAnnouncementModal, setShowAddAnnouncementModal] = useState(false);
  
  // Search states
  const [membershipSearchTerm, setMembershipSearchTerm] = useState('');
  const [proofsSearchTerm, setProofsSearchTerm] = useState('');
  const [eventsSearchTerm, setEventsSearchTerm] = useState('');
  const [announcementsSearchTerm, setAnnouncementsSearchTerm] = useState('');
  const [incomeSearchTerm, setIncomeSearchTerm] = useState('');
  const [expensesSearchTerm, setExpensesSearchTerm] = useState('');
  const [jobsSearchTerm, setJobsSearchTerm] = useState('');
  
  // Payment mode states
  const [incomePaymentMode, setIncomePaymentMode] = useState('Cash');
  const [expensePaymentMode, setExpensePaymentMode] = useState('Cash');
  const [balancePaymentMode, setBalancePaymentMode] = useState('Cash');
  
  // Category and vendor states
  const [incomeCategory, setIncomeCategory] = useState('Membership Fees');
  const [expenseCategory, setExpenseCategory] = useState('Operations');
  const [vendorInput, setVendorInput] = useState('');
  
  // RBAC states
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>(mockBoardMembers);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showAddBoardMemberModal, setShowAddBoardMemberModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [showEditBoardMemberModal, setShowEditBoardMemberModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedBoardMember, setSelectedBoardMember] = useState<BoardMember | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<BoardMember | null>(null);
  const [rbacSearchTerm, setRbacSearchTerm] = useState('');
  
  // Admin assignment states
  const [adminSearchEmail, setAdminSearchEmail] = useState('');
  const [foundUser, setFoundUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [adminSearching, setAdminSearching] = useState(false);
  const [adminSearchError, setAdminSearchError] = useState('');
  const [selectedAdminRole, setSelectedAdminRole] = useState<'admin' | 'superadmin'>('admin');
  const [assigningAdminRole, setAssigningAdminRole] = useState(false);
  
  // Report states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState<'income' | 'expense' | 'balance' | 'membership' | 'approvals' | 'events' | 'announcements'>('income');
  const [reportPeriod, setReportPeriod] = useState<'today' | 'weekly' | 'monthly' | 'yearly' | 'custom'>('today');
  const [reportDropdownOpen, setReportDropdownOpen] = useState<string | null>(null);
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  
  // Status update states
  const [incomeStatusMenuOpen, setIncomeStatusMenuOpen] = useState<string | null>(null);
  const [expenseStatusMenuOpen, setExpenseStatusMenuOpen] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  
  // Form states
  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>(mockIncomeRecords);
  const [expenseRecords, setExpenseRecords] = useState<ExpenseRecord[]>(mockExpenseRecords);
  const [assets, setAssets] = useState<BalanceSheetItem[]>(mockAssets);
  const [liabilities, setLiabilities] = useState<BalanceSheetItem[]>(mockLiabilities);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  
  // Job states
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Admin profile state
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(initialAdminProfile);
  
  // Admin membership state
  const [membership, setMembership] = useState<Membership>(initialMembership);

  // Notification state
  const [notifications, setNotifications] = useState<any>({
    upcomingEvents: [],
    announcements: [],
    jobs: [],
    pendingMembers: null,
    pendingApprovals: { events: 0, jobs: 0, announcements: 0 }
  });
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Event banner preview state
  const [eventBannerPreview, setEventBannerPreview] = useState<string | null>(null);
  const [eventBannerFile, setEventBannerFile] = useState<File | null>(null);

  // Log selected member data for debugging
  useEffect(() => {
    if (selectedMember) {
      console.log('🎯 Selected Member Data:', selectedMember);
      console.log('Full Name:', selectedMember.full_name);
      console.log('Email:', selectedMember.email);
      console.log('Company:', selectedMember.company_name);
      console.log('Job Title:', selectedMember.job_title);
    }
  }, [selectedMember]);

  // Handle status update for income/expense records
  const handleStatusUpdate = async (recordId: string, currentType: 'income' | 'expense', newStatus: string) => {
    try {
      setStatusUpdating(recordId);
      const updateFunction = currentType === 'income' 
        ? adminAPI.updateIncomeRecord 
        : adminAPI.updateExpenseRecord;
      
      await updateFunction(recordId, { status: newStatus });
      
      // Update local state
      if (currentType === 'income') {
        setIncomeRecords(incomeRecords.map(record => 
          record.id === recordId ? { ...record, status: newStatus as any } : record
        ));
        setIncomeStatusMenuOpen(null);
      } else {
        setExpenseRecords(expenseRecords.map(record => 
          record.id === recordId ? { ...record, status: newStatus as any } : record
        ));
        setExpenseStatusMenuOpen(null);
      }
      
      const statusText = currentType === 'income' 
        ? (newStatus === 'received' ? 'marked as received' : 'marked as pending')
        : (newStatus === 'paid' ? 'marked as paid' : 'marked as pending');
      
      toast.success(`Record ${statusText} successfully`);
      console.log(`✅ Updated ${recordId} status to ${newStatus}`);
    } catch (error: any) {
      console.error(`❌ Failed to update status:`, error);
      toast.error('Failed to update record status');
    } finally {
      setStatusUpdating(null);
    }
  };

  // Calculate totals from records
  const calculateTotalIncome = () => {
    return incomeRecords.reduce((sum, record) => sum + (record.amount || 0), 0);
  };

  const calculateTotalExpense = () => {
    return expenseRecords.reduce((sum, record) => sum + (record.amount || 0), 0);
  };

  const calculateCategoryBreakdown = (records: any[], type: 'income' | 'expense') => {
    const breakdown: { [key: string]: number } = {};
    records.forEach(record => {
      const category = type === 'income' ? record.source : record.category;
      breakdown[category] = (breakdown[category] || 0) + (record.amount || 0);
    });
    return Object.entries(breakdown).map(([label, value]) => ({ label, value }));
  };

  // Calculate member statistics
  const calculateMemberStats = () => {
    const totalMembers = memberAccounts.length;
    const activeMembers = memberAccounts.length; // All in memberAccounts are active/approved
    const pendingMembers = pendingApplications.length + pendingUsers.length; // Awaiting approval
    
    return { totalMembers, activeMembers, pendingMembers };
  };

  // Download functions for reports
  const downloadCSV = () => {
    let headers: string[] = [];
    let rows: any[][] = [];

    switch (reportType) {
      case 'income':
        headers = ['ID', 'Source', 'Category', 'Amount (AED)', 'Date', 'Payment Mode', 'Status'];
        rows = incomeRecords.map(r => [r.id, r.source, r.category, r.amount, formatDate(r.date), r.paymentMode, r.status]);
        break;
      case 'expense':
        headers = ['ID', 'Category', 'Vendor', 'Amount ($)', 'Date', 'Payment Mode', 'Status'];
        rows = expenseRecords.map(r => [r.id, r.category, r.vendor || '-', r.amount, formatDate(r.date), r.paymentMode, r.status]);
        break;
      case 'membership':
        headers = ['ID', 'Name', 'Email', 'Membership Type', 'Status', 'Joined Date'];
        rows = memberAccounts.map(m => [
          m.id, 
          m.full_name || '', 
          m.email, 
          m.memberships?.[0]?.membership_types?.name || 'N/A', 
          m.memberships?.[0]?.status || 'N/A', 
          formatDate(m.date_joined || '')
        ]);
        break;
      case 'approvals':
        headers = ['ID', 'Name', 'Email', 'Job Title', 'Status', 'Applied Date'];
        rows = pendingApplications.map(a => [a.id, a.fullName, a.email, a.jobTitle, a.status, 'Jan 2026']);
        break;
      case 'events':
        headers = ['ID', 'Title', 'Date', 'Location', 'Attendees'];
        rows = events.map(e => [e.id, e.title, formatDate(e.date), e.location, '-']);
        break;
      case 'announcements':
        headers = ['ID', 'Title', 'Category', 'Posted By', 'Date'];
        rows = announcements.map(a => [a.id, a.title, a.type, 'Admin', formatDate(a.createdAt)]);
        break;
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const downloadExcel = () => {
    let data: any[] = [];
    let sheetName = '';

    switch (reportType) {
      case 'income':
        sheetName = 'Income Records';
        data = incomeRecords.map(r => ({
          'ID': r.id,
          'Source': r.source,
          'Category': r.category,
          'Amount (AED)': r.amount,
          'Date': formatDate(r.date),
          'Payment Mode': r.paymentMode,
          'Status': r.status
        }));
        break;
      case 'expense':
        sheetName = 'Expense Records';
        data = expenseRecords.map(r => ({
          'ID': r.id,
          'Category': r.category,
          'Vendor': r.vendor || '-',
          'Amount ($)': r.amount,
          'Date': formatDate(r.date),
          'Payment Mode': r.paymentMode,
          'Status': r.status
        }));
        break;
      case 'membership':
        sheetName = 'Membership';
        data = memberAccounts.map(m => ({
          'ID': m.id,
          'Name': m.full_name || '',
          'Email': m.email,
          'Membership Type': m.memberships?.[0]?.membership_types?.name || 'N/A',
          'Status': m.memberships?.[0]?.status || 'N/A',
          'Joined Date': formatDate(m.date_joined || '')
        }));
        break;
      case 'approvals':
        sheetName = 'Approvals';
        data = pendingApplications.map(a => ({
          'ID': a.id,
          'Name': a.fullName,
          'Email': a.email,
          'Job Title': a.jobTitle,
          'Status': a.status,
          'Applied Date': 'Jan 2026'
        }));
        break;
      case 'events':
        sheetName = 'Events';
        data = events.map(e => ({
          'ID': e.id,
          'Title': e.title,
          'Date': formatDate(e.date),
          'Location': e.location,
          'Attendees': '-'
        }));
        break;
      case 'announcements':
        sheetName = 'Announcements';
        data = announcements.map(a => ({
          'ID': a.id,
          'Title': a.title,
          'Category': a.type,
          'Posted By': 'Admin',
          'Date': formatDate(a.createdAt)
        }));
        break;
    }

    if (!data || data.length === 0) {
      toast.error('No data to download');
      return;
    }

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Set column widths
    const columnWidths = Object.keys(data[0]).map(() => ({ wch: 15 }));
    worksheet['!cols'] = columnWidths;

    // Write file
    const filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  // Log selected pending user data for debugging
  useEffect(() => {
    if (selectedPendingUser) {
      console.log('🔍 Selected Pending User:', selectedPendingUser);
      const app = selectedPendingUser.membership_applications?.[0];
      if (app) {
        console.log('  📋 Membership Application Details:');
        console.log('    Full Name:', app.full_name);
        console.log('    Gender:', app.gender);
        console.log('    Age Category:', app.age_category);
        console.log('    Blood Group:', app.blood_group);
        console.log('    Company:', app.company_name);
        console.log('    Job Title:', app.job_title);
        console.log('    Visa Status:', app.visa_status);
        console.log('    Years in UAE:', app.years_in_uae);
        console.log('    Months in UAE:', app.months_in_uae);
        console.log('    Primary Area:', app.primary_area_of_work);
        console.log('    Emirate:', app.emirate);
        console.log('    Contact Number:', app.contact_number);
        console.log('    WhatsApp Number:', app.whatsapp_number);
        console.log('    Skillsets:', app.skillsets);
        console.log('    Message:', app.message);
      } else {
        console.log('  ❌ No membership applications found!');
      }
    }
  }, [selectedPendingUser]);

  // Fetch data from API
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch all data in parallel
      const [
        adminProfileRes,
        membershipRes,
        membersRes,
        applicationsRes,
        incomeRes,
        expensesRes,
        eventsRes,
        announcementsRes,
        jobsRes,
        boardMembersRes,
        summaryRes,
        pendingUsersRes,
      ] = await Promise.allSettled([
        adminAPI.getProfile(),
        membersAPI.getProfile(), // Fetch admin's membership data
        membersAPI.getAll(),
        applicationsAPI.getAll({ status: 'pending' }),
        adminAPI.getIncomeRecords(),
        adminAPI.getExpenseRecords(),
        adminAPI.getEventsAdmin(), // Use admin endpoint to get all events (drafts + published)
        adminAPI.getAnnouncementsAdmin(), // Use admin endpoint to get all announcements
        adminAPI.getJobsAdmin(), // Use admin endpoint to get all jobs
        adminAPI.getBoardMembers(),
        adminAPI.getExpenseSummary(),
        authAPI.getPendingUsers(),
      ]);

      // Update admin profile
      if (adminProfileRes.status === 'fulfilled' && adminProfileRes.value.data?.data) {
        const profile = adminProfileRes.value.data.data;
        setAdminProfile({
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          role: profile.role || '',
          department: profile.department || '',
          adminSince: (() => { const d = profile.admin_since || profile.user_created_at; return d ? new Date(d).getFullYear().toString() : 'N/A'; })(),
          memberId: profile.member_id || '',
        });
        console.log('✅ Admin profile loaded:', profile);
      }

      // Update admin membership
      if (membershipRes.status === 'fulfilled' && membershipRes.value.data?.data) {
        const memberData = membershipRes.value.data.data;
        if (memberData.memberships && Array.isArray(memberData.memberships) && memberData.memberships.length > 0) {
          const activeMembership = memberData.memberships[0];
          setMembership({
            id: activeMembership.id || '',
            type: activeMembership.membership_types?.name || '',
            category: activeMembership.membership_types?.category || '',
            status: activeMembership.status || 'pending',
            joinedDate: activeMembership.joined_date || '',
            expiryDate: activeMembership.expiry_date || '',
            benefits: activeMembership.membership_types?.benefits || [],
          });
          // Update adminProfile with memberId if available
          setAdminProfile(prev => ({
            ...prev,
            memberId: memberData.member_id || prev.memberId,
          }));
        }
        console.log('✅ Admin membership loaded:', memberData);
      }

      // Update members
      if (membersRes.status === 'fulfilled' && membersRes.value.data?.data) {
        setMemberAccounts(membersRes.value.data.data);
      }

      // Update pending applications with proper transformation and deduplication
      if (applicationsRes.status === 'fulfilled' && applicationsRes.value.data?.data) {
        // Deduplicate by email - keep only the latest application
        const uniqueAppsMap = new Map<string, any>();
        
        // Sort by date descending to keep the most recent
        const sortedApps = (applicationsRes.value.data.data || []).sort((a: any, b: any) => {
          const dateA = new Date(a.application_date || a.created_at || 0).getTime();
          const dateB = new Date(b.application_date || b.created_at || 0).getTime();
          return dateB - dateA;
        });

        // Keep only the first (most recent) entry for each email
        sortedApps.forEach((app: any) => {
          const email = (app.email || '').toLowerCase();
          if (!uniqueAppsMap.has(email)) {
            uniqueAppsMap.set(email, app);
          }
        });

        console.log(`📊 Applications deduplication: ${sortedApps.length} total → ${uniqueAppsMap.size} unique`);

        const transformedApps = Array.from(uniqueAppsMap.values()).map((app: any) => ({
          id: app.id || app.application_id || `app-${Math.random()}`,
          fullName: app.full_name || app.fullName || '',
          email: app.email || '',
          gender: app.gender || '',
          ageCategory: app.age_category || app.ageCategory || '',
          bloodGroup: app.blood_group || app.bloodGroup || '',
          profilePhoto: app.profile_photo_url || app.profilePhoto || '',
          varaWhatsappGroup: app.vara_whatsapp_group || app.varaWhatsappGroup || false,
          companyName: app.company_name || app.companyName || '',
          jobTitle: app.job_title || app.jobTitle || '',
          visaStatus: app.visa_status || app.visaStatus || '',
          yearsInUAE: app.years_in_uae || app.yearsInUAE || 0,
          monthsInUAE: app.months_in_uae || app.monthsInUAE || 0,
          totalIndustryExperience: app.total_industry_experience || app.totalIndustryExperience || '',
          primaryAreaOfWork: app.primary_area_of_work || app.primaryAreaOfWork || '',
          skillsets: app.skillsets || [],
          otherSkill: app.other_skill || app.otherSkill || '',
          portfolioLink: app.portfolio_link || app.portfolioLink || '',
          linkedinLink: app.linkedin_link || app.linkedinLink || '',
          behanceLink: app.behance_link || app.behanceLink || '',
          instagramLink: app.instagram_link || app.instagramLink || '',
          softwareAndTools: app.software_and_tools || app.softwareAndTools || '',
          interestedInVolunteering: app.interested_in_volunteering ? 'Yes' : (app.interestedInVolunteering || 'No'),
          volunteeringAreas: app.volunteering_areas || app.volunteeringAreas || [],
          country: app.country || '',
          emirate: app.emirate || '',
          areaName: app.area_name || app.areaName || '',
          countryCode: app.country_code || app.countryCode || '',
          contactNumber: app.contact_number || app.contactNumber || '',
          whatsappCountryCode: app.whatsapp_country_code || app.whatsappCountryCode || '',
          whatsappNumber: app.whatsapp_number || app.whatsappNumber || '',
          keralaDistrict: app.kerala_district || app.keralaDistrict || '',
          proceedWithMembershipFee: app.proceed_with_membership_fee ? 'Yes' : (app.proceedWithMembershipFee || 'No'),
          message: app.message || '',
          applicationDate: app.application_date || app.applicationDate || '',
          status: app.status || 'pending',
        }));
        setPendingApplications(transformedApps);
      }

      // Update income records - now using adminAPI
      if (incomeRes.status === 'fulfilled' && incomeRes.value.data?.data) {
        const formattedIncomeRecords = incomeRes.value.data.data.map((record: any) => ({
          id: record.id,
          source: record.source,
          category: record.source, // Using source as category since it's in the table
          description: record.description || '',
          amount: record.amount_aed,
          date: record.date,
          status: record.status,
          paymentMode: record.payment_mode,
        }));
        setIncomeRecords(formattedIncomeRecords);
      }

      // Update expense records
      if (expensesRes.status === 'fulfilled' && expensesRes.value.data?.data) {
        const formattedExpenseRecords = expensesRes.value.data.data.map((record: any) => ({
          id: record.id,
          category: record.category_id ? `Category-${record.category_id}` : 'Uncategorized',
          vendor: record.vendor_id ? `Vendor-${record.vendor_id}` : 'Unknown',
          description: record.description || '',
          amount: record.amount_aed,
          date: record.date,
          status: record.status,
          paymentMode: record.payment_mode,
        }));
        setExpenseRecords(formattedExpenseRecords);
      }

      // Update pending users (account approvals)
      if (pendingUsersRes.status === 'fulfilled' && pendingUsersRes.value.data?.data) {
        console.log('📥 Pending users received:', pendingUsersRes.value.data.data);
        if (pendingUsersRes.value.data.data.length > 0) {
          const firstUser = pendingUsersRes.value.data.data[0];
          console.log('👤 First pending user:');
          console.log('  ID:', firstUser.id);
          console.log('  Name:', firstUser.name);
          console.log('  Email:', firstUser.email);
          console.log('  Applications:', firstUser.membership_applications?.length || 0);
          if (firstUser.membership_applications && firstUser.membership_applications.length > 0) {
            const app = firstUser.membership_applications[0];
            console.log('  📋 First application:');
            console.log('    Full Name:', app.full_name);
            console.log('    Gender:', app.gender);
            console.log('    Company:', app.company_name);
            console.log('    Job Title:', app.job_title);
            console.log('    Contact:', app.contact_number);
            console.log('    WhatsApp:', app.whatsapp_number);
          }
        }
        setPendingUsers(pendingUsersRes.value.data.data);
      }

      // Update events - map snake_case to camelCase
      if (eventsRes.status === 'fulfilled' && eventsRes.value.data?.data) {
        const transformedEvents = eventsRes.value.data.data.map((event: any) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          time: event.time,
          location: event.location,
          registrationLink: event.registration_link,
          maxParticipants: event.max_participants,
          category: event.category,
          bannerImage: event.banner_image,
          status: event.status,
          type: event.type,
          createdAt: event.created_at,
        }));
        setEvents(transformedEvents);
      }

      // Update announcements
      if (announcementsRes.status === 'fulfilled' && announcementsRes.value.data?.data) {
        const transformedAnnouncements = announcementsRes.value.data.data.map((announcement: any) => ({
          id: announcement.id,
          title: announcement.title,
          message: announcement.message,
          priority: announcement.priority,
          type: announcement.type,
          status: announcement.status,
          createdAt: announcement.created_at,
          expiryDate: announcement.expiry_date,
          registrationLink: announcement.registration_link,
        }));
        setAnnouncements(transformedAnnouncements);
      }

      // Update jobs
      if (jobsRes.status === 'fulfilled' && jobsRes.value.data?.data) {
        const transformedJobs = jobsRes.value.data.data.map((job: any) => ({
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
          applicants: []
        }));
        setJobs(transformedJobs);
      }

      // Update board members
      if (boardMembersRes.status === 'fulfilled' && boardMembersRes.value.data?.data) {
        setBoardMembers(boardMembersRes.value.data.data);
      }

      // Update dashboard stats from summary
      if (summaryRes.status === 'fulfilled' && summaryRes.value.data?.data) {
        const membersCount = membersRes.status === 'fulfilled' ? (membersRes.value.data?.data?.length || 0) : 0;
        const pendingAppCount = applicationsRes.status === 'fulfilled' ? (applicationsRes.value.data?.data?.length || 0) : 0;
        const pendingUserCount = pendingUsersRes.status === 'fulfilled' ? (pendingUsersRes.value.data?.data?.length || 0) : 0;
        const totalPending = pendingAppCount + pendingUserCount;
        
        console.log('📊 Dashboard Stats Updated:', { totalMembers: membersCount, activeMembers: membersCount, pendingMembers: totalPending });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Fetch role-based notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      setNotificationsLoading(true);
      try {
        const response = await adminAPI.getRoleBasedNotifications();
        if (response.data?.data) {
          setNotifications(response.data.data);
          console.log('✅ Notifications fetched:', response.data.data);
        }
      } catch (error: any) {
        console.error('❌ Error fetching notifications:', error);
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Handle default route - redirect to profile if at base path
  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    // If at /user-admin with no section, redirect to profile
    if (pathParts.length === 1 && pathParts[0] === 'user-admin') {
      navigate('/user-admin/profile', { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'verified':
        return isDarkMode
          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
        return isDarkMode
          ? 'bg-amber-500/15 text-amber-400 border-amber-500/20'
          : 'bg-amber-50 text-amber-700 border-amber-200';
      case 'rejected':
        return isDarkMode
          ? 'bg-red-500/15 text-red-400 border-red-500/20'
          : 'bg-red-50 text-red-700 border-red-200';
      default:
        return isDarkMode
          ? 'bg-gray-500/15 text-gray-400 border-gray-500/20'
          : 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Handler functions for adding records
  const handleAddIncome = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const paymentMode = formData.get('paymentMode') as string;
    
    const categoryValue = formData.get('category') as string;
    const customCategory = formData.get('customCategory') as string;
    const finalCategory = categoryValue === 'Custom' ? customCategory : categoryValue;
    
    try {
      const incomeData = {
        source: formData.get('source') as string,
        description: formData.get('description') as string,
        amount_aed: Number(formData.get('amount')),
        date: formData.get('date') as string,
        status: formData.get('status') as 'received' | 'pending',
        payment_mode: paymentMode,
      };

      console.log('📋 Form Data Collected:', incomeData);

      // Validate required fields
      if (!incomeData.source || !incomeData.description || !incomeData.amount_aed || !incomeData.date || !incomeData.status || !incomeData.payment_mode) {
        console.error('❌ Validation Failed - Missing fields:', {
          source: incomeData.source,
          description: incomeData.description,
          amount_aed: incomeData.amount_aed,
          date: incomeData.date,
          status: incomeData.status,
          payment_mode: incomeData.payment_mode,
        });
        toast.error('Please fill in all required fields');
        return;
      }

      console.log('✅ Validation Passed - Sending to API...');
      console.log('📤 API Request Payload:', JSON.stringify(incomeData, null, 2));

      const response = await adminAPI.createIncomeRecord(incomeData);
      
      console.log('📥 API Response:', response);
      console.log('Response Status:', response.status);
      console.log('Response Data:', response.data);
      
      if (response.data.success) {
        console.log('✅ Income Record Created Successfully');
        const newIncome: IncomeRecord = {
          id: response.data.data.id || `INC-${String(incomeRecords.length + 1).padStart(3, '0')}`,
          source: incomeData.source,
          category: finalCategory,
          description: incomeData.description,
          amount: incomeData.amount_aed,
          date: incomeData.date,
          status: incomeData.status,
          paymentMode: paymentMode,
        };
        setIncomeRecords([newIncome, ...incomeRecords]);
        setShowAddIncomeModal(false);
        setIncomePaymentMode('Cash');
        setIncomeCategory('Membership Fees');
        toast.success('Income record added successfully!');
      } else {
        console.error('❌ API returned success:false', response.data);
        toast.error(response.data.message || 'Failed to add income record');
      }
    } catch (error: any) {
      console.error('❌ Error adding income:', error);
      console.error('Error Message:', error.message);
      console.error('Error Response:', error.response);
      console.error('Error Response Data:', error.response?.data);
      console.error('Error Response Status:', error.response?.status);
      console.error('Error Response Headers:', error.response?.headers);
      
      const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Failed to add income record';
      toast.error(errorMessage);
    }
  };

  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const paymentMode = formData.get('paymentMode') as string;
    
    const categoryValue = formData.get('category') as string;
    const customCategory = formData.get('customCategory') as string;
    const finalCategory = categoryValue === 'Custom' ? customCategory : categoryValue;
    
    try {
      const expenseData = {
        description: formData.get('description') as string,
        amount_aed: Number(formData.get('amount')),
        date: formData.get('date') as string,
        status: formData.get('status') as 'paid' | 'pending',
        payment_mode: paymentMode,
      };

      console.log('📋 Form Data Collected:', expenseData);

      // Validate required fields
      if (!expenseData.description || !expenseData.amount_aed || !expenseData.date || !expenseData.status || !expenseData.payment_mode) {
        console.error('❌ Validation Failed - Missing fields:', {
          description: expenseData.description,
          amount_aed: expenseData.amount_aed,
          date: expenseData.date,
          status: expenseData.status,
          payment_mode: expenseData.payment_mode,
        });
        toast.error('Please fill in all required fields');
        return;
      }

      console.log('✅ Validation Passed - Sending to API...');
      console.log('📤 API Request Payload:', JSON.stringify(expenseData, null, 2));

      const response = await adminAPI.createExpenseRecord(expenseData);
      
      console.log('📥 API Response:', response);
      console.log('Response Status:', response.status);
      console.log('Response Data:', response.data);
      
      if (response.data.success) {
        console.log('✅ Expense Record Created Successfully');
        const newExpense: ExpenseRecord = {
          id: response.data.data.id || `EXP-${String(expenseRecords.length + 1).padStart(3, '0')}`,
          category: finalCategory,
          vendor: formData.get('vendor') as string,
          description: expenseData.description,
          amount: expenseData.amount_aed,
          date: expenseData.date,
          status: expenseData.status,
          paymentMode: paymentMode,
        };
        setExpenseRecords([newExpense, ...expenseRecords]);
        setShowAddExpenseModal(false);
        setExpensePaymentMode('Cash');
        setExpenseCategory('Operations');
        setVendorInput('');
        toast.success('Expense record added successfully!');
      } else {
        console.error('❌ API returned success:false', response.data);
        toast.error(response.data.message || 'Failed to add expense record');
      }
    } catch (error: any) {
      console.error('❌ Error adding expense:', error);
      console.error('Error Message:', error.message);
      console.error('Error Response:', error.response);
      console.error('Error Response Data:', error.response?.data);
      console.error('Error Response Status:', error.response?.status);
      console.error('Error Response Headers:', error.response?.headers);
      
      const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Failed to add expense record';
      toast.error(errorMessage);
    }
  };

  const handleAddBalanceEntry = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const type = formData.get('type') as 'income' | 'expense';
    const category = formData.get('category') as string;
    const label = formData.get('label') as string;
    const amount = Number(formData.get('amount'));
    const paymentModeValue = formData.get('paymentMode') as string;
    const customPaymentMode = formData.get('customPaymentMode') as string;
    const finalPaymentMode = paymentModeValue === 'Others' ? customPaymentMode : paymentModeValue;
    
    const newItem: BalanceSheetItem = { 
      category, 
      label, 
      amount, 
      paymentMode: finalPaymentMode,
      type 
    };
    
    if (type === 'income') {
      setAssets([...assets, newItem]);
    } else {
      setLiabilities([...liabilities, newItem]);
    }
    setShowAddBalanceModal(false);
    setBalancePaymentMode('Cash');
  };

  const handleAddEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const eventData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        date: formData.get('date') as string,
        time: formData.get('time') as string,
        location: formData.get('location') as string,
        registration_link: formData.get('registrationLink') as string,
        max_participants: formData.get('maxParticipants') ? Number(formData.get('maxParticipants')) : null,
        category: formData.get('category') as string,
        status: 'draft', // Create as draft, can be published later
        type: 'upcoming',
      };

      console.log('📤 Creating event:', eventData);
      const response = await adminAPI.createEvent(eventData);
      console.log('✅ Event created successfully:', response.data);
      
      const eventId = response.data.data.id;
      let bannerUrl = null;

      // Upload banner if selected
      if (eventBannerFile) {
        try {
          console.log('📸 Uploading event banner...');
          const bannerFormData = new FormData();
          bannerFormData.append('eventBanner', eventBannerFile);

          const token = localStorage.getItem('token');
          const bannerResponse = await fetch(`${API_URL}/admin/events/${eventId}/banner`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: bannerFormData,
          });

          if (!bannerResponse.ok) {
            throw new Error('Failed to upload banner');
          }

          const bannerData = await bannerResponse.json();
          bannerUrl = bannerData.data.banner_image;
          console.log('✅ Banner uploaded:', bannerUrl);
        } catch (bannerError) {
          console.error('⚠️ Banner upload failed:', bannerError);
          toast.error('Event created but banner upload failed');
        }
      }

      // Add to local state
      const createdEvent: Event = {
        id: eventId,
        title: eventData.title,
        description: eventData.description || '',
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        registrationLink: eventData.registration_link || '',
        maxParticipants: eventData.max_participants || undefined,
        category: eventData.category,
        bannerImage: bannerUrl || undefined,
        status: 'draft',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setEvents([createdEvent, ...events]);
      
      // Show success notification
      toast.success('Event created successfully!');
      
      setShowAddEventModal(false);
      setEventBannerPreview(null);
      setEventBannerFile(null);
    } catch (error: any) {
      console.error('❌ Error creating event:', error);
      toast.error(error.response?.data?.message || 'Failed to create event');
    }
  };

  const handlePublishEvent = async (eventId: string) => {
    try {
      console.log('📤 Publishing event:', eventId);
      await adminAPI.updateEvent(eventId, { status: 'published' });
      
      // Update local state
      setEvents(events.map(event => 
        event.id === eventId ? { ...event, status: 'published' } : event
      ));
      
      toast.success('Event published successfully!');
    } catch (error: any) {
      console.error('❌ Error publishing event:', error);
      toast.error(error.response?.data?.message || 'Failed to publish event');
    }
  };

  const handleAddAnnouncement = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const announcementData = {
        title: formData.get('title') as string,
        message: formData.get('message') as string,
        priority: formData.get('priority') as 'high' | 'medium' | 'low',
        type: formData.get('type') as 'news' | 'alert' | 'update' | 'general',
        expiry_date: formData.get('expiryDate') as string || null,
        status: 'draft',
        date: new Date().toISOString().split('T')[0], // Add current date
        content: formData.get('message') as string, // Announcements table uses 'content' field
      };

      console.log('📤 Creating announcement:', announcementData);
      const response = await adminAPI.createAnnouncement(announcementData);
      console.log('✅ Announcement created successfully:', response.data);

      // Add to local state - transform database fields to frontend interface
      const apiData = response.data.data;
      const createdAnnouncement: Announcement = {
        id: apiData.id,
        title: apiData.title,
        message: apiData.message,
        priority: apiData.priority,
        type: apiData.type,
        expiryDate: apiData.expiry_date || undefined,
        status: apiData.status,
        createdAt: apiData.created_at || new Date().toISOString().split('T')[0],
        registrationLink: apiData.registration_link || undefined,
      };
      setAnnouncements([createdAnnouncement, ...announcements]);
      
      toast.success('Announcement created successfully!');
      setShowAddAnnouncementModal(false);
    } catch (error: any) {
      console.error('❌ Error creating announcement:', error);
      toast.error(error.response?.data?.message || 'Failed to create announcement');
    }
  };

  const handlePublishAnnouncement = async (announcementId: string) => {
    try {
      console.log('📤 Publishing announcement:', announcementId);
      await adminAPI.updateAnnouncement(announcementId, { status: 'published' });
      
      // Update local state
      setAnnouncements(announcements.map(announcement => 
        announcement.id === announcementId ? { ...announcement, status: 'published' } : announcement
      ));
      
      toast.success('Announcement published successfully!');
    } catch (error: any) {
      console.error('❌ Error publishing announcement:', error);
      toast.error(error.response?.data?.message || 'Failed to publish announcement');
    }
  };

  // Job Handlers
  const handleAddJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const jobData = {
        job_title: formData.get('jobTitle') as string,
        description: formData.get('description') as string,
        role: formData.get('role') as string,
        application_link: formData.get('applicationLink') as string,
        apply_by_date: formData.get('applyByDate') as string,
        location: formData.get('location') as string,
        employment_type: formData.get('employmentType') as string,
        experience_level: formData.get('experienceLevel') as string,
        salary: formData.get('salary') as string || null,
        status: 'published'
      };

      console.log('📤 Creating job:', jobData);
      const response = await adminAPI.createJob(jobData);
      console.log('✅ Job created successfully:', response.data);

      // Transform API response to frontend interface
      const apiData = response.data.data;
      const createdJob: Job = {
        id: apiData.id,
        jobTitle: apiData.job_title,
        description: apiData.description,
        role: apiData.role,
        applicationLink: apiData.application_link,
        applyByDate: apiData.apply_by_date,
        location: apiData.location,
        employmentType: apiData.employment_type,
        experienceLevel: apiData.experience_level,
        salary: apiData.salary,
        status: apiData.status,
        createdAt: apiData.created_at || new Date().toISOString().split('T')[0],
        applicants: []
      };
      
      setJobs([createdJob, ...jobs]);
      toast.success('Job created successfully!');
      setShowAddJobModal(false);
    } catch (error: any) {
      console.error('❌ Error creating job:', error);
      toast.error(error.response?.data?.message || 'Failed to create job');
    }
  };

  const handlePublishJob = async (jobId: string) => {
    try {
      console.log('📤 Publishing job:', jobId);
      await adminAPI.updateJob(jobId, { status: 'published' });
      
      // Update local state
      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, status: 'published' } : job
      ));
      
      toast.success('Job published successfully!');
    } catch (error: any) {
      console.error('❌ Error publishing job:', error);
      toast.error(error.response?.data?.message || 'Failed to publish job');
    }
  };

  // Membership Application Handlers
  const handleApproveApplication = (applicationId: string) => {
    const application = pendingApplications.find(app => app.id === applicationId);
    if (!application) return;

    // Update application status
    setPendingApplications(pendingApplications.map(app =>
      app.id === applicationId ? { ...app, status: 'approved' } : app
    ));

    // Create new member account with all registration details
    const newMember: MemberAccount = {
      id: `VARA-2026-${String(memberAccounts.length + 1).padStart(3, '0')}`,
      full_name: application.fullName,
      email: application.email,
      member_id: `VARA-2026-${String(memberAccounts.length + 1).padStart(3, '0')}`,
      date_joined: new Date().toISOString().split('T')[0],
      expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      phone: `${application.countryCode} ${application.contactNumber}`,
      last_active: new Date().toISOString().split('T')[0],
      // All registration details
      gender: application.gender,
      ageCategory: application.ageCategory,
      bloodGroup: application.bloodGroup,
      profilePhoto: application.profilePhoto,
      varaWhatsappGroup: application.varaWhatsappGroup,
      companyName: application.companyName,
      jobTitle: application.jobTitle,
      visaStatus: application.visaStatus,
      yearsInUAE: application.yearsInUAE,
      monthsInUAE: application.monthsInUAE,
      totalIndustryExperience: application.totalIndustryExperience,
      primaryAreaOfWork: application.primaryAreaOfWork,
      skillsets: application.skillsets,
      otherSkill: application.otherSkill,
      portfolioLink: application.portfolioLink,
      linkedinLink: application.linkedinLink,
      behanceLink: application.behanceLink,
      instagramLink: application.instagramLink,
      softwareAndTools: application.softwareAndTools,
      interestedInVolunteering: application.interestedInVolunteering,
      volunteeringAreas: application.volunteeringAreas,
      country: application.country,
      emirate: application.emirate,
      areaName: application.areaName,
      countryCode: application.countryCode,
      contactNumber: application.contactNumber,
      whatsappCountryCode: application.whatsappCountryCode,
      whatsappNumber: application.whatsappNumber,
      keralaDistrict: application.keralaDistrict,
      proceedWithMembershipFee: application.proceedWithMembershipFee,
      message: application.message,
    };
    
    setMemberAccounts([...memberAccounts, newMember]);
    setSelectedApplication(null);
  };

  const handleRejectApplication = (applicationId: string) => {
    // Update application status to rejected
    setPendingApplications(pendingApplications.map(app =>
      app.id === applicationId ? { ...app, status: 'rejected' } : app
    ));
    
    setSelectedApplication(null);
  };

  // RBAC Handler Functions
  const handleAddRole = (newRole: Omit<Role, 'id' | 'createdAt'>) => {
    const role: Role = {
      ...newRole,
      id: `role-${roles.length + 1}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setRoles([...roles, role]);
    setShowAddRoleModal(false);
  };

  const handleEditRole = (roleId: string, updatedRole: Partial<Role>) => {
    setRoles(roles.map(role => 
      role.id === roleId ? { ...role, ...updatedRole } : role
    ));
    setShowEditRoleModal(false);
    setSelectedRole(null);
  };

  const handleAddBoardMember = async () => {
    if (!foundUser) {
      setAdminSearchError('Please search and select a user first');
      return;
    }
    
    if (!selectedAdminRole) {
      setAdminSearchError('Please select a role');
      return;
    }

    setAssigningAdminRole(true);
    setAdminSearchError('');

    try {
      // Call API to assign admin role
      await adminAPI.assignAdminRole(foundUser.id, selectedAdminRole);
      
      // Add to board members list
      const newMember: BoardMember = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: selectedAdminRole,
        status: 'active',
        assignedDate: new Date().toISOString().split('T')[0],
      };
      
      setBoardMembers([...boardMembers.filter(m => m.email !== foundUser.email), newMember]);
      
      // Reset form
      setShowAddBoardMemberModal(false);
      setAdminSearchEmail('');
      setFoundUser(null);
      setSelectedAdminRole('admin');
      
      toast.success(`✅ ${foundUser.name} assigned as ${selectedAdminRole}!`);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to assign admin role';
      setAdminSearchError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setAssigningAdminRole(false);
    }
  };

  const handleSearchUserByEmail = async () => {
    if (!adminSearchEmail.trim()) {
      setAdminSearchError('Please enter an email address');
      return;
    }

    setAdminSearching(true);
    setAdminSearchError('');
    setFoundUser(null);

    try {
      const response = await adminAPI.searchUsersByEmail(adminSearchEmail);
      if (response.data?.data) {
        setFoundUser(response.data.data);
      } else {
        setAdminSearchError('User not found. Please check the email address.');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'User not found';
      setAdminSearchError(errorMsg);
    } finally {
      setAdminSearching(false);
    }
  };

  const handleEditBoardMember = (memberId: string, updatedMember: Partial<BoardMember>) => {
    setBoardMembers(boardMembers.map(member => 
      member.id === memberId ? { ...member, ...updatedMember } : member
    ));
    setShowEditBoardMemberModal(false);
    setSelectedBoardMember(null);
  };

  // Removed unused filteredAccounts variable

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
            <div className="absolute inset-0 rounded-full border-2 border-t-white/80 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border border-white/5"></div>
          </div>
          <p className="text-white/60 text-sm font-light tracking-wide">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex overflow-x-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#0B0D10]' : 'bg-[#f8fafc]'}`}>
      {/* Premium Multi-Layer Background Effects - Admin */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Base Gradient Layer */}
        <div className={`absolute inset-0 ${isDarkMode 
          ? 'bg-gradient-to-br from-[#0d0a1a] via-[#0B0D10] to-[#0a0f14]' 
          : 'bg-gradient-to-br from-violet-50/70 via-slate-50 to-cyan-50/50'}`}></div>
        
        {/* Animated Gradient Orbs - Dark Mode (Admin-specific purple/blue theme) */}
        {isDarkMode && (
          <>
            <div className="absolute top-[-15%] left-[-8%] w-[750px] h-[750px] bg-gradient-to-br from-violet-700/20 via-purple-600/12 to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute top-[25%] right-[-12%] w-[650px] h-[650px] bg-gradient-to-bl from-indigo-500/18 via-blue-600/10 to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.2s' }}></div>
            <div className="absolute bottom-[-12%] left-[10%] w-[580px] h-[580px] bg-gradient-to-tr from-cyan-500/15 via-teal-600/8 to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2.4s' }}></div>
            <div className="absolute top-[55%] left-[45%] w-[450px] h-[450px] bg-gradient-to-r from-fuchsia-500/12 via-pink-500/6 to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '0.8s' }}></div>
            <div className="absolute top-[10%] left-[60%] w-[350px] h-[350px] bg-gradient-to-bl from-emerald-500/10 via-green-500/5 to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.8s' }}></div>
            
            {/* Admin Mesh Gradient Overlay */}
            <div className="absolute inset-0 opacity-35" style={{
              backgroundImage: `radial-gradient(at 20% 30%, rgba(139, 92, 246, 0.18) 0px, transparent 50%),
                               radial-gradient(at 85% 15%, rgba(99, 102, 241, 0.12) 0px, transparent 50%),
                               radial-gradient(at 5% 65%, rgba(168, 85, 247, 0.14) 0px, transparent 50%),
                               radial-gradient(at 75% 55%, rgba(6, 182, 212, 0.1) 0px, transparent 50%),
                               radial-gradient(at 35% 85%, rgba(236, 72, 153, 0.08) 0px, transparent 50%),
                               radial-gradient(at 90% 85%, rgba(34, 197, 94, 0.08) 0px, transparent 50%)`
            }}></div>
            
            {/* Subtle Dot Pattern */}
            <div className="absolute inset-0 opacity-[0.015]" style={{
              backgroundImage: `radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)`,
              backgroundSize: '24px 24px'
            }}></div>
            
            {/* Diagonal Lines Accent */}
            <div className="absolute inset-0 opacity-[0.02]" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(139, 92, 246, 0.1) 35px, rgba(139, 92, 246, 0.1) 36px)`
            }}></div>
          </>
        )}
        
        {/* Light Mode Background Effects - Admin */}
        {!isDarkMode && (
          <>
            <div className="absolute top-[-8%] left-[-3%] w-[650px] h-[650px] bg-gradient-to-br from-violet-200/50 via-purple-100/35 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute top-[15%] right-[-8%] w-[550px] h-[550px] bg-gradient-to-bl from-indigo-200/40 via-blue-100/30 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-8%] left-[25%] w-[500px] h-[500px] bg-gradient-to-tr from-cyan-200/35 via-teal-100/25 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute top-[45%] right-[15%] w-[380px] h-[380px] bg-gradient-to-l from-fuchsia-200/30 via-pink-100/20 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-[25%] left-[5%] w-[420px] h-[420px] bg-gradient-to-tr from-emerald-200/25 via-green-100/15 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute top-[5%] left-[40%] w-[300px] h-[300px] bg-gradient-to-b from-amber-200/20 via-orange-100/10 to-transparent rounded-full blur-3xl"></div>
            
            {/* Light Mode Admin Mesh Gradient */}
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(at 25% 25%, rgba(139, 92, 246, 0.1) 0px, transparent 50%),
                               radial-gradient(at 75% 15%, rgba(99, 102, 241, 0.08) 0px, transparent 50%),
                               radial-gradient(at 15% 70%, rgba(168, 85, 247, 0.08) 0px, transparent 50%),
                               radial-gradient(at 85% 50%, rgba(6, 182, 212, 0.06) 0px, transparent 50%),
                               radial-gradient(at 45% 90%, rgba(236, 72, 153, 0.05) 0px, transparent 50%)`
            }}></div>
            
            {/* Light Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.35]" style={{
              backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px)`,
              backgroundSize: '48px 48px'
            }}></div>
          </>
        )}
        
        {/* Top Gradient Fade */}
        <div className={`absolute top-0 left-0 right-0 h-40 ${isDarkMode 
          ? 'bg-gradient-to-b from-[#0B0D10] to-transparent' 
          : 'bg-gradient-to-b from-white/60 to-transparent'}`}></div>
        
        {/* Bottom Gradient Fade */}
        <div className={`absolute bottom-0 left-0 right-0 h-24 ${isDarkMode 
          ? 'bg-gradient-to-t from-[#0B0D10]/50 to-transparent' 
          : 'bg-gradient-to-t from-slate-100/50 to-transparent'}`}></div>
      </div>

      {/* Left Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-72 z-50 flex flex-col transition-all duration-300 ${isDarkMode ? 'bg-[#0c0c0e]/95 border-r border-white/[0.08]' : 'bg-white/95 border-r border-gray-200'} backdrop-blur-xl ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Logo Section */}
        <div className={`flex items-center gap-3 px-6 py-5 border-b ${isDarkMode ? 'border-white/[0.08]' : 'border-gray-200'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-white/10' : 'bg-gray-900'}`}>
            <img 
              src="/Images/image logo.png" 
              alt="VARA Logo" 
              className="h-6 w-auto"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xl font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>VARA</span>
            <span className={`text-xs px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-700'}`}>Admin</span>
          </div>
        </div>

        {/* Admin Profile Section */}
        <div className={`px-4 py-5 border-b ${isDarkMode ? 'border-white/[0.08]' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-br from-violet-500/30 to-purple-500/10 ring-1 ring-white/10' : 'bg-gray-900'}`}>
              <Shield className={`w-5 h-5 ${isDarkMode ? 'text-violet-300' : 'text-white'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{adminProfile.name || 'Admin'}</p>
              <p className={`text-xs truncate ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>{adminProfile.role || 'Admin'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {adminNavItems.map((item) => (
              <div key={item.id}>
                {item.hasDropdown ? (
                  <>
                    <button
                      onClick={() => {
                        if (item.id === 'accounts') {
                          navigate('/user-admin/accounts/income');
                          setAccountsDropdownOpen(!accountsDropdownOpen);
                          setEventsDropdownOpen(false);
                        } else if (item.id === 'events') {
                          navigate('/user-admin/events/events-list');
                          setEventsDropdownOpen(!eventsDropdownOpen);
                          setAccountsDropdownOpen(false);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                        activeSection === item.id
                          ? isDarkMode 
                            ? 'text-white bg-white/10 shadow-lg shadow-white/5' 
                            : 'text-gray-900 bg-gray-100 shadow-md'
                          : isDarkMode
                            ? 'text-white/60 hover:text-white hover:bg-white/5'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${activeSection === item.id ? (isDarkMode ? 'text-violet-400' : 'text-gray-900') : ''}`} />
                        {item.label}
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                        (item.id === 'accounts' && accountsDropdownOpen) || (item.id === 'events' && eventsDropdownOpen) ? 'rotate-180' : ''
                      }`} />
                    </button>
                    
                    {/* Accounts Sub-menu */}
                    {item.id === 'accounts' && accountsDropdownOpen && (
                      <div className="ml-4 mt-1 space-y-1">
                        {accountsDropdownItems.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => {
                              navigate(`/user-admin/accounts/${subItem.id}`);
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                              accountsSubSection === subItem.id
                                ? isDarkMode ? 'text-white bg-white/10' : 'text-gray-900 bg-gray-100'
                                : isDarkMode ? 'text-white/50 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            <subItem.icon className="w-4 h-4" />
                            {subItem.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Events Sub-menu */}
                    {item.id === 'events' && eventsDropdownOpen && (
                      <div className="ml-4 mt-1 space-y-1">
                        {eventsDropdownItems.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => {
                              navigate(`/user-admin/events/${subItem.id}`);
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                              eventsSubSection === subItem.id
                                ? isDarkMode ? 'text-white bg-white/10' : 'text-gray-900 bg-gray-100'
                                : isDarkMode ? 'text-white/50 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            <subItem.icon className="w-4 h-4" />
                            {subItem.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => {
                      navigate(`/user-admin/${item.id}`);
                      setAccountsDropdownOpen(false);
                      setEventsDropdownOpen(false);
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
                    <item.icon className={`w-5 h-5 ${activeSection === item.id ? (isDarkMode ? 'text-violet-400' : 'text-gray-900') : ''}`} />
                    {item.label}
                    {activeSection === item.id && (
                      <div className={`ml-auto w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-violet-400' : 'bg-gray-900'}`}></div>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className={`my-4 border-t ${isDarkMode ? 'border-white/[0.08]' : 'border-gray-200'}`}></div>

          {/* Quick Actions */}
          <div className="space-y-1">
            
            <button 
              onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${isDarkMode ? 'text-white/60 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <Bell className="w-5 h-5" />
              Notifications
              <span className={`ml-auto w-2 h-2 rounded-full animate-pulse ${isDarkMode ? 'bg-violet-400' : 'bg-violet-600'}`}></span>
            </button>
          </div>
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
      <div className="flex-1 md:ml-72 flex flex-col min-h-screen">
        {/* Search Modal */}
        {searchOpen && (
          <div className="fixed inset-0 z-[60] flex items-start justify-center pt-24 px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSearchOpen(false)}></div>
            <div className={`relative w-full max-w-xl rounded-2xl shadow-2xl border p-4 animate-in fade-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#14161A] border-white/10' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <Search className={`w-5 h-5 ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search members, transactions..."
                  autoFocus
                  className={`flex-1 bg-transparent text-base outline-none ${isDarkMode ? 'text-white placeholder:text-white/40' : 'text-gray-900 placeholder:text-gray-400'}`}
                />
                <kbd className={`px-2 py-1 text-xs rounded-md ${isDarkMode ? 'bg-white/10 text-white/40' : 'bg-gray-100 text-gray-500'}`}>ESC</kbd>
              </div>
            </div>
          </div>
        )}

        {/* Notification Panel - Positioned relative to sidebar */}
        {notificationPanelOpen && (
          <div className={`fixed top-20 left-80 w-96 max-h-[70vh] rounded-2xl shadow-2xl border z-[60] overflow-hidden animate-in slide-in-from-left-2 fade-in duration-200 ${isDarkMode ? 'bg-[#14161A] border-white/10' : 'bg-white border-gray-200'}`}>
            <div className={`px-4 py-3 border-b flex items-center justify-between ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
              <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
              <button 
                onClick={() => setNotificationPanelOpen(false)}
                className={`p-1 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10 text-white/50' : 'hover:bg-gray-100 text-gray-400'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 max-h-96 overflow-y-auto space-y-3">
              {/* Pending Members Badge (Admin/Superadmin) */}
              {notifications.pendingMembers?.count > 0 && (
                <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserPlus className={`w-4 h-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                      <span className={`text-sm font-semibold ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                        Pending Members
                      </span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isDarkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-800'}`}>
                      {notifications.pendingMembers.count}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-red-300/70' : 'text-red-600/70'}`}>
                    Awaiting approval
                  </p>
                </div>
              )}

              {/* Pending Approvals (Superadmin Only) */}
              {(notifications.pendingApprovals?.events > 0 || 
                notifications.pendingApprovals?.jobs > 0 || 
                notifications.pendingApprovals?.announcements > 0) && (
                <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'}`}>
                  <p className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                    Pending Approvals
                  </p>
                  <div className="space-y-1 text-xs">
                    {notifications.pendingApprovals?.events > 0 && (
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-purple-300/70' : 'text-purple-600/70'}>Events</span>
                        <span className={`font-semibold ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                          {notifications.pendingApprovals.events}
                        </span>
                      </div>
                    )}
                    {notifications.pendingApprovals?.jobs > 0 && (
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-purple-300/70' : 'text-purple-600/70'}>Jobs</span>
                        <span className={`font-semibold ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                          {notifications.pendingApprovals.jobs}
                        </span>
                      </div>
                    )}
                    {notifications.pendingApprovals?.announcements > 0 && (
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-purple-300/70' : 'text-purple-600/70'}>Announcements</span>
                        <span className={`font-semibold ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                          {notifications.pendingApprovals.announcements}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Upcoming Events */}
              {notifications.upcomingEvents && notifications.upcomingEvents.length > 0 && (
                <div>
                  <p className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>
                    📅 UPCOMING EVENTS
                  </p>
                  {notifications.upcomingEvents.map((event: any) => (
                    <div key={event.id} className={`p-2 rounded-lg mb-2 ${isDarkMode ? 'hover:bg-white/5 bg-white/[0.02]' : 'hover:bg-gray-50 bg-gray-50/50'}`}>
                      <p className={`text-xs font-medium line-clamp-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {event.title}
                      </p>
                      <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`}>
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Announcements */}
              {notifications.announcements && notifications.announcements.length > 0 && (
                <div>
                  <p className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>
                    📢 ANNOUNCEMENTS
                  </p>
                  {notifications.announcements.map((announcement: any) => (
                    <div key={announcement.id} className={`p-2 rounded-lg mb-2 ${isDarkMode ? 'hover:bg-white/5 bg-white/[0.02]' : 'hover:bg-gray-50 bg-gray-50/50'}`}>
                      <p className={`text-xs font-medium line-clamp-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {announcement.title}
                      </p>
                      <p className={`text-xs mt-0.5 line-clamp-1 ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`}>
                        {announcement.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Jobs */}
              {notifications.jobs && notifications.jobs.length > 0 && (
                <div>
                  <p className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>
                    💼 JOB POSTINGS
                  </p>
                  {notifications.jobs.map((job: any) => (
                    <div key={job.id} className={`p-2 rounded-lg mb-2 ${isDarkMode ? 'hover:bg-white/5 bg-white/[0.02]' : 'hover:bg-gray-50 bg-gray-50/50'}`}>
                      <p className={`text-xs font-medium line-clamp-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {job.job_title}
                      </p>
                      <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`}>
                        {job.company_name && `${job.company_name} • `}{job.location}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {notificationsLoading && (
                <div className="text-center py-4">
                  <p className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Loading notifications...</p>
                </div>
              )}

              {!notificationsLoading && 
                (!notifications.upcomingEvents || notifications.upcomingEvents.length === 0) && 
                (!notifications.announcements || notifications.announcements.length === 0) && 
                (!notifications.jobs || notifications.jobs.length === 0) && 
                (!notifications.pendingMembers || notifications.pendingMembers.count === 0) && (
                <div className="text-center py-4">
                  <p className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>No notifications</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 relative z-10 sidebar-dashboard-main">
          {/* Job Creation Section - Full Width Layout */}
          {activeSection === 'jobs' ? (
            <div className={`h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Job Creation
                    </h2>
                    <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Manage job postings and track applications
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddJobModal(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Job
                  </button>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="text"
                      placeholder="Search jobs..."
                      value={jobsSearchTerm}
                      onChange={(e) => setJobsSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Jobs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobs
                    .filter(job =>
                      job.jobTitle.toLowerCase().includes(jobsSearchTerm.toLowerCase()) ||
                      job.role.toLowerCase().includes(jobsSearchTerm.toLowerCase()) ||
                      job.location.toLowerCase().includes(jobsSearchTerm.toLowerCase())
                    )
                    .map((job) => (
                      <div
                        key={job.id}
                        className={`p-6 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600'
                            : 'bg-white border-gray-200'
                        } hover:shadow-lg transition-shadow cursor-pointer`}
                        onClick={() => setSelectedJob(job)}
                      >
                        {/* Job Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {job.jobTitle}
                            </h3>
                            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {job.role}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              job.status === 'published'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {job.status === 'published' ? 'Published' : 'Draft'}
                          </span>
                        </div>

                        {/* Job Details */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm">
                            <MapPin className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                              {job.location}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Briefcase className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                              {job.employmentType} • {job.experienceLevel}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Calendar className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                              Apply by: {new Date(job.applyByDate).toLocaleDateString()}
                            </span>
                          </div>
                          {job.salary && (
                            <div className="flex items-center text-sm">
                              <DollarSign className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                {job.salary}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Applicants Count */}
                        <div className={`pt-4 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Users className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {job.applicants.length} Applicant{job.applicants.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            {job.status === 'draft' && user?.role === 'superadmin' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePublishJob(job.id);
                                }}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Publish
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Empty State */}
                {jobs.filter(job =>
                  job.jobTitle.toLowerCase().includes(jobsSearchTerm.toLowerCase()) ||
                  job.role.toLowerCase().includes(jobsSearchTerm.toLowerCase()) ||
                  job.location.toLowerCase().includes(jobsSearchTerm.toLowerCase())
                ).length === 0 && (
                  <div className="text-center py-12">
                    <Briefcase className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {jobsSearchTerm ? 'No jobs found matching your search' : 'No jobs created yet'}
                    </p>
                    <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {jobsSearchTerm ? 'Try adjusting your search terms' : 'Click "Create New Job" to get started'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Welcome Section */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Admin Dashboard
                      <Sparkles className={`inline-block w-6 h-6 ml-2 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
                    </h1>
                    <p className={`mt-1 ${isDarkMode ? 'text-white/50' : 'text-gray-600'}`}>
                      Manage memberships, accounts, and monitor VARA activities
                    </p>
                  </div>
                  
                </div>
              </div>

              {/* Dashboard Stats - Hidden when no stats */}
              {dashboardStats.length > 0 && (
              <div className="grid grid-cols-1 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
                {dashboardStats.map((stat, index) => (
                  <div 
                    key={index}
                    className={`group relative rounded-2xl border p-6 transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 cursor-pointer overflow-hidden ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06] hover:border-white/15 hover:shadow-xl hover:shadow-white/5' : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'}`}
                  >
                    {/* Background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.trend === 'up' ? 'from-emerald-500/10' : 'from-violet-500/10'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                          <stat.icon className={`w-5 h-5 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`} />
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                          stat.trend === 'up'
                            ? isDarkMode ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                            : isDarkMode ? 'bg-violet-500/15 text-violet-400' : 'bg-violet-50 text-violet-700'
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                      <div>
                        <p className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                        <p className={`text-sm ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>{stat.label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}

              {/* Main Content Sections */}
              <div className="space-y-8">
            {/* Admin Profile Section */}
            {activeSection === 'profile' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className={`rounded-2xl border p-8 ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-gray-200'}`}>
                  <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Shield className="w-5 h-5" />
                    Administrator Profile
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-32 h-32 rounded-2xl flex items-center justify-center mb-4 ${isDarkMode ? 'bg-gradient-to-br from-violet-500/30 to-purple-500/10 ring-1 ring-white/10' : 'bg-gray-900'}`}>
                        <Shield className={`w-16 h-16 ${isDarkMode ? 'text-violet-300' : 'text-white'}`} />
                      </div>
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{adminProfile.name || 'Loading...'}</h3>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>{adminProfile.role || 'Loading...'}</p>
                      <span className={`mt-3 px-3 py-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-700'}`}>
                        Admin Since {adminProfile.adminSince || 'N/A'}
                      </span>
                    </div>

                    {/* Contact Information */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <Mail className={`w-4 h-4 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`} />
                          <span className={`text-sm ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Email Address</span>
                        </div>
                        <p className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{adminProfile.email || 'Not available'}</p>
                      </div>

                      <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <Phone className={`w-4 h-4 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`} />
                          <span className={`text-sm ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Phone Number</span>
                        </div>
                        <p className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{adminProfile.phone || 'Not available'}</p>
                      </div>

                      <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <MapPin className={`w-4 h-4 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`} />
                          <span className={`text-sm ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Department</span>
                        </div>
                        <p className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{adminProfile.department || 'Not assigned'}</p>
                      </div>

                      <div className="flex gap-3 mt-4">
                        <button className={`flex-1 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10 border border-white/10' : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200'}`}>
                          <Settings className="w-4 h-4 inline mr-2" />
                          Edit Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Accounts Section - Income, Expenses, Balance Sheet */}
            {activeSection === 'accounts' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                {/* Permission Banner for Admins */}
                {user?.role !== 'superadmin' && (
                  <div className={`rounded-xl border-l-4 p-4 ${isDarkMode ? 'border-l-blue-500 bg-blue-500/10' : 'border-l-blue-600 bg-blue-50'}`}>
                    <div className="flex items-start gap-3">
                      <HelpCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      <div>
                        <h4 className={`font-semibold mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>Read-Only Access</h4>
                        <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>You have view-only access to accounts. Only superadmins can add, edit, or update financial records.</p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Income Section */}
                {accountsSubSection === 'income' && (
                  <>
                    {/* Income Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {[
                        { label: 'Total Monthly Income', value: `AED ${calculateTotalIncome().toLocaleString()}`, icon: CircleDollarSign, color: 'emerald' },
                        { label: 'Membership Fees', value: `AED ${calculateCategoryBreakdown(incomeRecords, 'income').reduce((sum, cat) => cat.label.toLowerCase().includes('fee') ? sum + cat.value : sum, 0).toLocaleString()}`, icon: Users, color: 'blue' },
                        { label: 'Event Revenue', value: `AED ${calculateCategoryBreakdown(incomeRecords, 'income').reduce((sum, cat) => cat.label.toLowerCase().includes('event') ? sum + cat.value : sum, 0).toLocaleString()}`, icon: Receipt, color: 'violet' },
                        { label: 'Other Sources', value: `AED ${calculateCategoryBreakdown(incomeRecords, 'income').reduce((sum, cat) => !cat.label.toLowerCase().includes('fee') && !cat.label.toLowerCase().includes('event') ? sum + cat.value : sum, 0).toLocaleString()}`, icon: PiggyBank, color: 'amber' },
                      ].map((stat, index) => (
                        <div 
                          key={index}
                          className={`group relative rounded-2xl border p-6 transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 cursor-pointer overflow-hidden ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06] hover:border-white/15 hover:shadow-xl hover:shadow-white/5' : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'}`}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                          <div className="relative z-10">
                            <div className="flex items-start justify-between mb-3">
                              <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                                <stat.icon className={`w-5 h-5 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`} />
                              </div>
                              <ArrowUpCircle className={`w-4 h-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            </div>
                            <div>
                              <p className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                              <p className={`text-sm ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>{stat.label}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Income Table */}
                    <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-gray-200'}`}>
                      <div className={`p-6 border-b ${isDarkMode ? 'border-white/[0.06]' : 'border-gray-200'}`}>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                          <div>
                            <h2 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              <ArrowUpCircle className="w-5 h-5 text-emerald-400" />
                              Income Records
                            </h2>
                            <p className={`text-sm mt-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
                              Track all income sources and transactions
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            {/* Search Input */}
                            <div className="relative w-full sm:w-80">
                              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`} />
                              <input
                                type="text"
                                placeholder="Search income by source, description, or amount..."
                                value={incomeSearchTerm}
                                onChange={(e) => setIncomeSearchTerm(e.target.value)}
                                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-300 focus:outline-none focus:ring-2 ${isDarkMode 
                                  ? 'bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/20 focus:ring-violet-500/20' 
                                  : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-violet-300 focus:ring-violet-500/20'}`}
                              />
                              {incomeSearchTerm && (
                                <button
                                  onClick={() => setIncomeSearchTerm('')}
                                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10 text-white/40 hover:text-white/70' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'}`}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            {/* Report Button */}
                            <div className="relative">
                              <button
                                onClick={() => setReportDropdownOpen(reportDropdownOpen === 'income' ? null : 'income')}
                                className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 hover:scale-105 whitespace-nowrap ${isDarkMode ? 'bg-violet-500 text-white hover:bg-violet-600 shadow-lg shadow-violet-500/30' : 'bg-violet-600 text-white hover:bg-violet-700'}`}
                              >
                                <FileText className="w-4 h-4" />
                                Report
                                <ChevronDown className={`w-4 h-4 transition-transform ${reportDropdownOpen === 'income' ? 'rotate-180' : ''}`} />
                              </button>
                              {reportDropdownOpen === 'income' && (
                                <div className={`absolute right-0 mt-2 w-48 rounded-xl border shadow-xl z-50 ${isDarkMode ? 'bg-[#14161A] border-white/10' : 'bg-white border-gray-200'}`}>
                                  {[
                                    { label: 'Today Report', value: 'today' },
                                    { label: 'Weekly Report', value: 'weekly' },
                                    { label: 'Monthly Report', value: 'monthly' },
                                    { label: 'Yearly Report', value: 'yearly' },
                                    { label: 'Custom Range', value: 'custom' },
                                  ].map((option) => (
                                    <button
                                      key={option.value}
                                      onClick={() => {
                                        setReportType('income');
                                        setReportPeriod(option.value as any);
                                        setShowReportModal(true);
                                        setReportDropdownOpen(null);
                                      }}
                                      className={`w-full px-4 py-3 text-left text-sm transition-colors first:rounded-t-xl last:rounded-b-xl ${isDarkMode ? 'hover:bg-white/5 text-white/70 hover:text-white' : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'}`}
                                    >
                                      {option.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => setShowAddIncomeModal(true)}
                              disabled={user?.role !== 'superadmin'}
                              title={user?.role !== 'superadmin' ? 'Only superadmins can add income records' : 'Add new income record'}
                              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${user?.role === 'superadmin' ? `hover:scale-105 ${isDarkMode ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30' : 'bg-emerald-600 text-white hover:bg-emerald-700'}` : `${isDarkMode ? 'bg-emerald-500/40 text-emerald-600 cursor-not-allowed' : 'bg-emerald-200 text-emerald-400 cursor-not-allowed'}`}`}
                            >
                              <UserPlus className="w-4 h-4" />
                              Add Income
                            </button>
                          </div>
                        </div>
                        
                        {/* Search Results Info */}
                        {incomeSearchTerm && (
                          <div className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
                            Found {incomeRecords.filter(record => 
                              record.source.toLowerCase().includes(incomeSearchTerm.toLowerCase()) ||
                              record.description.toLowerCase().includes(incomeSearchTerm.toLowerCase()) ||
                              record.amount.toString().includes(incomeSearchTerm.toLowerCase()) ||
                              record.paymentMode.toLowerCase().includes(incomeSearchTerm.toLowerCase()) ||
                              record.status.toLowerCase().includes(incomeSearchTerm.toLowerCase())
                            ).length} income record(s) matching "{incomeSearchTerm}"
                          </div>
                        )}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className={`${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                            <tr>
                              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>ID</th>
                              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Source</th>
                              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Description</th>
                              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Amount</th>
                              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Date</th>
                              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Payment Mode</th>
                              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.06]">
                            {incomeRecords
                              .filter(record => {
                                if (!incomeSearchTerm) return true;
                                const searchTerm = incomeSearchTerm.toLowerCase();
                                return (
                                  record.source.toLowerCase().includes(searchTerm) ||
                                  record.description.toLowerCase().includes(searchTerm) ||
                                  record.amount.toString().includes(searchTerm) ||
                                  record.paymentMode.toLowerCase().includes(searchTerm) ||
                                  record.status.toLowerCase().includes(searchTerm) ||
                                  record.id.toLowerCase().includes(searchTerm)
                                );
                              })
                              .map((record) => (
                              <tr 
                                key={record.id}
                                className={`transition-colors duration-200 ${isDarkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'}`}
                              >
                                <td className={`px-6 py-4 text-sm font-mono ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>
                                  {record.id}
                                </td>
                                <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {record.source}
                                </td>
                                <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
                                  {record.description}
                                </td>
                                <td className={`px-6 py-4 text-sm font-semibold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                  AED {record.amount.toLocaleString()}
                                </td>
                                <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
                                  {formatDate(record.date)}
                                </td>
                                <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>
                                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
                                    {record.paymentMode}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                  <div className="relative flex items-center gap-2">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                                      record.status === 'received'
                                        ? isDarkMode ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : isDarkMode ? 'bg-amber-500/15 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}>
                                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                    </span>
                                    {record.status === 'pending' && (
                                      <div className="relative">
                                        <button
                                          onClick={() => setIncomeStatusMenuOpen(incomeStatusMenuOpen === record.id ? null : record.id)}
                                          className={`p-1.5 rounded transition-colors ${user?.role === 'superadmin' ? `${isDarkMode ? 'hover:bg-white/10 text-white/60 hover:text-white' : 'text-gray-600 hover:text-gray-900'}` : `${isDarkMode ? 'text-white/20 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'}`}`}
                                          disabled={statusUpdating === record.id || user?.role !== 'superadmin'}
                                          title={user?.role !== 'superadmin' ? 'Only superadmins can update income records' : 'Update income record'}
                                        >
                                          <MoreVertical className="w-4 h-4" />
                                        </button>
                                        {incomeStatusMenuOpen === record.id && (
                                          <div className={`absolute top-full right-0 mt-1 w-40 rounded-lg shadow-lg z-50 ${isDarkMode ? 'bg-gray-800 border border-white/10' : 'bg-white border border-gray-200'}`}>
                                            <button
                                              onClick={() => handleStatusUpdate(record.id, 'income', 'received')}
                                              disabled={statusUpdating === record.id}
                                              className={`w-full px-4 py-2 text-sm text-left rounded-lg hover:bg-emerald-500/20 transition-colors ${isDarkMode ? 'text-white/80 hover:text-emerald-400' : 'text-gray-700 hover:text-emerald-700'} disabled:opacity-50`}
                                            >
                                              Mark as Received
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* No Results Message for Income */}
                      {incomeSearchTerm && incomeRecords.filter(record => {
                        const searchTerm = incomeSearchTerm.toLowerCase();
                        return (
                          record.source.toLowerCase().includes(searchTerm) ||
                          record.description.toLowerCase().includes(searchTerm) ||
                          record.amount.toString().includes(searchTerm) ||
                          record.paymentMode.toLowerCase().includes(searchTerm) ||
                          record.status.toLowerCase().includes(searchTerm) ||
                          record.id.toLowerCase().includes(searchTerm)
                        );
                      }).length === 0 && (
                        <div className={`text-center py-12 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
                          <ArrowUpCircle className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-white/20' : 'text-gray-300'}`} />
                          <p className="text-lg font-medium mb-2">No income records found</p>
                          <p className="text-sm">Try adjusting your search terms or check the spelling.</p>
                          <button
                            onClick={() => setIncomeSearchTerm('')}
                            className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                          >
                            Clear Search
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Expenses Section */}
                {accountsSubSection === 'expenses' && (
                  <>
                    {/* Expense Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {[
                        { label: 'Total Expenses', value: `AED ${calculateTotalExpense().toLocaleString()}`, icon: CircleDollarSign, color: 'red' },
                        { label: 'Operations Cost', value: `AED ${calculateCategoryBreakdown(expenseRecords, 'expense').reduce((sum, cat) => cat.label.toLowerCase().includes('operation') || cat.label.toLowerCase().includes('admin') ? sum + cat.value : sum, 0).toLocaleString()}`, icon: Building2, color: 'blue' },
                        { label: 'Marketing Cost', value: `AED ${calculateCategoryBreakdown(expenseRecords, 'expense').reduce((sum, cat) => cat.label.toLowerCase().includes('marketing') ? sum + cat.value : sum, 0).toLocaleString()}`, icon: Megaphone, color: 'violet' },
                        { label: 'Other Expenses', value: `AED ${calculateCategoryBreakdown(expenseRecords, 'expense').reduce((sum, cat) => !cat.label.toLowerCase().includes('operation') && !cat.label.toLowerCase().includes('admin') && !cat.label.toLowerCase().includes('marketing') ? sum + cat.value : sum, 0).toLocaleString()}`, icon: ShoppingCart, color: 'amber' },
                      ].map((stat, index) => (
                        <div 
                          key={index}
                          className={`group relative rounded-2xl border p-6 transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 cursor-pointer overflow-hidden ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06] hover:border-white/15 hover:shadow-xl hover:shadow-white/5' : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'}`}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                          <div className="relative z-10">
                            <div className="flex items-start justify-between mb-3">
                              <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                                <stat.icon className={`w-5 h-5 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`} />
                              </div>
                              <ArrowDownCircle className={`w-4 h-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                            </div>
                            <div>
                              <p className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                              <p className={`text-sm ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>{stat.label}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Expense Table */}
                    <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-gray-200'}`}>
                      <div className={`p-6 border-b ${isDarkMode ? 'border-white/[0.06]' : 'border-gray-200'}`}>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                          <div>
                            <h2 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              <ArrowDownCircle className="w-5 h-5 text-red-400" />
                              Expense Records
                            </h2>
                            <p className={`text-sm mt-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
                              Monitor all expenses and operational costs
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            {/* Search Input */}
                            <div className="relative w-full sm:w-80">
                              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`} />
                              <input
                                type="text"
                                placeholder="Search expenses by category, description, or amount..."
                                value={expensesSearchTerm}
                                onChange={(e) => setExpensesSearchTerm(e.target.value)}
                                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-300 focus:outline-none focus:ring-2 ${isDarkMode 
                                  ? 'bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/20 focus:ring-violet-500/20' 
                                  : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-violet-300 focus:ring-violet-500/20'}`}
                              />
                              {expensesSearchTerm && (
                                <button
                                  onClick={() => setExpensesSearchTerm('')}
                                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10 text-white/40 hover:text-white/70' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'}`}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            {/* Report Button */}
                            <div className="relative">
                              <button
                                onClick={() => setReportDropdownOpen(reportDropdownOpen === 'expense' ? null : 'expense')}
                                className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 hover:scale-105 whitespace-nowrap ${isDarkMode ? 'bg-violet-500 text-white hover:bg-violet-600 shadow-lg shadow-violet-500/30' : 'bg-violet-600 text-white hover:bg-violet-700'}`}
                              >
                                <FileText className="w-4 h-4" />
                                Report
                                <ChevronDown className={`w-4 h-4 transition-transform ${reportDropdownOpen === 'expense' ? 'rotate-180' : ''}`} />
                              </button>
                              {reportDropdownOpen === 'expense' && (
                                <div className={`absolute right-0 mt-2 w-48 rounded-xl border shadow-xl z-50 ${isDarkMode ? 'bg-[#14161A] border-white/10' : 'bg-white border-gray-200'}`}>
                                  {[
                                    { label: 'Today Report', value: 'today' },
                                    { label: 'Weekly Report', value: 'weekly' },
                                    { label: 'Monthly Report', value: 'monthly' },
                                    { label: 'Yearly Report', value: 'yearly' },
                                    { label: 'Custom Range', value: 'custom' },
                                  ].map((option) => (
                                    <button
                                      key={option.value}
                                      onClick={() => {
                                        setReportType('expense');
                                        setReportPeriod(option.value as any);
                                        setShowReportModal(true);
                                        setReportDropdownOpen(null);
                                      }}
                                      className={`w-full px-4 py-3 text-left text-sm transition-colors first:rounded-t-xl last:rounded-b-xl ${isDarkMode ? 'hover:bg-white/5 text-white/70 hover:text-white' : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'}`}
                                    >
                                      {option.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => setShowAddExpenseModal(true)}
                              disabled={user?.role !== 'superadmin'}
                              title={user?.role !== 'superadmin' ? 'Only superadmins can add expense records' : 'Add new expense record'}
                              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${user?.role === 'superadmin' ? `hover:scale-105 ${isDarkMode ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30' : 'bg-red-600 text-white hover:bg-red-700'}` : `${isDarkMode ? 'bg-red-500/40 text-red-600 cursor-not-allowed' : 'bg-red-200 text-red-400 cursor-not-allowed'}`}`}
                            >
                              <UserPlus className="w-4 h-4" />
                              Add Expense
                            </button>
                          </div>
                        </div>
                        
                        {/* Search Results Info */}
                        {expensesSearchTerm && (
                          <div className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
                            Found {expenseRecords.filter(record => 
                              record.category.toLowerCase().includes(expensesSearchTerm.toLowerCase()) ||
                              record.description.toLowerCase().includes(expensesSearchTerm.toLowerCase()) ||
                              record.amount.toString().includes(expensesSearchTerm.toLowerCase()) ||
                              record.paymentMode.toLowerCase().includes(expensesSearchTerm.toLowerCase()) ||
                              record.status.toLowerCase().includes(expensesSearchTerm.toLowerCase())
                            ).length} expense record(s) matching "{expensesSearchTerm}"
                          </div>
                        )}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className={`${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                            <tr>
                              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>ID</th>
                              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Category</th>
                              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Description</th>
                              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Amount</th>
                              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Date</th>
                              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Payment Mode</th>
                              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.06]">
                            {expenseRecords.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="px-6 py-12 text-center">
                                  <div>
                                    <ArrowDownCircle className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-white/20' : 'text-gray-300'}`} />
                                    <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>No expense records yet</p>
                                    <p className={`text-sm ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`}>Click "Add Expense" button above to create your first expense record</p>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              expenseRecords
                                .filter(record => {
                                  if (!expensesSearchTerm) return true;
                                  const searchTerm = expensesSearchTerm.toLowerCase();
                                  return (
                                    record.category.toLowerCase().includes(searchTerm) ||
                                    record.description.toLowerCase().includes(searchTerm) ||
                                    record.amount.toString().includes(searchTerm) ||
                                    record.paymentMode.toLowerCase().includes(searchTerm) ||
                                    record.status.toLowerCase().includes(searchTerm) ||
                                    record.id.toLowerCase().includes(searchTerm)
                                  );
                                })
                                .map((record) => (
                                <tr 
                                  key={record.id}
                                  className={`transition-colors duration-200 ${isDarkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'}`}
                                >
                                  <td className={`px-6 py-4 text-sm font-mono ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>
                                    {record.id}
                                  </td>
                                  <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    <span className={`px-2.5 py-1 rounded-lg text-xs ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                                      {record.category}
                                    </span>
                                  </td>
                                  <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
                                    {record.description}
                                  </td>
                                  <td className={`px-6 py-4 text-sm font-semibold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                                    AED {record.amount.toLocaleString()}
                                  </td>
                                  <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
                                    {formatDate(record.date)}
                                  </td>
                                  <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
                                      {record.paymentMode}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-sm">
                                    <div className="relative flex items-center gap-2">
                                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                                        record.status === 'paid'
                                          ? isDarkMode ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                          : isDarkMode ? 'bg-amber-500/15 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200'
                                      }`}>
                                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                      </span>
                                      {record.status === 'pending' && (
                                        <div className="relative">
                                          <button
                                            onClick={() => setExpenseStatusMenuOpen(expenseStatusMenuOpen === record.id ? null : record.id)}
                                            className={`p-1.5 rounded transition-colors ${user?.role === 'superadmin' ? `${isDarkMode ? 'hover:bg-white/10 text-white/60 hover:text-white' : 'text-gray-600 hover:text-gray-900'}` : `${isDarkMode ? 'text-white/20 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'}`}`}
                                            disabled={statusUpdating === record.id || user?.role !== 'superadmin'}
                                            title={user?.role !== 'superadmin' ? 'Only superadmins can update expense records' : 'Update expense record'}
                                          >
                                            <MoreVertical className="w-4 h-4" />
                                          </button>
                                          {expenseStatusMenuOpen === record.id && (
                                            <div className={`absolute top-full right-0 mt-1 w-40 rounded-lg shadow-lg z-50 ${isDarkMode ? 'bg-gray-800 border border-white/10' : 'bg-white border border-gray-200'}`}>
                                              <button
                                                onClick={() => handleStatusUpdate(record.id, 'expense', 'paid')}
                                                disabled={statusUpdating === record.id}
                                                className={`w-full px-4 py-2 text-sm text-left rounded-lg hover:bg-emerald-500/20 transition-colors ${isDarkMode ? 'text-white/80 hover:text-emerald-400' : 'text-gray-700 hover:text-emerald-700'} disabled:opacity-50`}
                                              >
                                                Mark as Paid
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>

                      </div>
                      
                      {/* No Results Message for Expenses */}
                      {expensesSearchTerm && expenseRecords.filter(record => {
                        const searchTerm = expensesSearchTerm.toLowerCase();
                        return (
                          record.category.toLowerCase().includes(searchTerm) ||
                          record.description.toLowerCase().includes(searchTerm) ||
                          record.amount.toString().includes(searchTerm) ||
                          record.paymentMode.toLowerCase().includes(searchTerm) ||
                          record.status.toLowerCase().includes(searchTerm) ||
                          record.id.toLowerCase().includes(searchTerm)
                        );
                      }).length === 0 && (
                        <div className={`text-center py-12 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
                          <ArrowDownCircle className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-white/20' : 'text-gray-300'}`} />
                          <p className="text-lg font-medium mb-2">No expense records found</p>
                          <p className="text-sm">Try adjusting your search terms or check the spelling.</p>
                          <button
                            onClick={() => setExpensesSearchTerm('')}
                            className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                          >
                            Clear Search
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Balance Sheet Section */}
                {accountsSubSection === 'balance' && (
                  <>

                    {/* Total Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20' : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200'}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-100'}`}>
                            <ArrowUpCircle className={`w-5 h-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                          </div>
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Total Income</span>
                        </div>
                        <p className={`text-3xl font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          AED {calculateTotalIncome().toLocaleString()}
                        </p>
                      </div>

                      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20' : 'bg-gradient-to-br from-red-50 to-white border-red-200'}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-500/10' : 'bg-red-100'}`}>
                            <ArrowDownCircle className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                          </div>
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Total Expenses</span>
                        </div>
                        <p className={`text-3xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                          AED {calculateTotalExpense().toLocaleString()}
                        </p>
                      </div>

                      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gradient-to-br from-violet-500/10 to-transparent border-violet-500/20' : 'bg-gradient-to-br from-violet-50 to-white border-violet-200'}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-violet-500/10' : 'bg-violet-100'}`}>
                            <BarChart3 className={`w-5 h-5 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
                          </div>
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Net Profit</span>
                        </div>
                        <p className={`text-3xl font-bold ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`}>
                          AED {(calculateTotalIncome() - calculateTotalExpense()).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Income by Category */}
                      <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-gray-200'}`}>
                        <div className={`p-6 border-b ${isDarkMode ? 'border-white/[0.06]' : 'border-gray-200'}`}>
                          <h3 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                            Income by Category
                          </h3>
                        </div>
                        <div className="p-6 space-y-3">
                          {Object.entries(
                            incomeRecords.reduce((acc, item) => {
                              const source = item.source || 'Uncategorized';
                              if (!acc[source]) acc[source] = { total: 0, items: [] };
                              acc[source].total += item.amount || 0;
                              acc[source].items.push(item);
                              return acc;
                            }, {} as Record<string, { total: number; items: IncomeRecord[] }>)
                          ).map(([source, data]) => (
                            <div key={source} className={`rounded-xl overflow-hidden ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                              <div className={`p-4 ${isDarkMode ? 'bg-emerald-500/5' : 'bg-emerald-50'}`}>
                                <div className="flex items-center justify-between">
                                  <span className={`text-sm font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{source}</span>
                                  <span className={`text-lg font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                    AED {data.total.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              <div className="p-3 space-y-2">
                                {data.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-sm">
                                    <div className="flex flex-col gap-0.5">
                                      <span className={`${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>{item.description}</span>
                                      <span className={`text-xs px-2 py-0.5 rounded w-fit ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                        {item.paymentMode}
                                      </span>
                                    </div>
                                    <span className={`font-semibold ${isDarkMode ? 'text-white/90' : 'text-gray-900'}`}>
                                      AED {(item.amount || 0).toLocaleString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                          <div className={`pt-4 mt-4 border-t ${isDarkMode ? 'border-white/[0.06]' : 'border-gray-200'}`}>
                            <div className="flex items-center justify-between">
                              <span className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Total Income</span>
                              <span className={`text-xl font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                AED {calculateTotalIncome().toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expenses by Category */}
                      <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-gray-200'}`}>
                        <div className={`p-6 border-b ${isDarkMode ? 'border-white/[0.06]' : 'border-gray-200'}`}>
                          <h3 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            <ArrowDownCircle className="w-5 h-5 text-red-400" />
                            Expenses by Category
                          </h3>
                        </div>
                        <div className="p-6 space-y-3">
                          {Object.entries(
                            expenseRecords.reduce((acc, item) => {
                              const category = item.category || 'Uncategorized';
                              if (!acc[category]) acc[category] = { total: 0, items: [] };
                              acc[category].total += item.amount || 0;
                              acc[category].items.push(item);
                              return acc;
                            }, {} as Record<string, { total: number; items: ExpenseRecord[] }>)
                          ).map(([category, data]) => (
                            <div key={category} className={`rounded-xl overflow-hidden ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                              <div className={`p-4 ${isDarkMode ? 'bg-red-500/5' : 'bg-red-50'}`}>
                                <div className="flex items-center justify-between">
                                  <span className={`text-sm font-bold ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>{category}</span>
                                  <span className={`text-lg font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                                    AED {data.total.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              <div className="p-3 space-y-2">
                                {data.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-sm">
                                    <div className="flex flex-col gap-0.5">
                                      <span className={`${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>{item.description}</span>
                                      <span className={`text-xs px-2 py-0.5 rounded w-fit ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                        {item.paymentMode}
                                      </span>
                                    </div>
                                    <span className={`font-semibold ${isDarkMode ? 'text-white/90' : 'text-gray-900'}`}>
                                      AED {(item.amount || 0).toLocaleString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                          <div className={`pt-4 mt-4 border-t ${isDarkMode ? 'border-white/[0.06]' : 'border-gray-200'}`}>
                            <div className="flex items-center justify-between">
                              <span className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Total Expenses</span>
                              <span className={`text-xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                                AED {calculateTotalExpense().toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Net Profit/Loss Summary */}
                    <div className={`rounded-2xl border p-8 relative overflow-hidden group hover:scale-[1.01] transition-all duration-500 ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06] hover:border-white/15 hover:shadow-2xl hover:shadow-violet-500/20' : 'bg-white border-gray-200 hover:border-violet-300 hover:shadow-xl'}`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className={`text-2xl font-bold flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              <BarChart3 className="w-7 h-7 text-violet-400" />
                              Profit & Loss Statement
                            </h3>
                            <p className={`text-sm mt-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
                              Total Income - Total Expenses = Net Profit
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Net Profit</p>
                            <p className={`text-4xl font-bold ${(calculateTotalIncome() - calculateTotalExpense()) >= 0 ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600') : (isDarkMode ? 'text-red-400' : 'text-red-600')}`}>
                              AED {Math.abs(calculateTotalIncome() - calculateTotalExpense()).toLocaleString()}
                            </p>
                            <p className={`text-xs mt-1 ${(calculateTotalIncome() - calculateTotalExpense()) >= 0 ? (isDarkMode ? 'text-emerald-400/70' : 'text-emerald-600/70') : (isDarkMode ? 'text-red-400/70' : 'text-red-600/70')}`}>
                              {(calculateTotalIncome() - calculateTotalExpense()) >= 0 ? 'Profit' : 'Loss'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Calculation Breakdown */}
                        <div className={`grid grid-cols-3 gap-4 p-4 rounded-xl ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                          <div className="text-center">
                            <p className={`text-sm mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Income</p>
                            <p className={`text-xl font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                              AED {calculateTotalIncome().toLocaleString()}
                            </p>
                          </div>
                          <div className="text-center flex items-center justify-center">
                            <span className={`text-2xl font-bold ${isDarkMode ? 'text-white/30' : 'text-gray-300'}`}>−</span>
                          </div>
                          <div className="text-center">
                            <p className={`text-sm mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Expenses</p>
                            <p className={`text-xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                              AED {calculateTotalExpense().toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Financial Health Indicator */}
                        <div className={`mt-6 p-4 rounded-xl ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Financial Health</span>
                            <span className={`text-sm font-bold ${(calculateTotalIncome() - calculateTotalExpense()) >= 40000 ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600') : (calculateTotalIncome() - calculateTotalExpense()) >= 20000 ? (isDarkMode ? 'text-yellow-400' : 'text-yellow-600') : (isDarkMode ? 'text-red-400' : 'text-red-600')}`}>
                              {(calculateTotalIncome() - calculateTotalExpense()) >= 40000 ? 'Excellent' : (calculateTotalIncome() - calculateTotalExpense()) >= 20000 ? 'Good' : 'Needs Attention'}
                            </span>
                          </div>
                          <div className={`w-full h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/5' : 'bg-gray-200'}`}>
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${(calculateTotalIncome() - calculateTotalExpense()) >= 40000 ? 'bg-gradient-to-r from-emerald-500 to-violet-500' : (calculateTotalIncome() - calculateTotalExpense()) >= 20000 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-red-500 to-orange-500'}`}
                              style={{ width: `${Math.min(((calculateTotalIncome() - calculateTotalExpense()) / 50000) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Events Announcements Section */}
            {activeSection === 'events' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Events Section */}
                {eventsSubSection === 'events-list' && (
                  <>
                    {/* Header with Add Event Button */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                      <div>
                        <h2 className={`text-2xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          <Calendar className="w-6 h-6 text-violet-400" />
                          Events Management
                        </h2>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
                          Create and manage events for members
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        {/* Search Input */}
                        <div className="relative w-full sm:w-80">
                          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`} />
                          <input
                            type="text"
                            placeholder="Search events by title, location, or category..."
                            value={eventsSearchTerm}
                            onChange={(e) => setEventsSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-300 focus:outline-none focus:ring-2 ${isDarkMode 
                              ? 'bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/20 focus:ring-violet-500/20' 
                              : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-violet-300 focus:ring-violet-500/20'}`}
                          />
                          {eventsSearchTerm && (
                            <button
                              onClick={() => setEventsSearchTerm('')}
                              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10 text-white/40 hover:text-white/70' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        {/* Report Button */}
                        <div className="relative">
                          <button
                            onClick={() => setReportDropdownOpen(reportDropdownOpen === 'events' ? null : 'events')}
                            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 hover:scale-105 whitespace-nowrap ${isDarkMode ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                          >
                            <FileText className="w-4 h-4" />
                            Report
                            <ChevronDown className={`w-4 h-4 transition-transform ${reportDropdownOpen === 'events' ? 'rotate-180' : ''}`} />
                          </button>
                          {reportDropdownOpen === 'events' && (
                            <div className={`absolute right-0 mt-2 w-48 rounded-xl border shadow-xl z-50 ${isDarkMode ? 'bg-[#14161A] border-white/10' : 'bg-white border-gray-200'}`}>
                              {[
                                { label: 'Today Report', value: 'today' },
                                { label: 'Weekly Report', value: 'weekly' },
                                { label: 'Monthly Report', value: 'monthly' },
                                { label: 'Yearly Report', value: 'yearly' },
                                { label: 'Custom Range', value: 'custom' },
                              ].map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() => {
                                    setReportType('events');
                                    setReportPeriod(option.value as any);
                                    setShowReportModal(true);
                                    setReportDropdownOpen(null);
                                  }}
                                  className={`w-full px-4 py-3 text-left text-sm transition-colors first:rounded-t-xl last:rounded-b-xl ${isDarkMode ? 'hover:bg-white/5 text-white/70 hover:text-white' : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'}`}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => setShowAddEventModal(true)}
                          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 hover:scale-105 whitespace-nowrap ${isDarkMode ? 'bg-violet-500 text-white hover:bg-violet-600 shadow-lg shadow-violet-500/30' : 'bg-violet-600 text-white hover:bg-violet-700'}`}
                        >
                          <UserPlus className="w-4 h-4" />
                          Create Event
                        </button>
                      </div>
                    </div>

                    {/* Search Results Info */}
                    {eventsSearchTerm && (
                      <div className={`mb-4 text-sm ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
                        Found {events.filter(event => 
                          event.title.toLowerCase().includes(eventsSearchTerm.toLowerCase()) ||
                          event.description.toLowerCase().includes(eventsSearchTerm.toLowerCase()) ||
                          event.location.toLowerCase().includes(eventsSearchTerm.toLowerCase()) ||
                          event.category.toLowerCase().includes(eventsSearchTerm.toLowerCase()) ||
                          event.status.toLowerCase().includes(eventsSearchTerm.toLowerCase())
                        ).length} event(s) matching "{eventsSearchTerm}"
                      </div>
                    )}

                    {/* Events List */}
                    <div className="grid grid-cols-1 gap-6">
                      {events
                        .filter(event => {
                          if (!eventsSearchTerm) return true;
                          const searchTerm = eventsSearchTerm.toLowerCase();
                          return (
                            event.title.toLowerCase().includes(searchTerm) ||
                            event.description.toLowerCase().includes(searchTerm) ||
                            event.location.toLowerCase().includes(searchTerm) ||
                            event.category.toLowerCase().includes(searchTerm) ||
                            event.status.toLowerCase().includes(searchTerm)
                          );
                        })
                        .map((event, index) => (
                        <div 
                          key={event.id}
                          className={`rounded-2xl border overflow-hidden transition-all duration-300 hover:scale-[1.01] ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06] hover:border-white/15' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {/* Banner Image */}
                          {event.bannerImage && (
                            <div className="w-full h-48 overflow-hidden">
                              <img 
                                src={event.bannerImage} 
                                alt={event.title} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {event.title}
                                  </h3>
                                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                                    event.status === 'published'
                                      ? isDarkMode ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                                      : isDarkMode ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-50 text-amber-700'
                                  }`}>
                                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                  </span>
                                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
                                    {event.category}
                                  </span>
                                </div>
                                <p className={`text-sm mb-4 ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
                                  {event.description}
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div>
                                    <p className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>Date</p>
                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white/80' : 'text-gray-800'}`}>{formatDate(event.date)}</p>
                                  </div>
                                  <div>
                                    <p className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>Time</p>
                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white/80' : 'text-gray-800'}`}>{formatTime(event.time)}</p>
                                  </div>
                                  <div>
                                    <p className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>Location</p>
                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white/80' : 'text-gray-800'}`}>{event.location}</p>
                                  </div>
                                  {event.maxParticipants && (
                                    <div>
                                      <p className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>Max Participants</p>
                                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white/80' : 'text-gray-800'}`}>{event.maxParticipants}</p>
                                    </div>
                                  )}
                                </div>
                                {event.registrationLink && (
                                  <div className="mt-4">
                                    <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>Registration Link</p>
                                    <a href={event.registrationLink} target="_blank" rel="noopener noreferrer" className={`text-sm ${isDarkMode ? 'text-violet-400 hover:text-violet-300' : 'text-violet-600 hover:text-violet-700'} break-all`}>
                                      {event.registrationLink}
                                    </a>
                                  </div>
                                )}
                              </div>
                              {event.status === 'draft' && user?.role === 'superadmin' && (
                                <button
                                  onClick={() => handlePublishEvent(event.id)}
                                  className={`ml-4 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isDarkMode ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                                >
                                  Publish Event
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* No Results Message */}
                    {eventsSearchTerm && events.filter(event => {
                      const searchTerm = eventsSearchTerm.toLowerCase();
                      return (
                        event.title.toLowerCase().includes(searchTerm) ||
                        event.description.toLowerCase().includes(searchTerm) ||
                        event.location.toLowerCase().includes(searchTerm) ||
                        event.category.toLowerCase().includes(searchTerm) ||
                        event.status.toLowerCase().includes(searchTerm)
                      );
                    }).length === 0 && (
                      <div className={`text-center py-12 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
                        <Calendar className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-white/20' : 'text-gray-300'}`} />
                        <p className="text-lg font-medium mb-2">No events found</p>
                        <p className="text-sm">Try adjusting your search terms or check the spelling.</p>
                        <button
                          onClick={() => setEventsSearchTerm('')}
                          className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                        >
                          Clear Search
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Announcements Section */}
                {eventsSubSection === 'announcements' && (
                  <>
                    {/* Header with Add Announcement Button */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                      <div>
                        <h2 className={`text-2xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          <Megaphone className="w-6 h-6 text-orange-400" />
                          Announcements
                        </h2>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
                          Create and manage announcements for members
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        {/* Search Input */}
                        <div className="relative w-full sm:w-80">
                          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`} />
                          <input
                            type="text"
                            placeholder="Search announcements by title, message, or type..."
                            value={announcementsSearchTerm}
                            onChange={(e) => setAnnouncementsSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-300 focus:outline-none focus:ring-2 ${isDarkMode 
                              ? 'bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/20 focus:ring-violet-500/20' 
                              : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-violet-300 focus:ring-violet-500/20'}`}
                          />
                          {announcementsSearchTerm && (
                            <button
                              onClick={() => setAnnouncementsSearchTerm('')}
                              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10 text-white/40 hover:text-white/70' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        {/* Report Button */}
                        <div className="relative">
                          <button
                            onClick={() => setReportDropdownOpen(reportDropdownOpen === 'announcements' ? null : 'announcements')}
                            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 hover:scale-105 whitespace-nowrap ${isDarkMode ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                          >
                            <FileText className="w-4 h-4" />
                            Report
                            <ChevronDown className={`w-4 h-4 transition-transform ${reportDropdownOpen === 'announcements' ? 'rotate-180' : ''}`} />
                          </button>
                          {reportDropdownOpen === 'announcements' && (
                            <div className={`absolute right-0 mt-2 w-48 rounded-xl border shadow-xl z-50 ${isDarkMode ? 'bg-[#14161A] border-white/10' : 'bg-white border-gray-200'}`}>
                              {[
                                { label: 'Today Report', value: 'today' },
                                { label: 'Weekly Report', value: 'weekly' },
                                { label: 'Monthly Report', value: 'monthly' },
                                { label: 'Yearly Report', value: 'yearly' },
                                { label: 'Custom Range', value: 'custom' },
                              ].map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() => {
                                    setReportType('announcements');
                                    setReportPeriod(option.value as any);
                                    setShowReportModal(true);
                                    setReportDropdownOpen(null);
                                  }}
                                  className={`w-full px-4 py-3 text-left text-sm transition-colors first:rounded-t-xl last:rounded-b-xl ${isDarkMode ? 'hover:bg-white/5 text-white/70 hover:text-white' : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'}`}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => setShowAddAnnouncementModal(true)}
                          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 hover:scale-105 whitespace-nowrap ${isDarkMode ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/30' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
                        >
                          <Send className="w-4 h-4" />
                          Create Announcement
                        </button>
                      </div>
                    </div>

                    {/* Search Results Info */}
                    {announcementsSearchTerm && (
                      <div className={`mb-4 text-sm ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
                        Found {announcements.filter(announcement => 
                          announcement.title.toLowerCase().includes(announcementsSearchTerm.toLowerCase()) ||
                          announcement.message.toLowerCase().includes(announcementsSearchTerm.toLowerCase()) ||
                          announcement.type.toLowerCase().includes(announcementsSearchTerm.toLowerCase()) ||
                          announcement.priority.toLowerCase().includes(announcementsSearchTerm.toLowerCase()) ||
                          announcement.status.toLowerCase().includes(announcementsSearchTerm.toLowerCase())
                        ).length} announcement(s) matching "{announcementsSearchTerm}"
                      </div>
                    )}

                    {/* Announcements List */}
                    <div className="grid grid-cols-1 gap-6">
                      {announcements
                        .filter(announcement => {
                          if (!announcementsSearchTerm) return true;
                          const searchTerm = announcementsSearchTerm.toLowerCase();
                          return (
                            announcement.title.toLowerCase().includes(searchTerm) ||
                            announcement.message.toLowerCase().includes(searchTerm) ||
                            announcement.type.toLowerCase().includes(searchTerm) ||
                            announcement.priority.toLowerCase().includes(searchTerm) ||
                            announcement.status.toLowerCase().includes(searchTerm)
                          );
                        })
                        .map((announcement, index) => (
                        <div 
                          key={announcement.id}
                          className={`rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.01] ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06] hover:border-white/15' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {announcement.title}
                                </h3>
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                                  announcement.status === 'published'
                                    ? isDarkMode ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                                    : isDarkMode ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {announcement.status.charAt(0).toUpperCase() + announcement.status.slice(1)}
                                </span>
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                                  announcement.priority === 'high'
                                    ? isDarkMode ? 'bg-red-500/15 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-700 border border-red-200'
                                    : announcement.priority === 'medium'
                                    ? isDarkMode ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                    : isDarkMode ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}>
                                  {announcement.priority.toUpperCase()}
                                </span>
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                                  announcement.type === 'alert'
                                    ? isDarkMode ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20' : 'bg-orange-50 text-orange-700 border border-orange-200'
                                    : announcement.type === 'news'
                                    ? isDarkMode ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20' : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                                    : announcement.type === 'update'
                                    ? isDarkMode ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20' : 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : isDarkMode ? 'bg-gray-500/15 text-gray-400 border border-gray-500/20' : 'bg-gray-50 text-gray-700 border border-gray-200'
                                }`}>
                                  {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                                </span>
                              </div>
                              <p className={`text-sm mb-4 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>
                                {announcement.message}
                              </p>
                              <div className="flex gap-6">
                                <div>
                                  <p className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>Created</p>
                                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white/80' : 'text-gray-800'}`}>{formatDate(announcement.createdAt)}</p>
                                </div>
                                {announcement.expiryDate && (
                                  <div>
                                    <p className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>Expires</p>
                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white/80' : 'text-gray-800'}`}>{formatDate(announcement.expiryDate)}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            {announcement.status === 'draft' && user?.role === 'superadmin' && (
                              <button
                                onClick={() => handlePublishAnnouncement(announcement.id)}
                                className={`ml-4 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isDarkMode ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                              >
                                Publish
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* No Results Message */}
                    {announcementsSearchTerm && announcements.filter(announcement => {
                      const searchTerm = announcementsSearchTerm.toLowerCase();
                      return (
                        announcement.title.toLowerCase().includes(searchTerm) ||
                        announcement.message.toLowerCase().includes(searchTerm) ||
                        announcement.type.toLowerCase().includes(searchTerm) ||
                        announcement.priority.toLowerCase().includes(searchTerm) ||
                        announcement.status.toLowerCase().includes(searchTerm)
                      );
                    }).length === 0 && (
                      <div className={`text-center py-12 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
                        <Megaphone className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-white/20' : 'text-gray-300'}`} />
                        <p className="text-lg font-medium mb-2">No announcements found</p>
                        <p className="text-sm">Try adjusting your search terms or check the spelling.</p>
                        <button
                          onClick={() => setAnnouncementsSearchTerm('')}
                          className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                        >
                          Clear Search
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Membership Details Section */}
            {activeSection === 'membership' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className={`rounded-2xl border p-8 ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-gray-200'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h2 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <CreditCard className="w-5 h-5" />
                      Membership Details Overview
                    </h2>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      {/* Search Input */}
                      <div className="relative w-full sm:w-80">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`} />
                        <input
                          type="text"
                          placeholder="Search members by name, email, or ID..."
                          value={membershipSearchTerm}
                          onChange={(e) => setMembershipSearchTerm(e.target.value)}
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-300 focus:outline-none focus:ring-2 ${isDarkMode 
                            ? 'bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/20 focus:ring-violet-500/20' 
                            : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-violet-300 focus:ring-violet-500/20'}`}
                        />
                        {membershipSearchTerm && (
                          <button
                            onClick={() => setMembershipSearchTerm('')}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10 text-white/40 hover:text-white/70' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      {/* Refresh Button */}
                      <button
                        onClick={() => {
                          console.log('🔄 Manual refresh: Fetching members...');
                          membersAPI.getAll()
                            .then(res => {
                              console.log('✅ Members refreshed:', res.data?.data?.length);
                              if (res.data?.data) {
                                setMemberAccounts(res.data.data);
                                toast.success(`✅ Member list updated! ${res.data.data.length} members found.`);
                              }
                            })
                            .catch(err => {
                              console.error('❌ Refresh failed:', err);
                              toast.error('Failed to refresh member list');
                            });
                        }}
                        className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 hover:scale-105 whitespace-nowrap ${isDarkMode ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30' : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200 border border-cyan-300'}`}
                        title="Refresh member list from database"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                      </button>
                    </div>
                  </div>

                  {/* Membership Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className={`p-6 rounded-2xl border transition-all hover:scale-105 ${isDarkMode ? 'bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20 hover:border-emerald-500/40' : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200 hover:border-emerald-300'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <Users className={`w-6 h-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-emerald-400/70' : 'text-emerald-600/70'}`}>Active</span>
                      </div>
                      <p className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {calculateMemberStats().totalMembers}
                      </p>
                      <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Total Members</h3>
                    </div>

                    <div className={`p-6 rounded-2xl border transition-all hover:scale-105 ${isDarkMode ? 'bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20 hover:border-blue-500/40' : 'bg-gradient-to-br from-blue-50 to-white border-blue-200 hover:border-blue-300'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <CheckCircle2 className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-400/70' : 'text-blue-600/70'}`}>Verified</span>
                      </div>
                      <p className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        {calculateMemberStats().activeMembers}
                      </p>
                      <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Active Memberships</h3>
                    </div>

                    <div className={`p-6 rounded-2xl border transition-all hover:scale-105 ${isDarkMode ? 'bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20 hover:border-amber-500/40' : 'bg-gradient-to-br from-amber-50 to-white border-amber-200 hover:border-amber-300'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <Clock className={`w-6 h-6 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-amber-400/70' : 'text-amber-600/70'}`}>Awaiting</span>
                      </div>
                      <p className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                        {calculateMemberStats().pendingMembers}
                      </p>
                      <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Pending Members</h3>
                    </div>
                  </div>

                  {/* Search Results Info */}
                  {membershipSearchTerm && (
                    <div className={`mb-4 text-sm ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
                      Found {memberAccounts.filter(account => 
                        account.full_name.toLowerCase().includes(membershipSearchTerm.toLowerCase()) ||
                        account.email.toLowerCase().includes(membershipSearchTerm.toLowerCase()) ||
                        account.member_id.toLowerCase().includes(membershipSearchTerm.toLowerCase()) ||
                        (account.company_name && account.company_name.toLowerCase().includes(membershipSearchTerm.toLowerCase())) ||
                        (account.job_title && account.job_title.toLowerCase().includes(membershipSearchTerm.toLowerCase()))
                      ).length} member(s) matching "{membershipSearchTerm}"
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {memberAccounts
                      .filter(account => {
                        if (!membershipSearchTerm) return true;
                        const searchTerm = membershipSearchTerm.toLowerCase();
                        return (
                          account.full_name.toLowerCase().includes(searchTerm) ||
                          account.email.toLowerCase().includes(searchTerm) ||
                          account.member_id.toLowerCase().includes(searchTerm) ||
                          (account.company_name && account.company_name.toLowerCase().includes(searchTerm)) ||
                          (account.job_title && account.job_title.toLowerCase().includes(searchTerm))
                        );
                      })
                      .map((account, index) => (
                      <div 
                        key={account.member_id}
                        className={`group relative rounded-xl border p-6 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06] hover:border-white/15 hover:shadow-xl hover:shadow-white/5' : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'}`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {/* Status indicator */}
                        <div className="flex items-center justify-between mb-4">
                          <span className={`text-xs font-mono ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>{account.member_id}</span>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                            <CheckCircle2 className="w-3 h-3 inline mr-1" />
                            Approved
                          </span>
                        </div>

                        {/* Member info */}
                        <div className="space-y-3">
                          <div>
                            <p className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{account.full_name}</p>
                            <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>{account.email}</p>
                          </div>

                          <div className={`pt-3 border-t ${isDarkMode ? 'border-white/[0.06]' : 'border-gray-100'} space-y-2`}>
                            {account.company_name && (
                              <div className="flex items-center justify-between">
                                <span className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Company:</span>
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{account.company_name}</span>
                              </div>
                            )}
                            {account.job_title && (
                              <div className="flex items-center justify-between">
                                <span className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Position:</span>
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{account.job_title}</span>
                              </div>
                            )}
                            {account.emirate && (
                              <div className="flex items-center justify-between">
                                <span className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Location:</span>
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{account.emirate}</span>
                              </div>
                            )}
                            {((account.software_and_tools || account.softwareAndTools)) && (
                              <div className="flex items-start justify-between gap-2">
                                <span className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Software:</span>
                                <span className={`text-sm font-medium text-right ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{account.software_and_tools || account.softwareAndTools}</span>
                              </div>
                            )}
                            {((account.linkedin_link || account.linkedinLink) || 
                              (account.behance_link || account.behanceLink) || 
                              (account.instagram_link || account.instagramLink)) && (
                              <div className="flex items-center gap-1.5 pt-1">
                                <span className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Links:</span>
                                <div className="flex gap-1">
                                  {(account.linkedin_link || account.linkedinLink) && (
                                    <a href={account.linkedin_link || account.linkedinLink} target="_blank" rel="noopener noreferrer" className="p-1 rounded hover:scale-110 transition-transform">
                                      <Linkedin className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                    </a>
                                  )}
                                  {(account.behance_link || account.behanceLink) && (
                                    <a href={account.behance_link || account.behanceLink} target="_blank" rel="noopener noreferrer" className="p-1 rounded hover:scale-110 transition-transform">
                                      <LinkIcon className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                    </a>
                                  )}
                                  {(account.instagram_link || account.instagramLink) && (
                                    <a href={(account.instagram_link || account.instagramLink).startsWith('@') 
                                      ? `https://instagram.com/${(account.instagram_link || account.instagramLink).slice(1)}`
                                      : (account.instagram_link || account.instagramLink)
                                    } target="_blank" rel="noopener noreferrer" className="p-1 rounded hover:scale-110 transition-transform">
                                      <Instagram className={`w-4 h-4 ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`} />
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <button 
                            onClick={() => setSelectedMember(account)}
                            className={`w-full mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* No Results Message */}
                  {membershipSearchTerm && memberAccounts.filter(account => {
                    const searchTerm = membershipSearchTerm.toLowerCase();
                    return (
                      account.full_name.toLowerCase().includes(searchTerm) ||
                      account.email.toLowerCase().includes(searchTerm) ||
                      account.member_id.toLowerCase().includes(searchTerm) ||
                      (account.company_name && account.company_name.toLowerCase().includes(searchTerm)) ||
                      (account.job_title && account.job_title.toLowerCase().includes(searchTerm))
                    );
                  }).length === 0 && (
                    <div className={`text-center py-12 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
                      <Users className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-white/20' : 'text-gray-300'}`} />
                      <p className="text-lg font-medium mb-2">No members found</p>
                      <p className="text-sm">Try adjusting your search terms or check the spelling.</p>
                      <button
                        onClick={() => setMembershipSearchTerm('')}
                        className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                      >
                        Clear Search
                      </button>
                    </div>
                  )}
                  
                  {/* No Approved Members Message */}
                  {!membershipSearchTerm && memberAccounts.length === 0 && (
                    <div className={`text-center py-12 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
                      <Users className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-white/20' : 'text-gray-300'}`} />
                      <p className="text-lg font-medium mb-2">No approved members yet</p>
                      <p className="text-sm">Members will appear here once they are approved in the Membership Approvals section.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Varafied ID Card Section */}
            {activeSection === 'id-card' && (
              <VarafiedIdCard />
            )}

            {/* Membership Approvals Section */}
            {activeSection === 'proofs' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-gray-200'}`}>
                  <div className={`p-6 border-b ${isDarkMode ? 'border-white/[0.06]' : 'border-gray-200'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                      <div>
                        <h2 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          <UserPlus className="w-5 h-5" />
                          Membership Applications
                        </h2>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
                          Review pending applications and approve or reject membership requests
                        </p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        {/* Search Input */}
                        <div className="relative w-full sm:w-80">
                          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`} />
                          <input
                            type="text"
                            placeholder="Search by name, email, or skills..."
                            value={proofsSearchTerm}
                            onChange={(e) => setProofsSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-300 focus:outline-none focus:ring-2 ${isDarkMode 
                              ? 'bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/20 focus:ring-violet-500/20' 
                              : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-violet-300 focus:ring-violet-500/20'}`}
                          />
                          {proofsSearchTerm && (
                            <button
                              onClick={() => setProofsSearchTerm('')}
                              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10 text-white/40 hover:text-white/70' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        {/* Report Button */}
                        <div className="relative">
                          <button
                            onClick={() => setReportDropdownOpen(reportDropdownOpen === 'approvals' ? null : 'approvals')}
                            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 hover:scale-105 whitespace-nowrap ${isDarkMode ? 'bg-violet-500 text-white hover:bg-violet-600 shadow-lg shadow-violet-500/30' : 'bg-violet-600 text-white hover:bg-violet-700'}`}
                          >
                            <FileText className="w-4 h-4" />
                            Report
                            <ChevronDown className={`w-4 h-4 transition-transform ${reportDropdownOpen === 'approvals' ? 'rotate-180' : ''}`} />
                          </button>
                          {reportDropdownOpen === 'approvals' && (
                            <div className={`absolute right-0 mt-2 w-48 rounded-xl border shadow-xl z-50 ${isDarkMode ? 'bg-[#14161A] border-white/10' : 'bg-white border-gray-200'}`}>
                              {[
                                { label: 'Today Report', value: 'today' },
                                { label: 'Weekly Report', value: 'weekly' },
                                { label: 'Monthly Report', value: 'monthly' },
                                { label: 'Yearly Report', value: 'yearly' },
                                { label: 'Custom Range', value: 'custom' },
                              ].map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() => {
                                    setReportType('approvals');
                                    setReportPeriod(option.value as any);
                                    setShowReportModal(true);
                                    setReportDropdownOpen(null);
                                  }}
                                  className={`w-full px-4 py-3 text-left text-sm transition-colors first:rounded-t-xl last:rounded-b-xl ${isDarkMode ? 'hover:bg-white/5 text-white/70 hover:text-white' : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'}`}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats Bar */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                        <div className="flex items-center gap-3">
                          <Clock className={`w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                          <div>
                            <p className={`text-xs ${isDarkMode ? 'text-amber-400/70' : 'text-amber-600/70'}`}>Pending</p>
                            <p className={`text-lg font-bold ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                              {pendingApplications.filter(app => app.status === 'pending').length + pendingUsers.length}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'}`}>
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className={`w-5 h-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                          <div>
                            <p className={`text-xs ${isDarkMode ? 'text-emerald-400/70' : 'text-emerald-600/70'}`}>Approved</p>
                            <p className={`text-lg font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                              {pendingApplications.filter(app => app.status === 'approved').length}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                        <div className="flex items-center gap-3">
                          <XCircle className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                          <div>
                            <p className={`text-xs ${isDarkMode ? 'text-red-400/70' : 'text-red-600/70'}`}>Rejected</p>
                            <p className={`text-lg font-bold ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                              {pendingApplications.filter(app => app.status === 'rejected').length}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Pending User Accounts */}
                      {pendingUsers.map((user, index) => (
                        <div 
                          key={`user-${user.id}`}
                          className={`group relative rounded-xl border overflow-hidden transition-all duration-300 hover:scale-[1.01] cursor-pointer ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06] hover:border-white/15 hover:shadow-xl hover:shadow-white/5' : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'}`}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {/* Header with Profile Photo */}
                          <div className={`p-5 border-b ${isDarkMode ? 'border-white/[0.06] bg-gradient-to-br from-blue-500/10 to-cyan-500/10' : 'border-gray-200 bg-gradient-to-br from-blue-50 to-cyan-50'}`}>
                            <div className="flex items-start gap-4">
                              <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-blue-500 to-cyan-500' : 'bg-gradient-to-br from-blue-600 to-cyan-600'} text-white shadow-lg`}>
                                <User className="w-8 h-8" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className={`text-lg font-bold mb-1 truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</h3>
                                <p className={`text-sm mb-1 truncate ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>{user.email}</p>
                                <p className={`text-xs truncate ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Account Registration</p>
                                {user.membership_applications && user.membership_applications[0]?.assigned_admin && (
                                  <p className={`text-xs mt-1 truncate flex items-center gap-1 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`}>
                                    <Shield className="w-3 h-3" />
                                    Assigned: {user.membership_applications[0].assigned_admin.name}
                                  </p>
                                )}
                              </div>
                              <span className={`px-3 py-1 rounded-lg text-xs font-medium border whitespace-nowrap ${isDarkMode ? 'bg-blue-500/20 border-blue-500/30 text-blue-300' : 'bg-blue-100 border-blue-300 text-blue-700'}`}>
                                <Clock className="w-3 h-3 inline mr-1" />
                                Pending
                              </span>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="p-5 space-y-4">
                            {/* Contact Info */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                                <Phone className={`w-4 h-4 mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                <p className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Phone</p>
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.phone || 'N/A'}</p>
                              </div>
                              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                                <Calendar className={`w-4 h-4 mb-1 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                                <p className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Registered</p>
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{new Date(user.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-3 border-t border-white/5">
                              <button 
                                onClick={() => setSelectedPendingUser(user)}
                                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${isDarkMode ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  authAPI.approveUser(user.id).then(() => {
                                    console.log('✅ User approved:', user.id);
                                    toast.success(`✅ ${user.name} approved successfully!`);
                                    
                                    // Remove from pending list
                                    setPendingUsers(pendingUsers.filter(u => u.id !== user.id));
                                    
                                    // Refresh members list to show newly approved user
                                    console.log('🔄 Refreshing members list...');
                                    membersAPI.getAll()
                                      .then(res => {
                                        console.log('📋 Members API Response:');
                                        console.log('  Status:', res.status);
                                        console.log('  Data count:', res.data?.data?.length);
                                        console.log('  Full response:', res.data?.data);
                                        
                                        if (res.data?.data && Array.isArray(res.data.data)) {
                                          console.log(`✅ Members list refreshed with ${res.data.data.length} members`);
                                          setMemberAccounts(res.data.data);
                                          toast.success(`✅ Members list updated! ${res.data.data.length} members found.`);
                                        } else {
                                          console.warn('⚠️ Response data is not in expected format:', res.data);
                                          toast.warning('Members list may not have updated');
                                        }
                                      })
                                      .catch(err => {
                                        console.error('❌ Failed to refresh members:', err);
                                        toast.error('Failed to refresh members list');
                                      });
                                  }).catch(err => {
                                    console.error('❌ Approval error:', err);
                                    toast.error('Failed to approve user');
                                  });
                                }}
                                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${isDarkMode ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                              >
                                <Check className="w-4 h-4" />
                                Approve & Add to Members
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  authAPI.rejectUser(user.id).then(() => {
                                    setPendingUsers(pendingUsers.filter(u => u.id !== user.id));
                                  }).catch(err => console.error('Rejection error:', err));
                                }}
                                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${isDarkMode ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Pending Applications */}
                      {pendingApplications
                        .filter((app, index, self) => {
                          // First, remove any duplicates within pendingApplications array itself (by email)
                          const firstOccurrence = self.findIndex(a => a.email.toLowerCase() === app.email.toLowerCase());
                          const isFirstEmail = index === firstOccurrence;
                          
                          // Then, filter out applications that belong to users already shown in pendingUsers
                          const userEmails = pendingUsers.map(u => u.email.toLowerCase());
                          const isNotDuplicate = !userEmails.includes(app.email.toLowerCase());
                          
                          if (!proofsSearchTerm) return app.status === 'pending' && isNotDuplicate && isFirstEmail;
                          const searchTerm = proofsSearchTerm.toLowerCase();
                          return app.status === 'pending' && isNotDuplicate && isFirstEmail && (
                            app.fullName.toLowerCase().includes(searchTerm) ||
                            app.email.toLowerCase().includes(searchTerm) ||
                            app.jobTitle.toLowerCase().includes(searchTerm) ||
                            app.companyName.toLowerCase().includes(searchTerm) ||
                            app.skillsets.some(skill => skill.toLowerCase().includes(searchTerm))
                          );
                        })
                        .map((app, index) => (
                      <div 
                        key={`app-${app.id}`}
                        className={`group relative rounded-xl border overflow-hidden transition-all duration-300 hover:scale-[1.01] cursor-pointer ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06] hover:border-white/15 hover:shadow-xl hover:shadow-white/5' : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'}`}
                        style={{ animationDelay: `${(pendingUsers.length + index) * 50}ms` }}
                        onClick={() => setSelectedApplication(app)}
                      >
                        {/* Header with Profile Photo */}
                        <div className={`p-5 border-b ${isDarkMode ? 'border-white/[0.06] bg-gradient-to-br from-violet-500/10 to-cyan-500/10' : 'border-gray-200 bg-gradient-to-br from-violet-50 to-cyan-50'}`}>
                          <div className="flex items-start gap-4">
                            <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-violet-500 to-cyan-500' : 'bg-gradient-to-br from-violet-600 to-cyan-600'} text-white shadow-lg`}>
                              <User className="w-8 h-8" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className={`text-lg font-bold mb-1 truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{app.fullName}</h3>
                              <p className={`text-sm mb-1 truncate ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>{app.jobTitle}</p>
                              <p className={`text-xs truncate ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>{app.companyName}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(app.status)}`}>
                              <Clock className="w-3 h-3 inline mr-1" />
                              Pending
                            </span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-5 space-y-4">
                          {/* Quick Info */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                              <MapPin className={`w-4 h-4 mb-1 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
                              <p className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Location</p>
                              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{app.emirate}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                              <Briefcase className={`w-4 h-4 mb-1 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                              <p className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Experience</p>
                              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{app.totalIndustryExperience} years</p>
                            </div>
                          </div>

                          {/* Skills Preview */}
                          <div>
                            <p className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>
                              <Award className="w-3 h-3 inline mr-1" />
                              Skills ({app.skillsets.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {app.skillsets.slice(0, 3).map((skill, idx) => (
                                <span key={idx} className={`px-2 py-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 'bg-violet-50 text-violet-700 border border-violet-200'}`}>
                                  {skill}
                                </span>
                              ))}
                              {app.skillsets.length > 3 && (
                                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-600'}`}>
                                  +{app.skillsets.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Portfolio Link */}
                          {app.portfolioLink && (
                            <div className={`p-3 rounded-lg flex items-center gap-2 ${isDarkMode ? 'bg-gradient-to-r from-violet-500/10 to-transparent border border-violet-500/20' : 'bg-gradient-to-r from-violet-50 to-transparent border border-violet-200'}`}>
                              <LinkIcon className={`w-4 h-4 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
                              <span className={`text-xs font-medium flex-1 truncate ${isDarkMode ? 'text-violet-400' : 'text-violet-700'}`}>Portfolio Available</span>
                              <ExternalLink className={`w-3 h-3 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
                            </div>
                          )}

                          {/* Volunteering Interest */}
                          {app.interestedInVolunteering === 'Yes' && (
                            <div className={`p-3 rounded-lg flex items-center gap-2 ${isDarkMode ? 'bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20' : 'bg-gradient-to-r from-emerald-50 to-transparent border border-emerald-200'}`}>
                              <Heart className={`w-4 h-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                              <span className={`text-xs font-medium ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>Interested in Volunteering ({app.volunteeringAreas.length} areas)</span>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-3 border-t border-white/5">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedApplication(app);
                              }}
                              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                            >
                              <Eye className="w-4 h-4" />
                              View Full Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    </div>
                    
                    {/* No Results Message */}
                    {pendingApplications.filter(app => app.status === 'pending').length === 0 && pendingUsers.length === 0 && (
                      <div className={`text-center py-12 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
                        <UserPlus className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-white/20' : 'text-gray-300'}`} />
                        <p className="text-lg font-medium mb-2">No pending approvals</p>
                        <p className="text-sm">All applications and user registrations have been reviewed.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Settings Section - Board Members */}
            {activeSection === 'settings' && (
              <div className={`p-8 rounded-2xl border ${isDarkMode ? 'bg-[#14161A] border-white/10' : 'bg-white border-gray-200'}`}>
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
                      <Shield className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      System Administrators
                    </h2>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
                    Manage system administrators and their access levels. Superadmins have full edit and view access, while Admins have view-only access.
                  </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20' : 'bg-gradient-to-br from-purple-50 to-white border-purple-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <Shield className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                      <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{boardMembers.filter(m => m.role === 'admin' || m.role === 'superadmin').length}</span>
                    </div>
                    <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Total Administrators</h3>
                  </div>

                  <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20' : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <Award className={`w-5 h-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{boardMembers.filter(m => m.role === 'superadmin').length}</span>
                    </div>
                    <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Superadmins</h3>
                  </div>

                  <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/20' : 'bg-gradient-to-br from-cyan-50 to-white border-cyan-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <User className={`w-5 h-5 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                      <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{boardMembers.filter(m => m.role === 'admin').length}</span>
                    </div>
                    <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Admins</h3>
                  </div>
                </div>

                {/* Board Members Section */}
                <div>
                  {/* Search and Add Button */}
                  <div className="flex items-center gap-4 mb-6">
                      <div className="flex-1 relative">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`} />
                        <input
                          type="text"
                          placeholder="Search administrators by name or email..."
                          value={rbacSearchTerm}
                          onChange={(e) => setRbacSearchTerm(e.target.value)}
                          className={`w-full pl-10 pr-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500'}`}
                        />
                      </div>
                      <button
                        onClick={() => setShowAddBoardMemberModal(true)}
                        className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2 ${isDarkMode ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'}`}
                      >
                        <UserPlus className="w-4 h-4" />
                        Add Administrator
                      </button>
                    </div>

                    {/* Administrators Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {boardMembers
                        .filter(member => (member.role === 'admin' || member.role === 'superadmin') && (
                          member.name.toLowerCase().includes(rbacSearchTerm.toLowerCase()) ||
                          member.email.toLowerCase().includes(rbacSearchTerm.toLowerCase())
                        ))
                        .map((member) => (
                          <div key={member.id} className={`rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg ${isDarkMode ? 'bg-white/[0.02] border-white/10 hover:border-white/20' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                            {/* Card Header with Role and Status */}
                            <div className={`p-4 border-b ${isDarkMode ? 'border-white/10 bg-white/[0.01]' : 'border-gray-100 bg-gray-50'}`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>{member.role === 'superadmin' ? 'SUPERADMIN' : 'ADMIN'}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.status === 'active' ? (isDarkMode ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200') : (isDarkMode ? 'bg-red-500/15 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-700 border border-red-200')}`}>
                                  {member.status === 'active' ? '✓ Active' : '○ Inactive'}
                                </span>
                              </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-6">
                              {/* Avatar and Name */}
                              <div className="flex items-start gap-4 mb-4">
                                <div className={`w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 ${isDarkMode ? (member.role === 'superadmin' ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' : 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20') : (member.role === 'superadmin' ? 'bg-gradient-to-br from-purple-100 to-pink-100' : 'bg-gradient-to-br from-blue-100 to-cyan-100')}`}>
                                  <Shield className={`w-8 h-8 ${isDarkMode ? (member.role === 'superadmin' ? 'text-purple-400' : 'text-blue-400') : (member.role === 'superadmin' ? 'text-purple-600' : 'text-blue-600')}`} />
                                </div>
                                <div className="flex-1">
                                  <h3 className={`text-lg font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{member.name}</h3>
                                  <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>{member.email}</p>
                                </div>
                              </div>

                              {/* Role Badge */}
                              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-4 ${member.role === 'superadmin' ? (isDarkMode ? 'bg-purple-500/15 border border-purple-500/30' : 'bg-purple-50 border border-purple-200') : (isDarkMode ? 'bg-blue-500/15 border border-blue-500/30' : 'bg-blue-50 border border-blue-200')}`}>
                                <Award className={`w-4 h-4 ${member.role === 'superadmin' ? (isDarkMode ? 'text-purple-400' : 'text-purple-600') : (isDarkMode ? 'text-blue-400' : 'text-blue-600')}`} />
                                <span className={`text-xs font-medium capitalize ${member.role === 'superadmin' ? (isDarkMode ? 'text-purple-400' : 'text-purple-700') : (isDarkMode ? 'text-blue-400' : 'text-blue-700')}`}>{member.role}</span>
                              </div>

                              {/* Permissions Info */}
                              <div className="space-y-2 mb-4">
                                <p className={`text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`}>Permissions</p>
                                <div className="flex flex-wrap gap-2">
                                  {member.role === 'superadmin' ? (
                                    <>
                                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs ${isDarkMode ? 'bg-white/5 text-white/70' : 'bg-gray-100 text-gray-700'} border ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                                        <Edit className="w-3 h-3" />
                                        <span>Edit</span>
                                      </div>
                                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs ${isDarkMode ? 'bg-white/5 text-white/70' : 'bg-gray-100 text-gray-700'} border ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                                        <Eye className="w-3 h-3" />
                                        <span>View</span>
                                      </div>
                                    </>
                                  ) : (
                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs ${isDarkMode ? 'bg-white/5 text-white/70' : 'bg-gray-100 text-gray-700'} border ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                                      <Eye className="w-3 h-3" />
                                      <span>View Only</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Meta Info */}
                              <div className={`text-xs space-y-1 mb-4 py-3 border-t ${isDarkMode ? 'border-white/10 text-white/50' : 'border-gray-200 text-gray-500'}`}>
                                <p>Assigned: {member.assignedDate}</p>
                                {member.lastLogin && <p>Last login: {member.lastLogin}</p>}
                              </div>

                              {/* View Details Button */}
                              <button 
                                onClick={() => setSelectedAdmin(member)}
                                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${isDarkMode ? 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'}`}>
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* No Results */}
                    {boardMembers.filter(member => (member.role === 'admin' || member.role === 'superadmin') && (
                      member.name.toLowerCase().includes(rbacSearchTerm.toLowerCase()) ||
                      member.email.toLowerCase().includes(rbacSearchTerm.toLowerCase())
                    )).length === 0 && (
                      <div className="col-span-full">
                        <div className={`text-center py-16 rounded-xl border-2 border-dashed ${isDarkMode ? 'border-white/10 bg-white/[0.01]' : 'border-gray-200 bg-gray-50'}`}>
                          <Shield className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-white/20' : 'text-gray-300'}`} />
                          <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No administrators found</p>
                          <p className={`text-sm ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Try adjusting your search or add a new administrator.</p>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>

      {/* Document Viewer Modal */}
      {selectedProof && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedProof(null)}></div>
          <div className={`relative w-full max-w-4xl rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-[#14161A] border-white/10' : 'bg-white border-gray-200'}`}>
            {/* Modal header */}
            <div className={`p-6 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'} flex items-center justify-between`}>
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedProof.memberName}</h3>
                <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>{selectedProof.memberId} • {selectedProof.documentType}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                  <Download className={`w-5 h-5 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`} />
                </button>
                <button 
                  onClick={() => setSelectedProof(null)}
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`} />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className={`p-6 ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
              <div className="aspect-[16/10] rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center">
                <FileText className={`w-32 h-32 ${isDarkMode ? 'text-white/20' : 'text-gray-300'}`} />
              </div>
            </div>

            {/* Modal footer */}
            <div className={`p-6 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${getStatusColor(selectedProof.status)}`}>
                  {selectedProof.status.charAt(0).toUpperCase() + selectedProof.status.slice(1)}
                </span>
                <span className={`text-sm ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
                  Uploaded {formatDate(selectedProof.uploadDate)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>
                  Reject
                </button>
                <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending User Details Modal */}
      {selectedPendingUser && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedPendingUser(null)}></div>
          <div className={`relative w-full max-w-5xl rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-300 my-8 ${isDarkMode ? 'bg-[#14161A] border-white/10' : 'bg-white border-gray-200'}`}>
            {/* Modal header with gradient */}
            <div className={`p-6 border-b relative overflow-hidden ${isDarkMode ? 'border-white/10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20' : 'border-gray-200 bg-gradient-to-br from-blue-100 to-cyan-100'}`}>
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-20 h-20 rounded-xl flex items-center justify-center text-3xl font-bold overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-blue-500 to-cyan-500' : 'bg-gradient-to-br from-blue-600 to-cyan-600'} text-white shadow-lg`}>
                    <User className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPendingUser.membership_applications?.[0]?.full_name || selectedPendingUser.name}</h3>
                    <p className={`text-base mt-1 ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>{selectedPendingUser.membership_applications?.[0]?.job_title || 'N/A'}</p>
                    <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>{selectedPendingUser.membership_applications?.[0]?.company_name || 'N/A'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${isDarkMode ? 'bg-blue-500/20 border-blue-500/30 text-blue-300' : 'bg-blue-100 border-blue-300 text-blue-700'}`}>
                        <Clock className="w-3 h-3 inline mr-1" />
                        Pending Approval
                      </span>
                      <span className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
                        Joined {formatDate(selectedPendingUser.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPendingUser(null)}
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`} />
                </button>
              </div>
            </div>

            {/* Modal body - scrollable content */}
            <div className={`p-6 max-h-[calc(100vh-300px)] overflow-y-auto ${isDarkMode ? 'bg-[#14161A]' : 'bg-white'}`}>
              <div className="space-y-6">
                
                {/* Personal Information */}
                <div className={`rounded-xl border p-5 ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-gray-50 border-gray-200'}`}>
                  <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <User className="w-5 h-5" />
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Gender</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPendingUser.membership_applications?.[0]?.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Age Category</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPendingUser.membership_applications?.[0]?.age_category || 'N/A'}</p>
                    </div>
                    <div>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Blood Group</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPendingUser.membership_applications?.[0]?.blood_group || 'N/A'}</p>
                    </div>
                    <div>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>VARA WhatsApp Group</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPendingUser.membership_applications?.[0]?.vara_whatsapp_group || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Email</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPendingUser.email}</p>
                    </div>
                  </div>
                </div>

                {/* Professional Details */}
                <div className={`rounded-xl border p-5 ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-gray-50 border-gray-200'}`}>
                  <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Briefcase className="w-5 h-5" />
                    Professional Details
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Visa Status</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPendingUser.membership_applications?.[0]?.visa_status || 'N/A'}</p>
                    </div>
                    <div>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>UAE Experience</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{(selectedPendingUser.membership_applications?.[0]?.years_in_uae || 0)}y {(selectedPendingUser.membership_applications?.[0]?.months_in_uae || 0)}m</p>
                    </div>
                    <div>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Industry Experience</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPendingUser.membership_applications?.[0]?.total_industry_experience || 'N/A'}</p>
                    </div>
                    <div className="col-span-2 md:col-span-3">
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Primary Area of Work</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPendingUser.membership_applications?.[0]?.primary_area_of_work || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Skills & Portfolio - HIGHLIGHTED */}
                <div className={`rounded-xl border p-5 ${isDarkMode ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30' : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300'}`}>
                  <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Award className="w-5 h-5" />
                    Skills & Portfolio
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <p className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>
                        Core Skills ({selectedPendingUser.membership_applications?.[0]?.skillsets?.length || 0})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(selectedPendingUser.membership_applications?.[0]?.skillsets || []).map((skill, idx) => (
                          <span key={idx} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${isDarkMode ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-blue-100 text-blue-800 border border-blue-300'}`}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    {selectedPendingUser.membership_applications?.[0]?.other_skill && (
                      <div>
                        <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Additional Skills</p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPendingUser.membership_applications?.[0]?.other_skill}</p>
                      </div>
                    )}
                    {selectedPendingUser.membership_applications?.[0]?.portfolio_link && (
                      <div className={`p-4 rounded-lg flex items-center justify-between ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                            <LinkIcon className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Portfolio</p>
                            <p className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-gray-500'} truncate max-w-md`}>{selectedPendingUser.membership_applications?.[0]?.portfolio_link}</p>
                          </div>
                        </div>
                        <a
                          href={selectedPendingUser.membership_applications?.[0]?.portfolio_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${isDarkMode ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Portfolio
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Volunteering Interest */}
                {selectedPendingUser.membership_applications?.[0]?.interested_in_volunteering && (
                  <div className={`rounded-xl border p-5 ${isDarkMode ? 'bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/30' : 'bg-gradient-to-br from-emerald-50 to-transparent border-emerald-300'}`}>
                    <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Heart className="w-5 h-5" />
                      Volunteering Interest
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(selectedPendingUser.membership_applications?.[0]?.volunteering_areas || []).map((area, idx) => (
                        <span key={idx} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${isDarkMode ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}`}>
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact & Location */}
                <div className={`rounded-xl border p-5 ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-gray-50 border-gray-200'}`}>
                  <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <MapPin className="w-5 h-5" />
                    Contact & Location
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Emirate</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPendingUser.membership_applications?.[0]?.emirate || 'N/A'}</p>
                    </div>
                    <div>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Area</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPendingUser.membership_applications?.[0]?.area_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Kerala District</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPendingUser.membership_applications?.[0]?.kerala_district || 'N/A'}</p>
                    </div>
                    <div>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Contact</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{(selectedPendingUser.membership_applications?.[0]?.country_code || '+971')} {selectedPendingUser.membership_applications?.[0]?.contact_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>WhatsApp</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{(selectedPendingUser.membership_applications?.[0]?.whatsapp_country_code || '+971')} {selectedPendingUser.membership_applications?.[0]?.whatsapp_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Membership Fee</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPendingUser.membership_applications?.[0]?.proceed_with_membership_fee ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>

                {/* Message */}
                {selectedPendingUser.membership_applications?.[0]?.message && (
                  <div className={`rounded-xl border p-5 ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-gray-50 border-gray-200'}`}>
                    <h4 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Message from Applicant</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} italic`}>"{selectedPendingUser.membership_applications?.[0]?.message}"</p>
                  </div>
                )}

              </div>
            </div>

            {/* Modal footer - Action buttons */}
            <div className={`p-6 border-t ${isDarkMode ? 'border-white/10 bg-[#14161A]' : 'border-gray-200 bg-white'} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
                  User ID: {selectedPendingUser.id}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    authAPI.rejectUser(selectedPendingUser.id).then(() => {
                      setPendingUsers(pendingUsers.filter(u => u.id !== selectedPendingUser.id));
                      setSelectedPendingUser(null);
                    }).catch(err => console.error('Rejection error:', err));
                  }}
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${isDarkMode ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'}`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  Reject Application
                </button>
                <button 
                  onClick={() => {
                    authAPI.approveUser(selectedPendingUser.id).then(() => {
                      console.log('✅ User approved from modal:', selectedPendingUser.id);
                      setPendingUsers(pendingUsers.filter(u => u.id !== selectedPendingUser.id));
                      setSelectedPendingUser(null);
                      // Refresh members list to show newly approved user
                      membersAPI.getAll().then(res => {
                        console.log('📋 Members list refreshed from modal:', res.data?.data);
                        if (res.data?.data) {
                          console.log('Total members after refresh:', res.data.data.length);
                          setMemberAccounts(res.data.data);
                        }
                      }).catch(err => console.error('❌ Failed to refresh members:', err));
                    }).catch(err => console.error('❌ Approval error:', err));
                  }}
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${isDarkMode ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700' : 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800'} shadow-lg shadow-emerald-500/30`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  Approve & Add to Members
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedApplication(null)}></div>
          <div className={`relative w-full max-w-5xl rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-300 my-8 ${isDarkMode ? 'bg-[#14161A] border-white/10' : 'bg-white border-gray-200'}`}>
            {/* Modal header with gradient */}
            <div className={`p-6 border-b relative overflow-hidden ${isDarkMode ? 'border-white/10 bg-gradient-to-br from-violet-500/20 to-cyan-500/20' : 'border-gray-200 bg-gradient-to-br from-violet-100 to-cyan-100'}`}>
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-20 h-20 rounded-xl flex items-center justify-center text-3xl font-bold overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-violet-500 to-cyan-500' : 'bg-gradient-to-br from-violet-600 to-cyan-600'} text-white shadow-lg`}>
                    <User className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedApplication.fullName}</h3>
                    <p className={`text-base mt-1 ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>{selectedApplication.jobTitle}</p>
                    <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>{selectedApplication.companyName}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(selectedApplication.status)}`}>
                        {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                      </span>
                      <span className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
                        Applied {formatDate(selectedApplication.applicationDate)}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedApplication(null)}
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`} />
                </button>
              </div>
            </div>

            {/* Modal body - scrollable content */}
            <div className={`p-6 max-h-[calc(100vh-300px)] overflow-y-auto ${isDarkMode ? 'bg-[#14161A]' : 'bg-white'}`}>
              <div className="space-y-6">
                
                {/* Personal Information */}
                <div className={`rounded-xl border p-5 ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-gray-50 border-gray-200'}`}>
                  <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <User className="w-5 h-5" />
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Gender</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedApplication.gender}</p>
                    </div>
                    <div>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Age Category</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedApplication.ageCategory}</p>
                    </div>
                    <div>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Blood Group</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedApplication.bloodGroup}</p>
                    </div>
                    <div>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>VARA WhatsApp Group</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedApplication.varaWhatsappGroup}</p>
                    </div>
                    <div className="col-span-2">
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Email</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedApplication.email}</p>
                    </div>
                  </div>
                </div>

                {/* Professional Details */}
                <div className={`rounded-xl border p-5 ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-gray-50 border-gray-200'}`}>
                  <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Briefcase className="w-5 h-5" />
                    Professional Details
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Visa Status</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedApplication.visaStatus}</p>
                    </div>
                    <div>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>UAE Experience</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedApplication.yearsInUAE}y {selectedApplication.monthsInUAE}m</p>
                    </div>
                    <div>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Industry Experience</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedApplication.totalIndustryExperience} years</p>
                    </div>
                    <div className="col-span-2 md:col-span-3">
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Primary Area of Work</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedApplication.primaryAreaOfWork}</p>
                    </div>
                  </div>
                </div>

                {/* Skills & Portfolio - HIGHLIGHTED */}
                <div className={`rounded-xl border p-5 ${isDarkMode ? 'bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border-violet-500/30' : 'bg-gradient-to-br from-violet-50 to-cyan-50 border-violet-300'}`}>
                  <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Award className="w-5 h-5" />
                    Skills & Portfolio
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <p className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>
                        Core Skills ({selectedApplication.skillsets.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplication.skillsets.map((skill, idx) => (
                          <span key={idx} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${isDarkMode ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-violet-100 text-violet-800 border border-violet-300'}`}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    {selectedApplication.otherSkill && (
                      <div>
                        <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Additional Skills</p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedApplication.otherSkill}</p>
                      </div>
                    )}
                    {selectedApplication.portfolioLink && (
                      <div className={`p-4 rounded-lg flex items-center justify-between ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-violet-500/20' : 'bg-violet-100'}`}>
                            <LinkIcon className={`w-5 h-5 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Portfolio</p>
                            <p className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-gray-500'} truncate max-w-md`}>{selectedApplication.portfolioLink}</p>
                          </div>
                        </div>
                        <a
                          href={selectedApplication.portfolioLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${isDarkMode ? 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30' : 'bg-violet-100 text-violet-700 hover:bg-violet-200'}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Portfolio
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                    {(selectedApplication.linkedinLink || selectedApplication.behanceLink || selectedApplication.instagramLink) && (
                      <div>
                        <p className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>
                          Social Media & Professional Links
                        </p>
                        <div className="space-y-2">
                          {selectedApplication.linkedinLink && (
                            <div className={`p-3 rounded-lg flex items-center gap-3 ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                              <Linkedin className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                              <a 
                                href={selectedApplication.linkedinLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`text-sm flex-grow truncate ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                              >
                                {selectedApplication.linkedinLink}
                              </a>
                              <ExternalLink className="w-3 h-3" />
                            </div>
                          )}
                          {selectedApplication.behanceLink && (
                            <div className={`p-3 rounded-lg flex items-center gap-3 ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                              <LinkIcon className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                              <a 
                                href={selectedApplication.behanceLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`text-sm flex-grow truncate ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                              >
                                Behance: {selectedApplication.behanceLink}
                              </a>
                              <ExternalLink className="w-3 h-3" />
                            </div>
                          )}
                          {selectedApplication.instagramLink && (
                            <div className={`p-3 rounded-lg flex items-center gap-3 ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                              <Instagram className={`w-4 h-4 ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`} />
                              <a 
                                href={selectedApplication.instagramLink.startsWith('http') ? selectedApplication.instagramLink : `https://instagram.com/${selectedApplication.instagramLink.replace('@', '')}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`text-sm flex-grow truncate ${isDarkMode ? 'text-pink-400 hover:text-pink-300' : 'text-pink-600 hover:text-pink-700'}`}
                              >
                                {selectedApplication.instagramLink}
                              </a>
                              <ExternalLink className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {selectedApplication.softwareAndTools && (
                      <div>
                        <p className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Software & Tools</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedApplication.softwareAndTools.split(',').map((tool: string, idx: number) => (
                            <span key={idx} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-cyan-100 text-cyan-800 border border-cyan-300'}`}>
                              {tool.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Volunteering Interest */}
                {selectedApplication.interestedInVolunteering === 'Yes' && (
                  <div className={`rounded-xl border p-5 ${isDarkMode ? 'bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/30' : 'bg-gradient-to-br from-emerald-50 to-transparent border-emerald-300'}`}>
                    <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Heart className="w-5 h-5" />
                      Volunteering Interest
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.volunteeringAreas.map((area, idx) => (
                        <span key={idx} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${isDarkMode ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}`}>
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact & Location */}
                <div className={`rounded-xl border p-5 ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-gray-50 border-gray-200'}`}>
                  <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <MapPin className="w-5 h-5" />
                    Contact & Location
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Emirate</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedApplication.emirate}</p>
                    </div>
                    <div>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Area</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedApplication.areaName}</p>
                    </div>
                    <div>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Kerala District</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedApplication.keralaDistrict}</p>
                    </div>
                    <div>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Contact</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedApplication.countryCode} {selectedApplication.contactNumber}</p>
                    </div>
                    <div>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>WhatsApp</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedApplication.whatsappCountryCode} {selectedApplication.whatsappNumber}</p>
                    </div>
                    <div>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Membership Fee</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedApplication.proceedWithMembershipFee}</p>
                    </div>
                  </div>
                </div>

                {/* Message */}
                {selectedApplication.message && (
                  <div className={`rounded-xl border p-5 ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-gray-50 border-gray-200'}`}>
                    <h4 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Message from Applicant</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} italic`}>"{selectedApplication.message}"</p>
                  </div>
                )}

              </div>
            </div>

            {/* Modal footer - Action buttons */}
            <div className={`p-6 border-t ${isDarkMode ? 'border-white/10 bg-[#14161A]' : 'border-gray-200 bg-white'} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
                  Application ID: {selectedApplication.id}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleRejectApplication(selectedApplication.id)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${isDarkMode ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'}`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  Reject Application
                </button>
                <button 
                  onClick={() => handleApproveApplication(selectedApplication.id)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${isDarkMode ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700' : 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800'} shadow-lg shadow-emerald-500/30`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  Approve & Add to Members
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Income Modal */}
      {showAddIncomeModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowAddIncomeModal(false)}></div>
          <div className={`relative w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-[#14161A] border-white/10' : 'bg-white border-gray-200'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <ArrowUpCircle className="w-5 h-5 text-emerald-400" />
                Add New Income
              </h3>
            </div>
            <form onSubmit={handleAddIncome} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Income Category</label>
                <select 
                  name="category" 
                  value={incomeCategory}
                  onChange={(e) => setIncomeCategory(e.target.value)}
                  required 
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500' : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500'}`}
                >
                  <option value="Membership Fees" className="text-gray-900 bg-white">Membership Fees</option>
                  <option value="Event Revenue" className="text-gray-900 bg-white">Event Revenue</option>
                  <option value="Donations" className="text-gray-900 bg-white">Donations</option>
                  <option value="Sponsorships" className="text-gray-900 bg-white">Sponsorships</option>
                  <option value="Grants" className="text-gray-900 bg-white">Grants</option>
                  <option value="Merchandise Sales" className="text-gray-900 bg-white">Merchandise Sales</option>
                  <option value="Custom" className="text-gray-900 bg-white">Custom Category</option>
                </select>
              </div>
              {incomeCategory === 'Custom' && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Custom Category Name</label>
                  <input 
                    type="text" 
                    name="customCategory" 
                    required 
                    className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500 placeholder:text-white/40' : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500 placeholder:text-gray-400'}`} 
                    placeholder="Enter custom category..." 
                  />
                </div>
              )}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Income Source</label>
                <select name="source" required className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500' : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500'}`}>
                  <option value="Membership Fees" className="text-gray-900 bg-white">Membership Fees</option>
                  <option value="Event Revenue" className="text-gray-900 bg-white">Event Revenue</option>
                  <option value="Donations" className="text-gray-900 bg-white">Donations</option>
                  <option value="Other" className="text-gray-900 bg-white">Other</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Description</label>
                <input type="text" name="description" required className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500 placeholder:text-white/40' : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500 placeholder:text-gray-400'}`} placeholder="Enter description..." />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Amount</label>
                <input type="number" name="amount" required className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500 placeholder:text-white/40' : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500 placeholder:text-gray-400'}`} placeholder="0.00" step="0.01" />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Date</label>
                <input type="date" name="date" required className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500' : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500'}`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Payment Mode</label>
                <select 
                  name="paymentMode" 
                  value={incomePaymentMode} 
                  onChange={(e) => setIncomePaymentMode(e.target.value)}
                  required 
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500' : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500'}`}
                >
                  <option value="Cash" className="text-gray-900 bg-white">Cash</option>
                  <option value="UPI" className="text-gray-900 bg-white">UPI</option>
                  <option value="Bank Transfer" className="text-gray-900 bg-white">Bank Transfer</option>
                  <option value="NEFT" className="text-gray-900 bg-white">NEFT</option>
                  <option value="Credit Card" className="text-gray-900 bg-white">Credit Card</option>
                  <option value="Cheque" className="text-gray-900 bg-white">Cheque</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Status</label>
                <select name="status" required className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500' : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500'}`}>
                  <option value="received">Received</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddIncomeModal(false)} className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                  Cancel
                </button>
                <button type="submit" className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${isDarkMode ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                  Add Income
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowAddExpenseModal(false)}></div>
          <div className={`relative w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-[#14161A] border-white/10' : 'bg-white border-gray-200'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <ArrowDownCircle className="w-5 h-5 text-red-400" />
                Add New Expense
              </h3>
            </div>
            <form onSubmit={handleAddExpense} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Category</label>
                <select 
                  name="category" 
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  required 
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-red-500' : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'}`}
                >
                  <option value="Operations" className="text-gray-900 bg-white">Operations</option>
                  <option value="Marketing" className="text-gray-900 bg-white">Marketing</option>
                  <option value="Events" className="text-gray-900 bg-white">Events</option>
                  <option value="Technology" className="text-gray-900 bg-white">Technology</option>
                  <option value="Salaries" className="text-gray-900 bg-white">Salaries</option>
                  <option value="Travel" className="text-gray-900 bg-white">Travel</option>
                  <option value="Utilities" className="text-gray-900 bg-white">Utilities</option>
                  <option value="Misc" className="text-gray-900 bg-white">Miscellaneous</option>
                  <option value="Custom" className="text-gray-900 bg-white">Custom Category</option>
                </select>
              </div>
              {expenseCategory === 'Custom' && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Custom Category Name</label>
                  <input 
                    type="text" 
                    name="customCategory" 
                    required 
                    className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-red-500 placeholder:text-white/40' : 'bg-white border-gray-200 text-gray-900 focus:border-red-500 placeholder:text-gray-400'}`} 
                    placeholder="Enter custom category..." 
                  />
                </div>
              )}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Vendor</label>
                <input 
                  type="text" 
                  name="vendor" 
                  value={vendorInput}
                  onChange={(e) => setVendorInput(e.target.value)}
                  required 
                  list="vendor-suggestions"
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-red-500 placeholder:text-white/40' : 'bg-white border-gray-200 text-gray-900 focus:border-red-500 placeholder:text-gray-400'}`} 
                  placeholder="Enter or select vendor..." 
                />
                <datalist id="vendor-suggestions">
                  {vendorSuggestions.map((vendor, index) => (
                    <option key={index} value={vendor} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Description</label>
                <input type="text" name="description" required className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-red-500 placeholder:text-white/40' : 'bg-white border-gray-200 text-gray-900 focus:border-red-500 placeholder:text-gray-400'}`} placeholder="Enter description..." />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Amount</label>
                <input type="number" name="amount" required className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-red-500 placeholder:text-white/40' : 'bg-white border-gray-200 text-gray-900 focus:border-red-500 placeholder:text-gray-400'}`} placeholder="0.00" step="0.01" />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Date</label>
                <input type="date" name="date" required className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-red-500' : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'}`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Payment Mode</label>
                <select 
                  name="paymentMode" 
                  value={expensePaymentMode} 
                  onChange={(e) => setExpensePaymentMode(e.target.value)}
                  required 
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-red-500' : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'}`}
                >
                  <option value="Cash" className="text-gray-900 bg-white">Cash</option>
                  <option value="UPI" className="text-gray-900 bg-white">UPI</option>
                  <option value="Bank Transfer" className="text-gray-900 bg-white">Bank Transfer</option>
                  <option value="NEFT" className="text-gray-900 bg-white">NEFT</option>
                  <option value="Credit Card" className="text-gray-900 bg-white">Credit Card</option>
                  <option value="Cheque" className="text-gray-900 bg-white">Cheque</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Status</label>
                <select name="status" required className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-red-500' : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'}`}>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddExpenseModal(false)} className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                  Cancel
                </button>
                <button type="submit" className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${isDarkMode ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-600 text-white hover:bg-red-700'}`}>
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Balance Entry Modal */}
      {showAddBalanceModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowAddBalanceModal(false)}></div>
          <div className={`relative w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-[#14161A] border-white/10' : 'bg-white border-gray-200'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <BarChart3 className="w-5 h-5 text-violet-400" />
                Add Balance Sheet Entry
              </h3>
            </div>
            <form onSubmit={handleAddBalanceEntry} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Type</label>
                <select name="type" required className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-violet-500' : 'bg-white border-gray-200 text-gray-900 focus:border-violet-500'}`}>
                  <option value="income" className="text-gray-900 bg-white">Income</option>
                  <option value="expense" className="text-gray-900 bg-white">Expense</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Category</label>
                <input type="text" name="category" required className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-violet-500 placeholder:text-white/40' : 'bg-white border-gray-200 text-gray-900 focus:border-violet-500 placeholder:text-gray-400'}`} placeholder="e.g., Membership Fees, Operations..." />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Description</label>
                <input type="text" name="label" required className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-violet-500 placeholder:text-white/40' : 'bg-white border-gray-200 text-gray-900 focus:border-violet-500 placeholder:text-gray-400'}`} placeholder="Enter description..." />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Amount</label>
                <input type="number" name="amount" required className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-violet-500 placeholder:text-white/40' : 'bg-white border-gray-200 text-gray-900 focus:border-violet-500 placeholder:text-gray-400'}`} placeholder="0.00" step="0.01" />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Payment Mode</label>
                <select 
                  name="paymentMode" 
                  value={balancePaymentMode} 
                  onChange={(e) => setBalancePaymentMode(e.target.value)}
                  required 
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-violet-500' : 'bg-white border-gray-200 text-gray-900 focus:border-violet-500'}`}
                >
                  <option value="Cash" className="text-gray-900 bg-white">Cash</option>
                  <option value="UPI" className="text-gray-900 bg-white">UPI</option>
                  <option value="Bank Transfer" className="text-gray-900 bg-white">Bank Transfer</option>
                  <option value="NEFT" className="text-gray-900 bg-white">NEFT</option>
                  <option value="Credit Card" className="text-gray-900 bg-white">Credit Card</option>
                  <option value="Cheque" className="text-gray-900 bg-white">Cheque</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddBalanceModal(false)} className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                  Cancel
                </button>
                <button type="submit" className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${isDarkMode ? 'bg-violet-500 text-white hover:bg-violet-600' : 'bg-violet-600 text-white hover:bg-violet-700'}`}>
                  Add Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => { setShowAddEventModal(false); setEventBannerPreview(null); setEventBannerFile(null); }}></div>
          <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-[#14161A] border-white/10' : 'bg-white border-gray-200'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <Calendar className="w-5 h-5 text-violet-400" />
                Create New Event
              </h3>
            </div>
            <form onSubmit={handleAddEvent} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Event Title</label>
                <input type="text" name="title" required className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-violet-500 placeholder:text-white/40' : 'bg-white border-gray-200 text-gray-900 focus:border-violet-500 placeholder:text-gray-400'}`} placeholder="Enter event title..." />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Description</label>
                <textarea name="description" required rows={3} className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors resize-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-violet-500 placeholder:text-white/40' : 'bg-white border-gray-200 text-gray-900 focus:border-violet-500 placeholder:text-gray-400'}`} placeholder="Enter event description..."></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Date</label>
                  <input type="date" name="date" required className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-violet-500' : 'bg-white border-gray-200 text-gray-900 focus:border-violet-500'}`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Time</label>
                  <input type="time" name="time" required className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-violet-500' : 'bg-white border-gray-200 text-gray-900 focus:border-violet-500'}`} />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Location</label>
                <input type="text" name="location" required className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-violet-500 placeholder:text-white/40' : 'bg-white border-gray-200 text-gray-900 focus:border-violet-500 placeholder:text-gray-400'}`} placeholder="Enter location..." />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Category</label>
                <select name="category" required className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-violet-500' : 'bg-white border-gray-200 text-gray-900 focus:border-violet-500'}`}>
                  <option value="Conference" className="text-gray-900 bg-white">Conference</option>
                  <option value="Workshop" className="text-gray-900 bg-white">Workshop</option>
                  <option value="Seminar" className="text-gray-900 bg-white">Seminar</option>
                  <option value="Networking" className="text-gray-900 bg-white">Networking</option>
                  <option value="Training" className="text-gray-900 bg-white">Training</option>
                  <option value="Meetup" className="text-gray-900 bg-white">Meetup</option>
                  <option value="Other" className="text-gray-900 bg-white">Other</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Event Banner Image</label>
                <input 
                  type="file" 
                  name="bannerImage" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setEventBannerFile(file);
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEventBannerPreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-violet-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-violet-500 file:text-white file:cursor-pointer hover:file:bg-violet-600' : 'bg-white border-gray-200 text-gray-900 focus:border-violet-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-violet-600 file:text-white file:cursor-pointer hover:file:bg-violet-700'}`} 
                />
                {eventBannerPreview && (
                  <div className="mt-3">
                    <img src={eventBannerPreview} alt="Banner preview" className="w-full h-40 object-cover rounded-lg" />
                  </div>
                )}
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Registration Link</label>
                <input type="url" name="registrationLink" required className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-violet-500 placeholder:text-white/40' : 'bg-white border-gray-200 text-gray-900 focus:border-violet-500 placeholder:text-gray-400'}`} placeholder="https://..." />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Max Participants (Optional)</label>
                <input type="number" name="maxParticipants" min="1" className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-violet-500 placeholder:text-white/40' : 'bg-white border-gray-200 text-gray-900 focus:border-violet-500 placeholder:text-gray-400'}`} placeholder="Enter max participants..." />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowAddEventModal(false); setEventBannerPreview(null); setEventBannerFile(null); }} className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                  Cancel
                </button>
                <button type="submit" className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${isDarkMode ? 'bg-violet-500 text-white hover:bg-violet-600' : 'bg-violet-600 text-white hover:bg-violet-700'}`}>
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Announcement Modal */}
      {showAddAnnouncementModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowAddAnnouncementModal(false)}></div>
          <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-[#14161A] border-white/10' : 'bg-white border-gray-200'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <Megaphone className="w-5 h-5 text-orange-400" />
                Create New Announcement
              </h3>
            </div>
            <form onSubmit={handleAddAnnouncement} className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Announcement Title</label>
                <input type="text" name="title" required className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-orange-500 placeholder:text-white/40' : 'bg-white border-gray-200 text-gray-900 focus:border-orange-500 placeholder:text-gray-400'}`} placeholder="Enter announcement title..." />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Message</label>
                <textarea name="message" required rows={4} className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors resize-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-orange-500 placeholder:text-white/40' : 'bg-white border-gray-200 text-gray-900 focus:border-orange-500 placeholder:text-gray-400'}`} placeholder="Enter announcement message..."></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Priority</label>
                  <select name="priority" defaultValue="medium" required className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-orange-500' : 'bg-white border-gray-200 text-gray-900 focus:border-orange-500'}`}>
                    <option value="low" className="text-gray-900 bg-white">Low</option>
                    <option value="medium" className="text-gray-900 bg-white">Medium</option>
                    <option value="high" className="text-gray-900 bg-white">High</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Type</label>
                  <select name="type" defaultValue="general" required className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-orange-500' : 'bg-white border-gray-200 text-gray-900 focus:border-orange-500'}`}>
                    <option value="general" className="text-gray-900 bg-white">General</option>
                    <option value="news" className="text-gray-900 bg-white">News</option>
                    <option value="alert" className="text-gray-900 bg-white">Alert</option>
                    <option value="update" className="text-gray-900 bg-white">Update</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Expiry Date (Optional)</label>
                <input type="date" name="expiryDate" className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-orange-500' : 'bg-white border-gray-200 text-gray-900 focus:border-orange-500'}`} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddAnnouncementModal(false)} className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                  Cancel
                </button>
                <button type="submit" className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${isDarkMode ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-orange-600 text-white hover:bg-orange-700'}`}>
                  Create Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedMember(null)}></div>
          <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in slide-in-from-right duration-300 ${isDarkMode ? 'bg-[#14161A] border-white/10' : 'bg-white border-gray-200'}`}>
            {/* Header */}
            <div className={`p-6 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'} flex items-center justify-between`}>
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Member Details</h3>
                <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>{selectedMember.id}</p>
              </div>
              <button onClick={() => setSelectedMember(null)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                <X className={`w-5 h-5 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`} />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Profile Section */}
              <div className="flex items-center gap-4">
                <div className={`w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-bold ${isDarkMode ? 'bg-gradient-to-br from-violet-500/30 to-purple-500/10 ring-1 ring-white/10 text-white' : 'bg-gray-900 text-white'}`}>
                  {selectedMember.full_name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h4 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedMember.full_name}</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>{selectedMember.email}</p>
                  <span className={`inline-block mt-2 px-2.5 py-1 rounded-lg text-xs font-medium border ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                    <CheckCircle2 className="w-3 h-3 inline mr-1" />
                    Approved
                  </span>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h5 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <User className="w-4 h-4" />
                  Personal Information
                </h5>
                <div className="grid grid-cols-2 gap-3">
                  {selectedMember.gender && (
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Gender</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedMember.gender}</p>
                    </div>
                  )}
                  {selectedMember.age_category && (
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Age Category</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedMember.age_category}</p>
                    </div>
                  )}
                  {selectedMember.blood_group && (
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Blood Group</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedMember.blood_group}</p>
                    </div>
                  )}
                  {selectedMember.vara_whatsapp_group && (
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>WhatsApp Group</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedMember.vara_whatsapp_group ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h5 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Briefcase className="w-4 h-4" />
                  Professional Information
                </h5>
                <div className="space-y-3">
                  {selectedMember.company_name && (
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Company Name</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedMember.company_name}</p>
                    </div>
                  )}
                  {selectedMember.job_title && (
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Job Title</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedMember.job_title}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {selectedMember.visa_status && (
                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                        <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Visa Status</p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedMember.visa_status}</p>
                      </div>
                    )}
                    {selectedMember.primary_area_of_work && (
                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                        <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Primary Area</p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedMember.primary_area_of_work}</p>
                      </div>
                    )}
                    {(selectedMember.years_in_uae !== undefined || selectedMember.months_in_uae !== undefined) && (
                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                        <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>UAE Experience</p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedMember.years_in_uae || 0}y {selectedMember.months_in_uae || 0}m
                        </p>
                      </div>
                    )}
                    {selectedMember.total_industry_experience && (
                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                        <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Industry Experience</p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedMember.total_industry_experience}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills & Portfolio */}
              {((selectedMember.skillsets && selectedMember.skillsets.length > 0) || selectedMember.portfolio_link) && (
                <div>
                  <h5 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Award className="w-4 h-4" />
                    Skills & Portfolio
                  </h5>
                  {selectedMember.skillsets && selectedMember.skillsets.length > 0 && (
                    <div className={`p-3 rounded-lg mb-3 ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                      <p className={`text-xs mb-2 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Skillsets</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.skillsets.map((skill, idx) => (
                          <span key={idx} className={`px-2.5 py-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'bg-violet-100 text-violet-700 border border-violet-200'}`}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedMember.other_skill && (
                    <div className={`p-3 rounded-lg mb-3 ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Other Skills</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedMember.other_skill}</p>
                    </div>
                  )}
                  {selectedMember.portfolio_link && (
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Portfolio</p>
                      <a href={selectedMember.portfolio_link} target="_blank" rel="noopener noreferrer" className={`text-sm font-medium hover:underline flex items-center gap-1 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`}>
                        {selectedMember.portfolio_link}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Social Media & Professional Links */}
              {((selectedMember.linkedin_link || selectedMember.linkedinLink) || 
                (selectedMember.behance_link || selectedMember.behanceLink) || 
                (selectedMember.instagram_link || selectedMember.instagramLink)) && (
                <div>
                  <h5 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <LinkIcon className="w-4 h-4" />
                    Social Media & Professional Links
                  </h5>
                  <div className="space-y-2">
                    {(selectedMember.linkedin_link || selectedMember.linkedinLink) && (
                      <a 
                        href={selectedMember.linkedin_link || selectedMember.linkedinLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`p-3 rounded-lg flex items-center gap-3 hover:scale-105 transition-transform ${isDarkMode ? 'bg-white/[0.02] hover:bg-white/[0.05]' : 'bg-gray-50 hover:bg-gray-100'}`}
                      >
                        <Linkedin className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        <span className={`text-sm font-medium flex-1 truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedMember.linkedin_link || selectedMember.linkedinLink}
                        </span>
                        <ExternalLink className={`w-4 h-4 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`} />
                      </a>
                    )}
                    {(selectedMember.behance_link || selectedMember.behanceLink) && (
                      <a 
                        href={selectedMember.behance_link || selectedMember.behanceLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`p-3 rounded-lg flex items-center gap-3 hover:scale-105 transition-transform ${isDarkMode ? 'bg-white/[0.02] hover:bg-white/[0.05]' : 'bg-gray-50 hover:bg-gray-100'}`}
                      >
                        <LinkIcon className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        <span className={`text-sm font-medium flex-1 truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedMember.behance_link || selectedMember.behanceLink}
                        </span>
                        <ExternalLink className={`w-4 h-4 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`} />
                      </a>
                    )}
                    {(selectedMember.instagram_link || selectedMember.instagramLink) && (
                      <a 
                        href={(selectedMember.instagram_link || selectedMember.instagramLink).startsWith('@') 
                          ? `https://instagram.com/${(selectedMember.instagram_link || selectedMember.instagramLink).slice(1)}`
                          : (selectedMember.instagram_link || selectedMember.instagramLink)
                        }
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`p-3 rounded-lg flex items-center gap-3 hover:scale-105 transition-transform ${isDarkMode ? 'bg-white/[0.02] hover:bg-white/[0.05]' : 'bg-gray-50 hover:bg-gray-100'}`}
                      >
                        <Instagram className={`w-5 h-5 ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`} />
                        <span className={`text-sm font-medium flex-1 truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedMember.instagram_link || selectedMember.instagramLink}
                        </span>
                        <ExternalLink className={`w-4 h-4 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`} />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Software & Tools */}
              {(selectedMember.software_and_tools || selectedMember.softwareAndTools) && (
                <div>
                  <h5 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Briefcase className="w-4 h-4" />
                    Software & Tools
                  </h5>
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                    <div className="flex flex-wrap gap-2">
                      {(selectedMember.software_and_tools || selectedMember.softwareAndTools)
                        .split(',')
                        .filter(tool => tool.trim())
                        .map((tool, idx) => (
                          <span key={idx} className={`px-2.5 py-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-cyan-100 text-cyan-700 border border-cyan-300'}`}>
                            {tool.trim()}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Volunteering */}
              {selectedMember.interested_in_volunteering && selectedMember.volunteering_areas && selectedMember.volunteering_areas.length > 0 && (
                <div>
                  <h5 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Heart className="w-4 h-4" />
                    Volunteering
                  </h5>
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                    <p className={`text-xs mb-2 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Areas of Interest</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.volunteering_areas.map((area, idx) => (
                        <span key={idx} className={`px-2.5 py-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Location Details */}
              <div>
                <h5 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <MapPin className="w-4 h-4" />
                  Location Details
                </h5>
                <div className="grid grid-cols-2 gap-3">
                  {selectedMember.country && (
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Country</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedMember.country}</p>
                    </div>
                  )}
                  {selectedMember.emirate && (
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Emirate</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedMember.emirate}</p>
                    </div>
                  )}
                  {selectedMember.area_name && (
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Area</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedMember.area_name}</p>
                    </div>
                  )}
                  {selectedMember.kerala_district && (
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Kerala District</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedMember.kerala_district}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h5 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Phone className="w-4 h-4" />
                  Contact Information
                </h5>
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className={`w-4 h-4 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`} />
                      <span className={`text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>{selectedMember.email}</span>
                    </div>
                  </div>
                  {selectedMember.contact_number && (
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Phone Number</p>
                      <div className="flex items-center gap-3">
                        <Phone className={`w-4 h-4 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>{selectedMember.country_code} {selectedMember.contact_number}</span>
                      </div>
                    </div>
                  )}
                  {selectedMember.whatsapp_country_code && selectedMember.whatsapp_number && (
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>WhatsApp Number</p>
                      <div className="flex items-center gap-3">
                        <MessageCircle className={`w-4 h-4 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>
                          {selectedMember.whatsapp_country_code} {selectedMember.whatsapp_number}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Membership Information */}
              <div>
                <h5 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <CreditCard className="w-4 h-4" />
                  Membership Information
                </h5>
                <div className="grid grid-cols-2 gap-3">
                  {selectedMember.memberships && selectedMember.memberships.length > 0 && (
                    <>
                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                        <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Type</p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedMember.memberships[0].membership_types?.name || 'N/A'}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                        <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Status</p>
                        <p className={`text-sm font-medium capitalize ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedMember.memberships[0].status || 'N/A'}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                        <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Joined</p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedMember.memberships[0].joined_date ? formatDate(selectedMember.memberships[0].joined_date) : 'N/A'}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                        <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Expires</p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedMember.memberships[0].expiry_date ? formatDate(selectedMember.memberships[0].expiry_date) : 'N/A'}
                        </p>
                      </div>
                    </>
                  )}
                  {selectedMember.assigned_admin && (
                    <div className={`p-3 rounded-lg col-span-2 ${isDarkMode ? 'bg-white/[0.02] border border-violet-500/20' : 'bg-violet-50 border border-violet-200'}`}>
                      <p className={`text-xs mb-1 flex items-center gap-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
                        <Shield className="w-3 h-3" />
                        Assigned Admin
                      </p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-violet-400' : 'text-violet-700'}`}>
                        {selectedMember.assigned_admin.name} ({selectedMember.assigned_admin.email})
                      </p>
                    </div>
                  )}
                  {selectedMember.proceedWithMembershipFee && (
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Membership Fee</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedMember.proceedWithMembershipFee}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Message */}
              {selectedMember.message && (
                <div>
                  <h5 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <MessageCircle className="w-4 h-4" />
                    Additional Message
                  </h5>
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>{selectedMember.message}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className={`p-6 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'} flex gap-3`}>
              <button className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                Edit Member
              </button>
              <button className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${isDarkMode ? 'bg-violet-500 text-white hover:bg-violet-600' : 'bg-violet-600 text-white hover:bg-violet-700'}`}>
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Board Member Modal - Search & Assign */}
      {showAddBoardMemberModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => {
            setShowAddBoardMemberModal(false);
            setAdminSearchEmail('');
            setFoundUser(null);
            setAdminSearchError('');
            setSelectedAdminRole('admin');
          }}></div>
          <div className={`relative w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-[#14161A] border-white/10' : 'bg-white border-gray-200'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <UserPlus className="w-5 h-5 text-blue-400" />
                Assign Admin Role
              </h3>
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Find existing member and assign admin or superadmin role
              </p>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddBoardMember();
            }} className="p-6 space-y-4">
              {/* Search for User by Email */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>
                  Email Address
                </label>
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    value={adminSearchEmail}
                    onChange={(e) => {
                      setAdminSearchEmail(e.target.value);
                      setFoundUser(null);
                      setAdminSearchError('');
                    }}
                    disabled={adminSearching}
                    className={`flex-1 px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-blue-500 placeholder:text-white/40' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 placeholder:text-gray-400'}`} 
                    placeholder="member@vara.ae" 
                  />
                  <button
                    type="button"
                    onClick={handleSearchUserByEmail}
                    disabled={adminSearching || !adminSearchEmail.trim()}
                    className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10 disabled:opacity-50' : 'bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50'}`}
                  >
                    {adminSearching ? '🔍' : 'Search'}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {adminSearchError && (
                <div className={`p-3 rounded-lg text-sm ${isDarkMode ? 'bg-red-500/15 border border-red-500/30 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                  {adminSearchError}
                </div>
              )}

              {/* Found User Display */}
              {foundUser && (
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                  <div className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    ✓ User Found
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <p className="font-semibold">{foundUser.name}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>{foundUser.email}</p>
                  </div>
                </div>
              )}

              {/* Role Selection */}
              {foundUser && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>
                    Assign Role
                  </label>
                  <select 
                    value={selectedAdminRole}
                    onChange={(e) => setSelectedAdminRole(e.target.value as 'admin' | 'superadmin')}
                    className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'}`}
                  >
                    <option value="admin">Admin (View Only)</option>
                    <option value="superadmin">Superadmin (Can Edit & View)</option>
                  </select>
                  
                  {/* Role Description */}
                  <div className={`mt-2 p-3 rounded-lg text-xs ${isDarkMode ? 'bg-white/5 text-white/70' : 'bg-gray-50 text-gray-600'}`}>
                    {selectedAdminRole === 'superadmin' 
                      ? '🔓 Can view and edit all sections' 
                      : '🔍 Can only view data, no editing permissions'
                    }
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddBoardMemberModal(false);
                    setAdminSearchEmail('');
                    setFoundUser(null);
                    setAdminSearchError('');
                    setSelectedAdminRole('admin');
                  }} 
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!foundUser || assigningAdminRole}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${foundUser && !assigningAdminRole ? (isDarkMode ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700') : (isDarkMode ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed')}`}
                >
                  {assigningAdminRole ? '⏳ Assigning...' : 'Assign Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Board Member Modal */}
      {showEditBoardMemberModal && selectedBoardMember && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => {
            setShowEditBoardMemberModal(false);
            setSelectedBoardMember(null);
          }}></div>
          <div className={`relative w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-[#14161A] border-white/10' : 'bg-white border-gray-200'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <Edit className="w-5 h-5 text-blue-400" />
                Edit Board Member
              </h3>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleEditBoardMember(selectedBoardMember.id, {
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                role: formData.get('role') as 'superadmin' | 'admin',
              });
            }} className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={selectedBoardMember.name}
                  required 
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-blue-500 placeholder:text-white/40' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 placeholder:text-gray-400'}`} 
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  defaultValue={selectedBoardMember.email}
                  required 
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-blue-500 placeholder:text-white/40' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 placeholder:text-gray-400'}`} 
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Assign Role</label>
                <select 
                  name="role" 
                  defaultValue={selectedBoardMember.role}
                  required 
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'}`}
                >
                  <option value="superadmin" className="text-gray-900 bg-white">Superadmin (Can Edit & View)</option>
                  <option value="admin" className="text-gray-900 bg-white">Admin (View Only)</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => {
                  setShowEditBoardMemberModal(false);
                  setSelectedBoardMember(null);
                }} className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                  Cancel
                </button>
                <button type="submit" className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${isDarkMode ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowAddRoleModal(false)}></div>
          <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-[#14161A] border-white/10' : 'bg-white border-gray-200'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <Shield className="w-5 h-5 text-blue-400" />
                Create New Role
              </h3>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const selectedPermissions = Array.from(formData.getAll('permissions')) as string[];
              handleAddRole({
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                permissions: selectedPermissions,
                color: formData.get('color') as string,
              });
            }} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Role Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-blue-500 placeholder:text-white/40' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 placeholder:text-gray-400'}`} 
                    placeholder="e.g., Finance Manager" 
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Color Theme</label>
                  <select 
                    name="color" 
                    required 
                    className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'}`}
                  >
                    <option value="blue" className="text-gray-900 bg-white">Blue</option>
                    <option value="emerald" className="text-gray-900 bg-white">Emerald</option>
                    <option value="purple" className="text-gray-900 bg-white">Purple</option>
                    <option value="amber" className="text-gray-900 bg-white">Amber</option>
                    <option value="red" className="text-gray-900 bg-white">Red</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Description</label>
                <textarea 
                  name="description" 
                  required 
                  rows={2}
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors resize-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-blue-500 placeholder:text-white/40' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 placeholder:text-gray-400'}`} 
                  placeholder="Brief description of this role..." 
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Module Permissions</label>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {availablePermissions.map((perm) => {
                    const PermIcon = perm.icon;
                    return (
                      <label key={perm.id} className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                        <input
                          type="checkbox"
                          name="permissions"
                          value={perm.id}
                          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <PermIcon className={`w-4 h-4 ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`} />
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{perm.label}</span>
                          </div>
                          <p className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`}>{perm.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddRoleModal(false)} className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                  Cancel
                </button>
                <button type="submit" className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${isDarkMode ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditRoleModal && selectedRole && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => {
            setShowEditRoleModal(false);
            setSelectedRole(null);
          }}></div>
          <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-[#14161A] border-white/10' : 'bg-white border-gray-200'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <Edit className="w-5 h-5 text-blue-400" />
                Edit Role
              </h3>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const selectedPermissions = Array.from(formData.getAll('permissions')) as string[];
              handleEditRole(selectedRole.id, {
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                permissions: selectedPermissions,
                color: formData.get('color') as string,
              });
            }} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Role Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    defaultValue={selectedRole.name}
                    required 
                    className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-blue-500 placeholder:text-white/40' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 placeholder:text-gray-400'}`} 
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Color Theme</label>
                  <select 
                    name="color" 
                    defaultValue={selectedRole.color}
                    required 
                    className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'}`}
                  >
                    <option value="blue" className="text-gray-900 bg-white">Blue</option>
                    <option value="emerald" className="text-gray-900 bg-white">Emerald</option>
                    <option value="purple" className="text-gray-900 bg-white">Purple</option>
                    <option value="amber" className="text-gray-900 bg-white">Amber</option>
                    <option value="red" className="text-gray-900 bg-white">Red</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Description</label>
                <textarea 
                  name="description" 
                  defaultValue={selectedRole.description}
                  required 
                  rows={2}
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors resize-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-blue-500 placeholder:text-white/40' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 placeholder:text-gray-400'}`} 
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Module Permissions</label>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {availablePermissions.map((perm) => {
                    const PermIcon = perm.icon;
                    return (
                      <label key={perm.id} className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                        <input
                          type="checkbox"
                          name="permissions"
                          value={perm.id}
                          defaultChecked={selectedRole.permissions.includes(perm.id)}
                          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <PermIcon className={`w-4 h-4 ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`} />
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{perm.label}</span>
                          </div>
                          <p className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`}>{perm.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => {
                  setShowEditRoleModal(false);
                  setSelectedRole(null);
                }} className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                  Cancel
                </button>
                <button type="submit" className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${isDarkMode ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Job Modal */}
      {showAddJobModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowAddJobModal(false)} />
          <div className={`relative ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`sticky top-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} px-6 py-4 flex justify-between items-center`}>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Create New Job
              </h3>
              <button
                onClick={() => setShowAddJobModal(false)}
                className={`p-2 rounded-lg hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-600'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddJob} className="p-6 space-y-6">
              {/* Job Title */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Job Title *
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  required
                  placeholder="e.g., Senior Software Engineer"
                  className={`w-full px-4 py-2 border rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* Role */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Role/Department *
                </label>
                <input
                  type="text"
                  name="role"
                  required
                  placeholder="e.g., Software Development"
                  className={`w-full px-4 py-2 border rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* Company Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  placeholder="e.g., Tech Company Ltd"
                  className={`w-full px-4 py-2 border rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Job Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  placeholder="Describe the job responsibilities, requirements, and qualifications..."
                  className={`w-full px-4 py-2 border rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* Location and Employment Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    placeholder="e.g., Dubai, UAE"
                    className={`w-full px-4 py-2 border rounded-lg ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Employment Type *
                  </label>
                  <select
                    name="employmentType"
                    required
                    className={`w-full px-4 py-2 border rounded-lg ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="" className={isDarkMode ? 'bg-gray-700 text-white' : ''}>Select type</option>
                    <option value="Full-time" className={isDarkMode ? 'bg-gray-700 text-white' : ''}>Full-time</option>
                    <option value="Part-time" className={isDarkMode ? 'bg-gray-700 text-white' : ''}>Part-time</option>
                    <option value="Contract" className={isDarkMode ? 'bg-gray-700 text-white' : ''}>Contract</option>
                    <option value="Internship" className={isDarkMode ? 'bg-gray-700 text-white' : ''}>Internship</option>
                  </select>
                </div>
              </div>

              {/* Experience Level and Salary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Experience Level *
                  </label>
                  <select
                    name="experienceLevel"
                    required
                    className={`w-full px-4 py-2 border rounded-lg ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="" className={isDarkMode ? 'bg-gray-700 text-white' : ''}>Select level</option>
                    <option value="Entry Level" className={isDarkMode ? 'bg-gray-700 text-white' : ''}>Entry Level</option>
                    <option value="Mid Level" className={isDarkMode ? 'bg-gray-700 text-white' : ''}>Mid Level</option>
                    <option value="Senior Level" className={isDarkMode ? 'bg-gray-700 text-white' : ''}>Senior Level</option>
                    <option value="Expert Level" className={isDarkMode ? 'bg-gray-700 text-white' : ''}>Expert Level</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Salary Range
                  </label>
                  <input
                    type="text"
                    name="salary"
                    placeholder="e.g., AED 15,000 - 20,000"
                    className={`w-full px-4 py-2 border rounded-lg ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>

              {/* Application Link and Apply By Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Application Link *
                  </label>
                  <input
                    type="url"
                    name="applicationLink"
                    required
                    placeholder="https://careers.example.com/apply"
                    className={`w-full px-4 py-2 border rounded-lg ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Apply By Date *
                  </label>
                  <input
                    type="date"
                    name="applyByDate"
                    required
                    className={`w-full px-4 py-2 border rounded-lg ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddJobModal(false)}
                  className={`px-4 py-2 rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Job Details Modal (View Applicants) */}
      {selectedJob && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSelectedJob(null)} />
          <div className={`relative ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`sticky top-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} px-6 py-4 flex justify-between items-center`}>
              <div>
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedJob.jobTitle}
                </h3>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedJob.role} • {selectedJob.location}
                </p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className={`p-2 rounded-lg hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-600'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Job Details */}
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Job Details
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Employment Type</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedJob.employmentType}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Experience Level</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedJob.experienceLevel}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Salary</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedJob.salary || 'Not disclosed'}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Apply By</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{new Date(selectedJob.applyByDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Posted On</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{new Date(selectedJob.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</p>
                    <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                      selectedJob.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedJob.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Description</p>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{selectedJob.description}</p>
                </div>
                <div className="mt-4">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Application Link</p>
                  <a
                    href={selectedJob.applicationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {selectedJob.applicationLink}
                  </a>
                </div>
              </div>

              {/* Applicants Section */}
              <div>
                <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Applicants ({selectedJob.applicants.length})
                </h4>
                
                {selectedJob.applicants.length > 0 ? (
                  <div className="space-y-3">
                    {selectedJob.applicants.map((applicant) => (
                      <div
                        key={applicant.id}
                        className={`p-4 rounded-lg border ${
                          isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {applicant.memberName}
                              </h5>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                applicant.status === 'hired' ? 'bg-green-100 text-green-800' :
                                applicant.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' :
                                applicant.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                <Mail className="w-4 h-4 inline mr-2" />
                                {applicant.memberEmail}
                              </p>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                <Calendar className="w-4 h-4 inline mr-2" />
                                Applied on: {new Date(applicant.appliedDate).toLocaleDateString()}
                              </p>
                              {applicant.resumeLink && (
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <FileText className="w-4 h-4 inline mr-2" />
                                  <a
                                    href={applicant.resumeLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 hover:underline"
                                  >
                                    View Resume
                                  </a>
                                </p>
                              )}
                            </div>
                            {applicant.coverLetter && (
                              <div className="mt-3">
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Cover Letter:
                                </p>
                                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {applicant.coverLetter}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      No applicants yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowReportModal(false)}></div>
          <div className={`relative w-full max-w-7xl max-h-[90vh] rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-[#14161A] border-white/10' : 'bg-white border-gray-200'}`}>
            {/* Header */}
            <div className={`p-6 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'} flex items-center justify-between`}>
              <div>
                <h3 className={`text-xl font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <FileText className="w-6 h-6 text-violet-400" />
                  {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
                  <span className={`text-sm font-normal ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
                    ({reportPeriod === 'today' ? 'Today' : reportPeriod === 'weekly' ? 'This Week' : reportPeriod === 'monthly' ? 'This Month' : reportPeriod === 'yearly' ? 'This Year' : 'Custom Range'})
                  </span>
                </h3>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
                  Generated on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <button onClick={() => setShowReportModal(false)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                <X className={`w-5 h-5 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`} />
              </button>
            </div>

            {/* Report Content - Scrollable */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {/* Custom Date Range Selection */}
              {reportPeriod === 'custom' && (
                <div className={`p-4 rounded-xl mb-6 ${isDarkMode ? 'bg-white/[0.02] border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                  <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Select Date Range</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>Start Date</label>
                      <input
                        type="date"
                        value={customDateRange.start}
                        onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>End Date</label>
                      <input
                        type="date"
                        value={customDateRange.end}
                        onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs font-medium ${isDarkMode ? 'text-emerald-400/70' : 'text-emerald-600/70'}`}>Total {reportType === 'income' ? 'Income' : reportType === 'expense' ? 'Expenses' : reportType === 'balance' ? 'Net Profit' : 'Records'}</p>
                      <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        {reportType === 'income' ? 'AED 0' : reportType === 'expense' ? 'AED 0' : reportType === 'balance' ? 'AED 0' : reportType === 'membership' ? '0' : reportType === 'approvals' ? '0' : reportType === 'events' ? '0' : '0'}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                      <TrendingUp className={`w-6 h-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    </div>
                  </div>
                </div>
                <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-violet-500/10 border-violet-500/20' : 'bg-violet-50 border-violet-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs font-medium ${isDarkMode ? 'text-violet-400/70' : 'text-violet-600/70'}`}>Average</p>
                      <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-violet-400' : 'text-violet-700'}`}>
                        {reportType === 'income' || reportType === 'expense' || reportType === 'balance' ? 'AED 0' : '0'}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-violet-500/20' : 'bg-violet-100'}`}>
                      <BarChart3 className={`w-6 h-6 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
                    </div>
                  </div>
                </div>
                <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs font-medium ${isDarkMode ? 'text-blue-400/70' : 'text-blue-600/70'}`}>Growth</p>
                      <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>+12.5%</p>
                    </div>
                    <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                      <Activity className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-white/[0.02] border-white/10' : 'bg-white border-gray-200'}`}>
                <div className={`p-4 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'} flex items-center justify-between`}>
                  <h4 className={`text-sm font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Table className="w-4 h-4" />
                    Detailed {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Data
                  </h4>
                  <span className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
                    {reportType === 'income' ? incomeRecords.length : reportType === 'expense' ? expenseRecords.length : reportType === 'membership' ? memberAccounts.length : reportType === 'approvals' ? pendingApplications.length : reportType === 'events' ? events.length : announcements.length} Records
                  </span>
                </div>
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                  <table className="w-full">
                    <thead className={`sticky top-0 z-10 ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                      <tr>
                        {reportType === 'income' && (
                          <>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>ID</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Source</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Category</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Amount</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Date</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Payment Mode</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Status</th>
                          </>
                        )}
                        {reportType === 'expense' && (
                          <>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>ID</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Category</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Vendor</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Amount</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Date</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Payment Mode</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Status</th>
                          </>
                        )}
                        {reportType === 'balance' && (
                          <>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Type</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Category</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Description</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Amount</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Date</th>
                          </>
                        )}
                        {reportType === 'membership' && (
                          <>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>ID</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Name</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Email</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Type</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Status</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Joined Date</th>
                          </>
                        )}
                        {reportType === 'approvals' && (
                          <>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>ID</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Name</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Email</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Job Title</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Status</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Applied Date</th>
                          </>
                        )}
                        {reportType === 'events' && (
                          <>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>ID</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Title</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Date</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Location</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Attendees</th>
                          </>
                        )}
                        {reportType === 'announcements' && (
                          <>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>ID</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Title</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Category</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Posted By</th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Date</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className={`${isDarkMode ? 'divide-y divide-white/5' : 'divide-y divide-gray-200'}`}>
                      {reportType === 'income' && incomeRecords.map((record) => (
                        <tr key={record.id} className={`transition-colors ${isDarkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'}`}>
                          <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>{record.id}</td>
                          <td className={`px-4 py-3 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{record.source}</td>
                          <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>{record.category}</td>
                          <td className={`px-4 py-3 text-sm font-semibold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>AED {record.amount.toLocaleString()}</td>
                          <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>{formatDate(record.date)}</td>
                          <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>{record.paymentMode}</td>
                          <td className={`px-4 py-3`}>
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(record.status)}`}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {reportType === 'expense' && expenseRecords.map((record) => (
                        <tr key={record.id} className={`transition-colors ${isDarkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'}`}>
                          <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>{record.id}</td>
                          <td className={`px-4 py-3 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{record.category}</td>
                          <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>{record.vendor || '-'}</td>
                          <td className={`px-4 py-3 text-sm font-semibold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>${record.amount.toLocaleString()}</td>
                          <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>{formatDate(record.date)}</td>
                          <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>{record.paymentMode}</td>
                          <td className={`px-4 py-3`}>
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(record.status)}`}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {reportType === 'membership' && memberAccounts.map((member) => (
                        <tr key={member.id} className={`transition-colors ${isDarkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'}`}>
                          <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>{member.id}</td>
                          <td className={`px-4 py-3 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{member.full_name}</td>
                          <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>{member.email}</td>
                          <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>{member.memberships?.[0]?.membership_types?.name || 'N/A'}</td>
                          <td className={`px-4 py-3`}>
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(member.memberships?.[0]?.status || 'pending')}`}>
                              {(member.memberships?.[0]?.status || 'pending').charAt(0).toUpperCase() + (member.memberships?.[0]?.status || 'pending').slice(1)}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>{formatDate(member.date_joined || '')}</td>
                        </tr>
                      ))}
                      {reportType === 'approvals' && pendingApplications.map((app) => (
                        <tr key={app.id} className={`transition-colors ${isDarkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'}`}>
                          <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>{app.id}</td>
                          <td className={`px-4 py-3 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{app.fullName}</td>
                          <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>{app.email}</td>
                          <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>{app.jobTitle}</td>
                          <td className={`px-4 py-3`}>
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(app.status)}`}>
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Jan 2026</td>
                        </tr>
                      ))}
                      {reportType === 'events' && events.map((event) => (
                        <tr key={event.id} className={`transition-colors ${isDarkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'}`}>
                          <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>{event.id}</td>
                          <td className={`px-4 py-3 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{event.title}</td>
                          <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>{formatDate(event.date)}</td>
                          <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>{event.location}</td>
                          <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>-</td>
                        </tr>
                      ))}
                      {reportType === 'announcements' && announcements.map((announcement) => (
                        <tr key={announcement.id} className={`transition-colors ${isDarkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'}`}>
                          <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>{announcement.id}</td>
                          <td className={`px-4 py-3 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{announcement.title}</td>
                          <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>{announcement.type}</td>
                          <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Admin</td>
                          <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>{formatDate(announcement.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer Actions - Download Options */}
            {reportType !== 'balance' && reportType !== 'membership' && (
              <div className={`p-6 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'} flex items-center justify-between`}>
                <p className={`text-sm ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
                  Select a format to download this report
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={downloadExcel}
                    className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2 hover:scale-105 ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'}`}
                  >
                    <FileDown className="w-4 h-4" />
                    Excel
                  </button>
                  <button 
                    onClick={downloadCSV}
                    className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2 hover:scale-105 ${isDarkMode ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'}`}
                  >
                    <FileDown className="w-4 h-4" />
                    CSV
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Details Modal */}
      {selectedAdmin && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedAdmin(null)}></div>
          <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-300 my-8 ${isDarkMode ? 'bg-[#14161A] border-white/10' : 'bg-white border-gray-200'}`}>
            {/* Modal header with gradient */}
            <div className={`p-6 border-b relative overflow-hidden ${isDarkMode ? 'border-white/10 bg-gradient-to-br from-purple-500/20 to-pink-500/20' : 'border-gray-200 bg-gradient-to-br from-purple-100 to-pink-100'}`}>
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-20 h-20 rounded-xl flex items-center justify-center text-lg font-bold overflow-hidden ${isDarkMode ? (selectedAdmin.role === 'superadmin' ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-blue-500 to-cyan-500') : (selectedAdmin.role === 'superadmin' ? 'bg-gradient-to-br from-purple-600 to-pink-600' : 'bg-gradient-to-br from-blue-600 to-cyan-600')} text-white shadow-lg`}>
                    <Shield className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedAdmin.name}</h3>
                    <p className={`text-base mt-1 ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>{selectedAdmin.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${isDarkMode ? 'bg-purple-500/20 border-purple-500/30 text-purple-300' : 'bg-purple-100 border-purple-300 text-purple-700'}`}>
                        <Shield className="w-3 h-3 inline mr-1" />
                        {selectedAdmin.role === 'superadmin' ? 'Superadmin' : 'Admin'}
                      </span>
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${selectedAdmin.status === 'active' ? (isDarkMode ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-emerald-100 border-emerald-300 text-emerald-700') : (isDarkMode ? 'bg-red-500/20 border-red-500/30 text-red-300' : 'bg-red-100 border-red-300 text-red-700')}`}>
                        {selectedAdmin.status === 'active' ? '✓ Active' : '○ Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedAdmin(null)}
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`} />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className={`p-8 ${isDarkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
              {/* Admin Information */}
              <div className="mb-8">
                <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Administrator Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { icon: User, label: 'Name', value: selectedAdmin.name, iconBg: 'bg-blue-500/15', iconColor: 'text-blue-400' },
                    { icon: Mail, label: 'Email', value: selectedAdmin.email, iconBg: 'bg-cyan-500/15', iconColor: 'text-cyan-400' },
                    { icon: Shield, label: 'Role', value: selectedAdmin.role === 'superadmin' ? 'Superadmin' : 'Admin', iconBg: 'bg-purple-500/15', iconColor: 'text-purple-400' },
                    { icon: Clock, label: 'Assigned Date', value: selectedAdmin.assignedDate, iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400' },
                  ].map((item, index) => (
                    <div 
                      key={index}
                      className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${isDarkMode ? 'border-white/[0.06] bg-white/[0.01]' : 'border-gray-200 bg-white'}`}
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${isDarkMode ? item.iconBg : 'bg-gray-100'}`}>
                        <item.icon className={`w-6 h-6 ${isDarkMode ? item.iconColor : 'text-gray-600'}`} />
                      </div>
                      <div>
                        <p className={`text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-white/35' : 'text-gray-500'}`}>{item.label}</p>
                        <p className={`text-sm font-semibold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Permissions */}
              <div className="mb-8">
                <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Permissions</h4>
                <div className={`p-6 rounded-xl border ${isDarkMode ? 'border-white/[0.06] bg-white/[0.02]' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="space-y-3">
                    {selectedAdmin.role === 'superadmin' ? (
                      <>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-emerald-100 border border-emerald-300'}`}>
                            <Check className={`w-3 h-3 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                          </div>
                          <span className={`text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Full edit access to all system settings</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-emerald-100 border border-emerald-300'}`}>
                            <Check className={`w-3 h-3 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                          </div>
                          <span className={`text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Can view all member records and applications</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-emerald-100 border border-emerald-300'}`}>
                            <Check className={`w-3 h-3 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                          </div>
                          <span className={`text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Can manage administrators and roles</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-emerald-100 border border-emerald-300'}`}>
                            <Check className={`w-3 h-3 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                          </div>
                          <span className={`text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Can create and manage events and announcements</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-emerald-100 border border-emerald-300'}`}>
                            <Check className={`w-3 h-3 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                          </div>
                          <span className={`text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>View all member records and applications</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-emerald-100 border border-emerald-300'}`}>
                            <Check className={`w-3 h-3 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                          </div>
                          <span className={`text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>View events and announcements</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-red-500/20 border border-red-500/30' : 'bg-red-100 border border-red-300'}`}>
                            <X className={`w-3 h-3 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                          </div>
                          <span className={`text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Cannot edit or create settings</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-red-500/20 border border-red-500/30' : 'bg-red-100 border border-red-300'}`}>
                            <X className={`w-3 h-3 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                          </div>
                          <span className={`text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>Cannot manage administrators</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Status</h4>
                <div className={`p-6 rounded-xl border ${selectedAdmin.status === 'active' ? (isDarkMode ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-emerald-200 bg-emerald-50') : (isDarkMode ? 'border-red-500/20 bg-red-500/10' : 'border-red-200 bg-red-50')}`}>
                  <div className="flex items-center gap-3">
                    {selectedAdmin.status === 'active' ? (
                      <>
                        <CheckCircle2 className={`w-6 h-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <div>
                          <p className={`font-semibold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>Active Administrator</p>
                          <p className={`text-sm ${isDarkMode ? 'text-emerald-300/70' : 'text-emerald-600'}`}>This administrator account is active and has access to the system</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className={`w-6 h-6 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                        <div>
                          <p className={`font-semibold ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>Inactive Administrator</p>
                          <p className={`text-sm ${isDarkMode ? 'text-red-300/70' : 'text-red-600'}`}>This administrator account is currently inactive and cannot access the system</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className={`p-6 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'} flex items-center justify-end gap-3`}>
              <button 
                onClick={() => setSelectedAdmin(null)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 right-8 p-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-110 z-40 ${isDarkMode ? 'bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-white/20' : 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50'}`}
      >
        <ChevronUp className="w-5 h-5" />
      </button>
      </div>
    </div>
  );
}
