import React from 'react';

export function PageSkeleton() {
  return (
    <div className="w-full min-h-screen p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-8 w-48 bg-white/10 rounded-lg" />
        <div className="h-4 w-96 bg-white/5 rounded-md" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-[#1A1B2E] border border-white/5 rounded-2xl p-4 space-y-3">
            <div className="h-3 w-20 bg-white/10 rounded" />
            <div className="h-6 w-32 bg-white/10 rounded" />
          </div>
        ))}
      </div>

      {/* Main body skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 h-96 bg-[#1A1B2E] border border-white/5 rounded-2xl p-6" />
        <div className="lg:col-span-7 h-96 bg-[#1A1B2E] border border-white/5 rounded-2xl p-6" />
      </div>
    </div>
  );
}
