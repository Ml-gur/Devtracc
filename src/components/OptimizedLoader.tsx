import React from 'react';
import { cn } from './ui/utils';

interface OptimizedLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'skeleton' | 'dots' | 'pulse';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

const textSizeMap = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg'
};

export const OptimizedSpinner = React.memo<OptimizedLoaderProps>(function OptimizedSpinner({ 
  size = 'md', 
  className 
}) {
  return (
    <div 
      className={cn(
        sizeMap[size],
        'border-2 border-current border-t-transparent rounded-full animate-spin',
        'gpu-accelerated', // Custom performance class
        className
      )}
    />
  );
});

export const OptimizedSkeleton = React.memo<{ 
  className?: string;
  width?: string;
  height?: string;
}>(function OptimizedSkeleton({ className, width = 'w-full', height = 'h-4' }) {
  return (
    <div 
      className={cn(
        width,
        height,
        'skeleton rounded',
        'contain-paint', // Performance optimization
        className
      )}
    />
  );
});

export const OptimizedDots = React.memo<OptimizedLoaderProps>(function OptimizedDots({ 
  size = 'md',
  className 
}) {
  const dotSize = size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-2.5 h-2.5';
  
  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            dotSize,
            'bg-current rounded-full animate-bounce',
            'gpu-accelerated'
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  );
});

export const OptimizedPulse = React.memo<OptimizedLoaderProps>(function OptimizedPulse({ 
  size = 'md',
  className 
}) {
  return (
    <div 
      className={cn(
        sizeMap[size],
        'bg-current rounded-full animate-pulse',
        'gpu-accelerated',
        className
      )}
    />
  );
});

export const OptimizedLoader = React.memo<OptimizedLoaderProps>(function OptimizedLoader({
  size = 'md',
  variant = 'spinner',
  className,
  text,
  fullScreen = false
}) {
  const LoaderComponent = React.useMemo(() => {
    switch (variant) {
      case 'skeleton':
        return OptimizedSkeleton;
      case 'dots':
        return OptimizedDots;
      case 'pulse':
        return OptimizedPulse;
      default:
        return OptimizedSpinner;
    }
  }, [variant]);

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-3',
      fullScreen && 'min-h-screen',
      className
    )}>
      <LoaderComponent size={size} />
      {text && (
        <p className={cn(
          textSizeMap[size],
          'text-muted-foreground animate-fade-in'
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
});

// Specialized loaders for common use cases
export const DashboardLoader = React.memo(function DashboardLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <div className="text-center space-y-4 animate-fade-in">
        <OptimizedSpinner size="lg" className="mx-auto text-blue-500" />
        <div className="text-sm text-muted-foreground">Initializing DevTrack Africa...</div>
        <div className="text-xs text-muted-foreground">Loading your project management workspace</div>
      </div>
    </div>
  );
});

export const ComponentLoader = React.memo<{ 
  height?: string;
  className?: string;
}>(function ComponentLoader({ height = 'h-64', className }) {
  return (
    <div className={cn(
      'flex items-center justify-center',
      height,
      'bg-muted/20 rounded-lg animate-fade-in',
      className
    )}>
      <OptimizedSpinner className="text-primary" />
    </div>
  );
});

export const CardLoader = React.memo<{
  lines?: number;
  className?: string;
}>(function CardLoader({ lines = 3, className }) {
  return (
    <div className={cn('space-y-3 p-4', className)}>
      <OptimizedSkeleton height="h-6" width="w-3/4" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <OptimizedSkeleton 
          key={i} 
          height="h-4" 
          width={i === lines - 2 ? 'w-1/2' : 'w-full'} 
        />
      ))}
    </div>
  );
});

export const ListLoader = React.memo<{
  items?: number;
  className?: string;
}>(function ListLoader({ items = 5, className }) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
          <OptimizedSkeleton width="w-12" height="h-12" className="rounded-full" />
          <div className="flex-1 space-y-2">
            <OptimizedSkeleton height="h-4" width="w-3/4" />
            <OptimizedSkeleton height="h-3" width="w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
});

export default OptimizedLoader;