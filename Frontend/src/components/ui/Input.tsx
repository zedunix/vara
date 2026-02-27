import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-white/90 mb-3 tracking-wide">
            {label}
          </label>
        )}
        <div className={cn(
          "relative flex items-center h-14 rounded-xl transition-all duration-200",
          "bg-[#141922] border border-[#2a3344]",
          "hover:border-[#3d4a5c] hover:bg-[#181d28]",
          "focus-within:border-blue-500/60 focus-within:bg-[#181d28] focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]",
          error && "border-red-500/50 focus-within:border-red-500/60 focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
        )}>
          {icon && (
            <div className="flex items-center justify-center w-14 text-white/40">
              {icon}
            </div>
          )}
          <input
            type={inputType}
            className={cn(
              'flex-1 h-full bg-transparent text-white placeholder:text-white/30',
              'focus:outline-none',
              'text-base tracking-wide',
              icon ? 'pr-4' : 'px-4',
              className
            )}
            ref={ref}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="flex items-center justify-center w-14 text-white/40 hover:text-white/70 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
