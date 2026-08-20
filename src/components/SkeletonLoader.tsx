import React from "react";

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="space-y-3 w-full max-w-md">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded-xl w-32"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded-xl w-24"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="w-16 h-16 bg-gray-200 rounded-2xl flex-shrink-0"></div>
              <div className="space-y-2 flex-grow">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded-xl w-20"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
