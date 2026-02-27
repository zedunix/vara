import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState<boolean>(
    () => localStorage.getItem('vara_remember_me') === 'true'
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const redirectUrl = await login(data, rememberMe);
      toast.success('Welcome back!');
      navigate(redirectUrl || '/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Dark Background */}
      <div className="hidden md:flex md:w-full lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden md:min-h-[300px] lg:min-h-screen">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/Images/banner.jpg" 
            alt="Background" 
            className="w-full h-full"
          />
          
        </div>

        
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-16 py-8 sm:py-12 min-h-screen lg:min-h-0" style={{ backgroundColor: '#DCDC00' }}>
      
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg flex flex-col items-center"> 
          {/* Logo */}
          <div className="logo-container flex flex-col items-center mb-3 sm:mb-4 md:mb-6">
            <img src="/Images/vara-logo.png" alt="VARA Logo" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-2 object-contain" />
          </div>
          {/* Login Form Card */}
          <div className="login-card bg-white rounded-xl sm:rounded-2xl md:rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 md:p-8 max-h-[500px] sm:max-h-[600px] overflow-y-auto">
            {/* Title */}
            <div className="mb-3 sm:mb-4 md:mb-6 pt-4 sm:pt-5 md:pt-6 text-center px-4 sm:px-5 md:px-6">
              <h2 className="login-title text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">VARA</h2>
              <p className="login-description mt-1 text-xs sm:text-sm text-gray-500">Sign in to your account</p>
            </div>

            {/* Form Container */}
            <div className="w-full px-4 sm:px-5 md:px-6 lg:px-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5 sm:space-y-3 md:space-y-4">
              {/* Email Field */}
              <div className="form-group space-y-1 sm:space-y-1.5">
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register('email')}
                  className="h-10 sm:h-11 md:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="form-group space-y-1 sm:space-y-1.5">
                <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="password-input-container relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    {...register('password')}
                    className="h-10 sm:h-11 md:h-12 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 pr-10 sm:pr-12 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Remember Me + Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <span
                    role="checkbox"
                    aria-checked={rememberMe}
                    tabIndex={0}
                    onClick={() => setRememberMe(!rememberMe)}
                    onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && setRememberMe(v => !v)}
                    className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded border-2 transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-black/30 ${
                      rememberMe
                        ? 'border-black bg-black'
                        : 'border-gray-400 bg-white hover:border-gray-700'
                    }`}
                  >
                    {rememberMe && (
                      <span
                        style={{
                          color: '#ffffff',
                          fontSize: '12px',
                          lineHeight: 1,
                          fontWeight: 700,
                          userSelect: 'none',
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                    Remember me
                  </span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs sm:text-sm font-medium text-gray-600 hover:text-black transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 sm:mt-3 md:mt-4 h-10 sm:h-11 md:h-12 w-full rounded-lg bg-black text-xs sm:text-sm font-semibold text-white transition-all duration-200 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
              </button>
            </form>
          </div>

            {/* Sign Up Link */}
            <div className="mt-3 sm:mt-4 md:mt-6 pb-4 sm:pb-5 md:pb-6 text-center text-xs sm:text-sm text-gray-600 px-4 sm:px-5 md:px-6">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-black hover:underline transition-all">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
