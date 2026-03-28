'use client';

import { GlassPanel } from '@/components/ui';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-2 border-apple-blue/30 border-t-apple-blue rounded-full animate-spin" />
    </div>
  );
}

export function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <GlassPanel key={i} className="p-5 animate-pulse">
          {/* Title skeleton */}
          <div className="h-6 bg-apple-gray-5/50 rounded-lg w-3/4 mb-3" />
          
          {/* Info skeleton */}
          <div className="flex gap-3 mb-4">
            <div className="h-4 bg-apple-gray-5/50 rounded w-20" />
            <div className="h-4 bg-apple-gray-5/50 rounded w-24" />
          </div>
          
          {/* Tags skeleton */}
          <div className="flex gap-2 mb-4">
            <div className="h-6 bg-apple-gray-5/50 rounded-full w-16" />
            <div className="h-6 bg-apple-gray-5/50 rounded-full w-20" />
          </div>
          
          {/* Footer skeleton */}
          <div className="pt-3 border-t border-glass-border">
            <div className="h-3 bg-apple-gray-5/50 rounded w-16" />
          </div>
        </GlassPanel>
      ))}
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
