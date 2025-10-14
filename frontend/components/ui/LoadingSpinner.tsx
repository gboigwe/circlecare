import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className="relative">
        <Loader2 className={cn('animate-spin text-white', sizes[size])} />
        <div className={cn('absolute inset-0 animate-ping rounded-full bg-white/20', sizes[size])}></div>
      </div>
      {text && (
        <p className="mt-3 text-white/70 text-sm font-medium">{text}</p>
      )}
    </div>
  );
}

export function LoadingCard({ title, description }: { title: string; description?: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 text-center">
      <LoadingSpinner size="lg" text={title} />
      {description && (
        <p className="mt-2 text-white/50 text-sm">{description}</p>
      )}
    </div>
  );
}