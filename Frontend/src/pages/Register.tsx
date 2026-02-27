import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, ChevronRight, ChevronLeft, Check, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import api from '@/utils/api';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface FormData {
  // Step 1
  fullName: string;
  gender: string;
  ageCategory: string;
  bloodGroup: string;
  profilePhoto: File | null;
  varaWhatsappGroup: string;
  assignedAdminId: string;
  
  // Step 2
  companyName: string;
  jobTitle: string;
  visaStatus: string;
  yearsInUAE: string;
  monthsInUAE: string;
  totalIndustryExperience: string;
  primaryAreaOfWork: string;
  
  // Step 3
  skillsets: string[];
  otherSkill: string;
  portfolioLink: string;
  linkedinLink: string;
  behanceLink: string;
  instagramLink: string;
  softwareAndTools: string;
  
  // Step 4
  interestedInVolunteering: string;
  volunteeringAreas: string[];
  
  // Step 5
  country: string;
  emirate: string;
  areaName: string;
  countryCode: string;
  contactNumber: string;
  whatsappCountryCode: string;
  whatsappNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  keralaDistrict: string;
  proceedWithMembershipFee: string;
  message: string;
}

export default function Register() {
  const { isLoading } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  
  const [formData, setFormData] = useState<FormData>({
    // Step 1
    fullName: '',
    gender: '',
    ageCategory: '',
    bloodGroup: '',
    profilePhoto: null,
    varaWhatsappGroup: '',
    assignedAdminId: '',
    
    // Step 2
    companyName: '',
    jobTitle: '',
    visaStatus: '',
    yearsInUAE: '',
    monthsInUAE: '',
    totalIndustryExperience: '',
    primaryAreaOfWork: '',
    
    // Step 3
    skillsets: [],
    otherSkill: '',
    portfolioLink: '',
    linkedinLink: '',
    behanceLink: '',
    instagramLink: '',
    softwareAndTools: '',
    
    // Step 4
    interestedInVolunteering: '',
    volunteeringAreas: [],
    
    // Step 5
    country: 'UAE',
    emirate: '',
    areaName: '',
    countryCode: '+971',
    contactNumber: '',
    whatsappCountryCode: '+971',
    whatsappNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    keralaDistrict: '',
    proceedWithMembershipFee: '',
    message: '',
  });

  // Fetch admins on mount
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoadingAdmins(true);
        const response = await api.get('/public/admins');
        if (response.data.success) {
          setAdmins(response.data.data || []);
          console.log('✅ Admins loaded:', response.data.data.length);
        }
      } catch (error: any) {
        console.error('❌ Failed to fetch admins:', error);
        toast.error('Failed to load admins');
      } finally {
        setLoadingAdmins(false);
      }
    };
    fetchAdmins();
  }, []);

  const skillsetOptions = [
    'Graphic Design',
    'Web Development',
    'App Development',
    'UI/UX Design',
    'Social Media Marketing',
    'Search Engine Marketing',
    'Motion Graphics',
    '3D Visualization',
    'Photography',
    'Videography',
    'Events Coordination',
    'Content Creation',
  ];

  const volunteeringOptions = [
    'Event Management',
    'Creative Support',
    'Workshops',
    'Sponsorship',
    'Media & PR',
    'Community Support',
    'Technical Support',
    'Women Empowerment Wing',
    'Student Mentorship',
  ];

  const keralaDistricts = [
    'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 
    'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 
    'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size <= 5 * 1024 * 1024) {
        setFormData(prev => ({ ...prev, profilePhoto: file }));
      } else {
        toast.error('File size must be less than 5MB');
      }
    }
  };

  const handleSkillsetChange = (skill: string) => {
    setFormData(prev => {
      const isSelected = prev.skillsets.includes(skill);
      return {
        ...prev,
        skillsets: isSelected
          ? prev.skillsets.filter(s => s !== skill)
          : [...prev.skillsets, skill]
      };
    });
  };

  const handleVolunteeringChange = (area: string) => {
    setFormData(prev => {
      const isSelected = prev.volunteeringAreas.includes(area);
      return {
        ...prev,
        volunteeringAreas: isSelected
          ? prev.volunteeringAreas.filter(a => a !== area)
          : [...prev.volunteeringAreas, area]
      };
    });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.fullName.trim()) {
          toast.error('Please enter your full name');
          return false;
        }
        if (!formData.gender) {
          toast.error('Please select your gender');
          return false;
        }
        if (!formData.ageCategory) {
          toast.error('Please select your age category');
          return false;
        }
        if (!formData.bloodGroup) {
          toast.error('Please select your blood group');
          return false;
        }
        if (!formData.varaWhatsappGroup) {
          toast.error('Please specify if you are part of VARA WhatsApp group');
          return false;
        }
        if (!formData.assignedAdminId) {
          toast.error('Please select an admin');
          return false;
        }
        return true;

      case 2:
        if (!formData.companyName.trim()) {
          toast.error('Please enter your company name');
          return false;
        }
        if (!formData.jobTitle.trim()) {
          toast.error('Please enter your job title');
          return false;
        }
        if (!formData.visaStatus) {
          toast.error('Please select your visa status');
          return false;
        }
        if (!formData.yearsInUAE) {
          toast.error('Please enter years in UAE');
          return false;
        }
        if (!formData.monthsInUAE) {
          toast.error('Please select months in UAE');
          return false;
        }
        if (!formData.totalIndustryExperience) {
          toast.error('Please enter your total industry experience');
          return false;
        }
        if (!formData.primaryAreaOfWork.trim()) {
          toast.error('Please enter your primary area of work');
          return false;
        }
        return true;

      case 3:
        if (formData.skillsets.length === 0) {
          toast.error('Please select at least one skillset');
          return false;
        }
        if (!formData.portfolioLink.trim()) {
          toast.error('Please provide your portfolio link');
          return false;
        }
        const urlPattern = /^https?:\/\/.+/i;
        if (!urlPattern.test(formData.portfolioLink.trim())) {
          toast.error('Please enter a valid portfolio URL (must start with http:// or https://)');
          return false;
        }
        return true;

      case 4:
        if (!formData.interestedInVolunteering) {
          toast.error('Please specify if you are interested in volunteering');
          return false;
        }
        if (formData.interestedInVolunteering === 'Yes' && formData.volunteeringAreas.length === 0) {
          toast.error('Please select at least one volunteering area');
          return false;
        }
        return true;

      case 5:
        if (!formData.emirate) {
          toast.error('Please select your emirate');
          return false;
        }
        if (!formData.areaName.trim()) {
          toast.error('Please enter your area name');
          return false;
        }
        if (!formData.contactNumber.trim()) {
          toast.error('Please enter your contact number');
          return false;
        }
        if (!formData.whatsappNumber.trim()) {
          toast.error('Please enter your WhatsApp number');
          return false;
        }
        if (!formData.email.trim() || !formData.email.includes('@')) {
          toast.error('Please enter a valid email address');
          return false;
        }
        if (!formData.password || formData.password.length < 6) {
          toast.error('Password must be at least 6 characters');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          return false;
        }
        if (!formData.keralaDistrict) {
          toast.error('Please select your Kerala district');
          return false;
        }
        if (!formData.proceedWithMembershipFee) {
          toast.error('Please specify if you want to proceed with membership fee');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('\n🚀 === SUBMIT BUTTON CLICKED ===');
    
    if (!validateStep(5)) {
      console.log('❌ Form validation failed at step 5');
      return;
    }

    console.log('✅ Form validation passed');
    setIsSubmitting(true);

    try {
      // Prepare form data for submission
      const submissionData = new FormData();
      
      console.log('\n📝 === FORM DATA BEFORE SUBMISSION ===');
      console.log('Full form object:', formData);

      // Don't include confirmPassword in submission
      let fieldCount = 0;
      const fieldsToSubmit: {[key: string]: any} = {};

      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'confirmPassword') return; // Skip confirmPassword
        if (key === 'profilePhoto' && value) {
          submissionData.append(key, value as File);
          fieldsToSubmit[key] = '[File object]';
          fieldCount++;
        } else if (Array.isArray(value)) {
          const jsonStr = JSON.stringify(value);
          submissionData.append(key, jsonStr);
          fieldsToSubmit[key] = value;
          console.log(`  ✓ ${key}: ${jsonStr}`);
          fieldCount++;
        } else {
          // Include all fields, even empty ones
          submissionData.append(key, String(value || ''));
          fieldsToSubmit[key] = value;
          if (value) {
            console.log(`  ✓ ${key}: ${value}`);
          }
          fieldCount++;
        }
      });

      console.log(`\n📤 Total fields to submit: ${fieldCount}`);
      console.log('Fields object:', fieldsToSubmit);

      // Call backend API
      console.log('\n🌐 Making API call to /auth/register');
      const response = await api.post('/auth/register', submissionData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('📥 API Response received:');
      console.log('  Status:', response.status);
      console.log('  Data:', response.data);

      if (response.data.success) {
        setIsSuccess(true);
        toast.success('Registration submitted successfully!');
        console.log('✅ Registration successful!');
      } else {
        console.error('❌ API returned success=false:', response.data);
        toast.error(response.data.message || 'Registration failed');
      }
      
    } catch (error: any) {
      console.error('\n❌ === REGISTRATION ERROR ===');
      console.error('Status:', error.response?.status);
      console.error('Message:', error.response?.data?.message);
      console.error('Full response:', error.response?.data);
      console.error('Error:', error.message);
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  // Success Screen
  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Dark Background */}
        <div className="hidden md:flex md:w-full lg:w-1/2 relative overflow-hidden md:min-h-[300px] lg:min-h-screen" style={{ backgroundColor: '#DCDC00' }}>
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src="/Images/image.png" 
              alt="Background" 
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 sm:px-10 md:px-12 lg:px-20 lg:translate-x-20 text-center text-white py-8 md:py-12">
            <p className="text-xs sm:text-sm font-light tracking-[0.2em] sm:tracking-[0.3em] mb-4 sm:mb-8 uppercase">UAE DESIGNERS</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              CREATIVE<br />EXCELLENCE
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-md leading-relaxed px-4">
              Where Creativity Meets Community
            </p>
            <p className="text-xs sm:text-sm text-gray-400 mt-3 sm:mt-4 max-w-lg leading-relaxed px-4">
              Join the premier association for UAE's creative professionals. Connect, collaborate, and grow with fellow designers, developers, and creative minds.
            </p>
          </div>
        </div>

        {/* Right Side - Success Message */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 md:px-8 py-8 sm:py-12 min-h-screen lg:min-h-0" style={{ backgroundColor: '#DCDC00' }}>
          <div className="w-full max-w-sm sm:max-w-md md:max-w-lg flex flex-col items-center">
            {/* Logo */}
            <div className="logo-container flex flex-col items-center mb-3 sm:mb-4 md:mb-6">
              <img src="/Images/image logo.png" alt="VARA Logo" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-2 object-contain" />
            </div>

            {/* Success Card */}
            <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-5 md:p-6 lg:p-8 w-full">
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Check className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-3 sm:mb-4">
                  Registration Completed!
                </h2>
                
                <p className="text-gray-700 mb-2 text-sm sm:text-base leading-relaxed px-2">
                  Your registration has been submitted successfully.
                </p>
                <p className="text-gray-500 text-xs sm:text-sm mb-6 sm:mb-8 leading-relaxed px-2">
                  You will get access soon once the membership is approved by VARA. Stay tuned!
                </p>
                
                <Link
                  to="/login"
                  className="inline-block px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto bg-black text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-800 transition-all"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Background Image */}
      <div className="hidden md:flex md:w-full lg:w-1/2 relative overflow-hidden md:min-h-[300px] lg:min-h-screen" style={{ backgroundColor: '#DCDC00' }}>
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/Images/banner.jpg" 
            alt="Background" 
            className="object-cover opacity-100"
          />
          
        </div>

        
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12 overflow-y-auto min-h-screen lg:min-h-0" style={{ backgroundColor: '#DCDC00' }}>
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl my-3 sm:my-6">
          {/* Logo */}
          <div className="flex flex-col items-center mb-3 sm:mb-4 md:mb-6">
            <img src="/Images/vara-logo.png" alt="VARA Logo" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-2 object-contain" />
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">VARA</h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">Create your account</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-3 sm:mb-4 md:mb-6 px-1 sm:px-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-700">Step {currentStep} of {totalSteps}</span>
              <span className="text-xs sm:text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
              <div 
                className="bg-black h-1.5 sm:h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 md:p-8 max-h-[500px] sm:max-h-[600px] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              
              {/* STEP 1: Personal Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Personal Details</h3>
                  
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="h-11 sm:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="h-11 sm:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 text-sm text-black outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Age Category */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Age Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="ageCategory"
                      value={formData.ageCategory}
                      onChange={handleInputChange}
                      className="h-11 sm:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 text-sm text-black outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    >
                      <option value="">Select Age Category</option>
                      <option value="18-24">18-24</option>
                      <option value="25-31">25-31</option>
                      <option value="32-38">32-38</option>
                      <option value="39-45">39-45</option>
                      <option value="46-52">46-52</option>
                      <option value="53-59">53-59</option>
                      <option value="60+">60+</option>
                    </select>
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Blood Group <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      className="h-11 sm:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 text-sm text-black outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  

                  {/* VARA WhatsApp Group */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Are you a part of VARA WhatsApp group? <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="varaWhatsappGroup"
                      value={formData.varaWhatsappGroup}
                      onChange={handleInputChange}
                      className="h-11 sm:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 text-sm text-black outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  {/* Admin Assignment */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Select Admin <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="assignedAdminId"
                      value={formData.assignedAdminId}
                      onChange={handleInputChange}
                      className="h-11 sm:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 text-sm text-black outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                      disabled={loadingAdmins}
                    >
                      <option value="">Select Admin</option>
                      {admins.map(admin => (
                        <option key={admin.id} value={admin.id}>
                          {admin.name} ({admin.role === 'superadmin' ? 'Super Admin' : 'Admin'})
                        </option>
                      ))}
                    </select>
                    {loadingAdmins && (
                      <p className="text-xs text-gray-500 mt-1">Loading admins...</p>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: Professional Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Professional Details</h3>
                  
                  {/* Company Name */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Enter your company name"
                      className="h-11 sm:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    />
                  </div>

                  {/* Job Title */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Job Title / Designation <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      placeholder="Enter your job title"
                      className="h-11 sm:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    />
                  </div>

                  {/* Visa Status */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Visa Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="visaStatus"
                      value={formData.visaStatus}
                      onChange={handleInputChange}
                      className="h-11 sm:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 text-sm text-black outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    >
                      <option value="">Select Visa Status</option>
                      <option value="Student Visa">Student Visa</option>
                      <option value="Employment Visa">Employment Visa</option>
                      <option value="Investor Visa">Investor Visa</option>
                      <option value="Golden Visa">Golden Visa</option>
                      <option value="Dependent Visa">Dependent Visa</option>
                      <option value="Visit Visa">Visit Visa</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Years and Months in UAE */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Years in UAE <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="yearsInUAE"
                        value={formData.yearsInUAE}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        placeholder="0"
                        className="h-11 sm:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Months <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="monthsInUAE"
                        value={formData.monthsInUAE}
                        onChange={handleInputChange}
                        className="h-11 sm:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 text-sm text-black outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                      >
                        <option value="">Select</option>
                        {[...Array(12)].map((_, i) => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Total Industry Experience */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Total Industry Experience (Years) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="totalIndustryExperience"
                      value={formData.totalIndustryExperience}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      placeholder="0"
                      className="h-11 sm:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    />
                  </div>

                  {/* Primary Area of Work */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Primary Area of Work <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="primaryAreaOfWork"
                      value={formData.primaryAreaOfWork}
                      onChange={handleInputChange}
                      placeholder="e.g., Design, Marketing, Development"
                      className="h-11 sm:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Skills & Portfolio */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Choose Your Skill Set</h3>
                  
                  {/* Skillsets */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Your Skills <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {skillsetOptions.map((skill) => (
                        <label
                          key={skill}
                          className="flex items-center p-2.5 sm:p-3 rounded-lg border border-gray-300 cursor-pointer hover:border-black hover:bg-gray-50 transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={formData.skillsets.includes(skill)}
                            onChange={() => handleSkillsetChange(skill)}
                            className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                          />
                          <span className="ml-2 text-sm text-gray-700">{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Other Skills */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Other Skills
                    </label>
                    <input
                      type="text"
                      name="otherSkill"
                      value={formData.otherSkill}
                      onChange={handleInputChange}
                      placeholder="Enter other skills (separate by commas)"
                      className="h-11 sm:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    />
                  </div>

                  {/* Portfolio Link */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Portfolio Link<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="url"
                      name="portfolioLink"
                      value={formData.portfolioLink}
                      onChange={handleInputChange}
                      placeholder="https://behance.net/yourportfolio or Google Drive link"
                      className="h-11 sm:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Required: Behance, Google Drive, Website, etc. Must start with http:// or https://</p>
                  </div>

                  {/* LinkedIn Link */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      LinkedIn Profile
                    </label>
                    <input
                      type="url"
                      name="linkedinLink"
                      value={formData.linkedinLink}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="h-11 sm:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    />
                  </div>

                  {/* Behance Link */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Behance Profile
                    </label>
                    <input
                      type="url"
                      name="behanceLink"
                      value={formData.behanceLink}
                      onChange={handleInputChange}
                      placeholder="https://behance.net/yourprofile"
                      className="h-11 sm:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    />
                  </div>

                  {/* Instagram Link */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Instagram Handle
                    </label>
                    <input
                      type="text"
                      name="instagramLink"
                      value={formData.instagramLink}
                      onChange={handleInputChange}
                      placeholder="@yourinstagram or https://instagram.com/yourprofile"
                      className="h-11 sm:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    />
                  </div>

                  {/* Software & Tools */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Software & Tools You Know
                    </label>
                    <textarea
                      name="softwareAndTools"
                      value={formData.softwareAndTools}
                      onChange={handleInputChange}
                      placeholder="e.g., Figma, Adobe XD, Photoshop, After Effects, VS Code, Sketch, etc. (separate by commas)"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10 resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: Volunteering */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Volunteering Interest</h3>
                  
                  {/* Interested in Volunteering */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Are you interested in Volunteering for VARA events? <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="interestedInVolunteering"
                      value={formData.interestedInVolunteering}
                      onChange={handleInputChange}
                      className="h-11 sm:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 text-sm text-black outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  {/* Volunteering Areas */}
                  {formData.interestedInVolunteering === 'Yes' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Volunteering Areas <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 gap-3">
                        {volunteeringOptions.map((area) => (
                          <label
                            key={area}
                            className="flex items-center p-2.5 sm:p-3 rounded-lg border border-gray-300 cursor-pointer hover:border-black hover:bg-gray-50 transition-all"
                          >
                            <input
                              type="checkbox"
                              checked={formData.volunteeringAreas.includes(area)}
                              onChange={() => handleVolunteeringChange(area)}
                              className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                            />
                            <span className="ml-2 text-sm text-gray-700">{area}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: Contact & Location */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Contact & Location</h3>
                  
                  {/* Country */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Country of Residence <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="h-11 sm:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 text-sm text-black outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    >
                      <option value="UAE">UAE</option>
                    </select>
                  </div>

                  {/* Emirate */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Emirate You Reside In <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="emirate"
                      value={formData.emirate}
                      onChange={handleInputChange}
                      className="h-11 sm:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 text-sm text-black outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    >
                      <option value="">Select Emirate</option>
                      <option value="Abu Dhabi">Abu Dhabi</option>
                      <option value="Dubai">Dubai</option>
                      <option value="Sharjah">Sharjah</option>
                      <option value="Ajman">Ajman</option>
                      <option value="Umm Al Quwain">Umm Al Quwain</option>
                      <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                      <option value="Fujairah">Fujairah</option>
                    </select>
                  </div>

                  {/* Area Name */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Area Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="areaName"
                      value={formData.areaName}
                      onChange={handleInputChange}
                      placeholder="Enter area name"
                      className="h-11 sm:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    />
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      placeholder="50 123 4567"
                      className="h-11 sm:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    />
                  </div>

                  {/* WhatsApp Number */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      WhatsApp Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={handleInputChange}
                      placeholder="50 123 4567"
                      className="h-11 sm:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      className="h-11 sm:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Create Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter password (min 6 characters)"
                        className="h-11 sm:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 pr-10 sm:pr-12 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm your password"
                        className="h-11 sm:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 pr-10 sm:pr-12 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Kerala District */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Which District in Kerala? <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="keralaDistrict"
                      value={formData.keralaDistrict}
                      onChange={handleInputChange}
                      className="h-11 sm:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 text-sm text-black outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    >
                      <option value="">Select District</option>
                      {keralaDistricts.map((district) => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>

                  {/* Proceed with Membership Fee */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Proceed with Membership Fee? <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="proceedWithMembershipFee"
                      value={formData.proceedWithMembershipFee}
                      onChange={handleInputChange}
                      className="h-11 sm:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 text-sm text-black outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Enter any additional message..."
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10 resize-none"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                )}

                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm rounded-lg bg-black text-sm font-semibold text-white hover:bg-gray-800 transition-all ml-auto"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm rounded-lg bg-black text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all ml-auto"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Sign In Link */}
          <div className="mt-3 sm:mt-4 md:mt-6 text-center text-xs sm:text-sm text-gray-600 px-3 sm:px-4">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-black hover:underline transition-all">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}



