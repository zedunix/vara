import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (!newPassword.trim()) {
      toast.error('Please enter a new password');
      return false;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/reset-password-direct', { 
        email, 
        newPassword 
      });
      
      if (response.data.success) {
        setIsSuccess(true);
        toast.success('Password updated successfully!');
      } else {
        toast.error(response.data.message || 'Failed to update password');
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Dark Background */}
        <div className="hidden md:flex md:w-full lg:w-1/2 relative overflow-hidden md:min-h-[300px] lg:min-h-screen" style={{ backgroundColor: '#DCDC00' }}>
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src="/Images/banner.jpg" 
              alt="Background" 
              className="w-full h-full object-cover"
            />
           
          </div>

          
        </div>

        {/* Right Side - Success Message */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-16 py-8 sm:py-12 min-h-screen lg:min-h-0" style={{ backgroundColor: '#DCDC00' }}>
          <div className="w-full max-w-sm sm:max-w-md md:max-w-lg flex flex-col items-center">
            {/* Logo */}
            <div className="logo-container flex flex-col items-center mb-3 sm:mb-4 md:mb-6">
              <img src="/Images/vara-logo.png" alt="VARA Logo" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-2 object-contain" />
            </div>

            {/* Success Card */}
            <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-5 md:p-6 lg:p-8 w-full">
              <div className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Check className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-3 sm:mb-4">
                  Password Updated!
                </h2>
                
                <p className="text-gray-600 mb-6 sm:mb-8 text-xs sm:text-sm leading-relaxed px-2">
                  Your password has been updated successfully. You can now sign in with your new password.
                </p>
                
                <button
                  onClick={() => navigate('/login')}
                  className="w-full h-10 sm:h-11 md:h-12 rounded-lg bg-black text-xs sm:text-sm font-semibold text-white transition-all duration-200 hover:bg-gray-800"
                >
                  GO TO SIGN IN
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Dark Background */}
      <div className="hidden md:flex md:w-full lg:w-1/2 relative overflow-hidden md:min-h-[300px] lg:min-h-screen" style={{ backgroundColor: '#DCDC00' }}>
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/Images/banner.jpg" 
            alt="Background" 
            className="w-full h-full"
          />
          
        </div>

        
      </div>

      {/* Right Side - Reset Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-16 py-8 sm:py-12 min-h-screen lg:min-h-0" style={{ backgroundColor: '#DCDC00' }}>
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg flex flex-col items-center">
          {/* Logo */}
          <div className="logo-container flex flex-col items-center mb-3 sm:mb-4 md:mb-6">
            <img src="/Images/vara-logo.png" alt="VARA Logo" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-2 object-contain" />
          </div>

          {/* Reset Password Form Card */}
          <div className="login-card bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl border border-gray-200 overflow-hidden w-full">
            {/* Title */}
            <div className="mb-3 sm:mb-4 md:mb-6 pt-4 sm:pt-5 md:pt-6 text-center px-4 sm:px-5 md:px-6">
              <h2 className="login-title text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">VARA</h2>
              <p className="login-description mt-1 text-xs sm:text-sm text-gray-500">Reset your password</p>
            </div>

            {/* Form Container */}
            <div className="w-full px-4 sm:px-5 md:px-6 lg:px-8">
              <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3 md:space-y-4">
                {/* Email Field */}
                <div className="form-group space-y-1 sm:space-y-1.5">
                  <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="h-10 sm:h-11 md:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    disabled={isLoading}
                    required
                  />
                </div>

                {/* New Password Field */}
                <div className="form-group space-y-1 sm:space-y-1.5">
                  <label htmlFor="newPassword" className="block text-xs sm:text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="password-input-container relative">
                    <input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="h-10 sm:h-11 md:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 pr-10 sm:pr-12 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                      disabled={isLoading}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="password-toggle absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
                </div>

                {/* Confirm Password Field */}
                <div className="form-group space-y-1 sm:space-y-1.5">
                  <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="password-input-container relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="h-10 sm:h-11 md:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 pr-10 sm:pr-12 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="password-toggle absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password match indicator */}
                {newPassword && confirmPassword && (
                  <div className={`flex items-center gap-2 text-xs ${
                    newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {newPassword === confirmPassword ? (
                      <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                    {newPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                  </div>
                )}

                {/* Update Password Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 sm:mt-3 md:mt-4 h-10 sm:h-11 md:h-12 w-full rounded-lg bg-black text-xs sm:text-sm font-semibold text-white transition-all duration-200 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'UPDATING PASSWORD...' : 'UPDATE PASSWORD'}
                </button>
              </form>
            </div>

            {/* Back to Sign In Link */}
            <div className="mt-3 sm:mt-4 md:mt-6 pb-4 sm:pb-5 md:pb-6 text-center text-xs sm:text-sm text-gray-600 px-4 sm:px-5 md:px-6">
              Remember your password?{' '}
              <Link to="/login" className="font-semibold text-black hover:underline transition-all">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}