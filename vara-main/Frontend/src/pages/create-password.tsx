import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const createPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type CreatePasswordFormData = z.infer<typeof createPasswordSchema>;

export default function CreatePassword() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePasswordFormData>({
    resolver: zodResolver(createPasswordSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: CreatePasswordFormData) => {
    try {
      setIsLoading(true);
      
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Password created successfully!');
      
      // Redirect to login page after 1 second
      setTimeout(() => {
        navigate('/login');
      }, 1000);
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create password');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Dark Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
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
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-10 lg:px-20 lg:translate-x-20 text-center text-white">
          <p className="text-sm font-light tracking-[0.3em] mb-8 uppercase">UAE DESIGNERS</p>
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            CREATIVE<br />EXCELLENCE
          </h1>
          <p className="text-lg text-gray-300 max-w-md leading-relaxed">
            Where Creativity Meets Community
          </p>
          <p className="text-sm text-gray-400 mt-4 max-w-lg leading-relaxed">
            Join the premier association for UAE's creative professionals. Connect, collaborate, and grow with fellow designers, developers, and creative minds.
          </p>
        </div>
      </div>

      {/* Right Side - Create Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-12 lg:px-16">
      
        <div className="w-full max-w-lg flex flex-col items-center"> 
          {/* Logo */}
          <div className="logo-container flex flex-col items-center mb-8">
          <img src="/Images/image logo.png" alt="VARA Logo" className="w-30 h-30 mb-4 object-contain" />
          </div>
          {/* Create Password Form Card */}
          <div className="login-card bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Title */}
            <div className="mb-8 pt-2 text-center">
             
              <h2 className="login-title text-3xl font-bold tracking-tight text-gray-900">VARA</h2>
              <p className="login-description mt-1 text-sm text-gray-500">Create your password</p>
            </div>

            {/* Form Container */}
            <div className="max-w-md mx-auto items-center">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div className="form-group space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register('email')}
                  className="h-12 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="form-group space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="password-input-container relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    {...register('password')}
                    className="h-12 w-full rounded-lg border border-gray-300 bg-white px-4 pr-12 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="form-group space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="password-input-container relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    {...register('confirmPassword')}
                    className="h-12 w-full rounded-lg border border-gray-300 bg-white px-4 pr-12 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Create Password Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-6 h-12 w-full rounded-lg bg-black text-sm font-semibold text-white transition-all duration-200 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'CREATING PASSWORD...' : 'CREATE PASSWORD'}
              </button>
            </form>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
