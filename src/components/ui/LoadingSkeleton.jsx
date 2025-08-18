import React from 'react';
import { motion } from 'framer-motion';

const LoadingSkeleton = ({ 
  className = '', 
  variant = 'default',
  count = 1,
  height = 'h-4',
  width = 'w-full'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'card':
        return 'bg-card border border-border rounded-xl p-6';
      case 'circle':
        return 'rounded-full';
      case 'text':
        return 'rounded';
      default:
        return 'rounded-lg';
    }
  };

  const SkeletonItem = ({ index }) => (
    <motion.div
      className={`bg-muted animate-pulse ${height} ${width} ${getVariantClasses()} ${className}`}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        delay: index * 0.1
      }}
    />
  );

  if (variant === 'card') {
    return (
      <div className="space-y-6">
        {Array.from({ length: count }).map((_, index) => (
          <motion.div
            key={index}
            className="bg-card border border-border rounded-xl p-6 glass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="animate-pulse">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-muted rounded-lg"></div>
                <div className="w-16 h-6 bg-muted rounded"></div>
              </div>
              
              {/* Title */}
              <div className="w-3/4 h-6 bg-muted rounded mb-2"></div>
              
              {/* Content */}
              <div className="space-y-2 mb-4">
                <div className="w-full h-4 bg-muted rounded"></div>
                <div className="w-2/3 h-4 bg-muted rounded"></div>
              </div>
              
              {/* Footer */}
              <div className="flex justify-between items-center">
                <div className="w-24 h-4 bg-muted rounded"></div>
                <div className="w-8 h-8 bg-muted rounded"></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonItem key={index} index={index} />
      ))}
    </div>
  );
};

// Specific skeleton components for common use cases
export const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Header Skeleton */}
    <div className="space-y-2">
      <LoadingSkeleton height="h-8" width="w-64" />
      <LoadingSkeleton height="h-4" width="w-96" />
    </div>
    
    {/* Threat Level Skeleton */}
    <LoadingSkeleton variant="card" />
    
    {/* Module Cards Skeleton */}
    <div>
      <LoadingSkeleton height="h-6" width="w-48" className="mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <LoadingSkeleton variant="card" count={8} />
      </div>
    </div>
  </div>
);

export const ModuleSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center space-x-3">
      <LoadingSkeleton variant="circle" height="h-12" width="w-12" />
      <div className="space-y-2">
        <LoadingSkeleton height="h-6" width="w-48" />
        <LoadingSkeleton height="h-4" width="w-64" />
      </div>
    </div>
    
    {/* Content Cards */}
    <LoadingSkeleton variant="card" count={3} />
  </div>
);

export const NewsSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <LoadingSkeleton variant="circle" height="h-12" width="w-12" />
        <div className="space-y-2">
          <LoadingSkeleton height="h-6" width="w-48" />
          <LoadingSkeleton height="h-4" width="w-64" />
        </div>
      </div>
      <LoadingSkeleton height="h-10" width="w-24" />
    </div>
    
    {/* Filters */}
    <LoadingSkeleton variant="card" />
    
    {/* News Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <LoadingSkeleton variant="card" count={6} />
    </div>
  </div>
);

export default LoadingSkeleton;

