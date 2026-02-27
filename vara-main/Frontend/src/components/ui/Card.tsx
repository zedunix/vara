import { cn } from '@/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'glass';
}

export const Card = ({ className, children, variant = 'glass', ...props }: CardProps) => {
  const variants = {
    default: 'bg-gray-900',
    glass: 'bg-black/40 backdrop-blur-xl border border-white/10',
  };

  return (
    <div
      className={cn(
        'rounded-xl',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
