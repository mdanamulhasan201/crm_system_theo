"use client";

import React from "react";

const baseShimmer = "animate-pulse bg-gray-200 rounded";

const CustomerHistoryShimmer: React.FC = () => {
  return (
    <div className="p-4 space-y-6">
      {/* Back button + header */}
      <div className="flex justify-between items-center">
        <div className={`${baseShimmer} h-9 w-28`} />
        <div className={`${baseShimmer} h-9 w-40`} />
      </div>

      {/* Title + actions */}
      <div className="flex justify-between items-center">
        <div className={`${baseShimmer} h-8 w-64`} />
        <div className="flex gap-2">
          <div className={`${baseShimmer} h-9 w-24`} />
          <div className={`${baseShimmer} h-9 w-28`} />
        </div>
      </div>

      {/* Basic info grid */}
      <div className="space-y-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className={`${baseShimmer} h-4 w-24`} />
              <div className={`${baseShimmer} h-9 w-full`} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className={`${baseShimmer} h-4 w-28`} />
              <div className={`${baseShimmer} h-9 w-full`} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className={`${baseShimmer} h-4 w-32`} />
              <div className={`${baseShimmer} h-9 w-full`} />
            </div>
          ))}
        </div>
      </div>

      {/* Action tiles */}
      <div className="flex items-center gap-10 my-10 flex-wrap">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className={`${baseShimmer} h-24 w-24 rounded-2xl`} />
            <div className={`${baseShimmer} h-4 w-24`} />
          </div>
        ))}
      </div>

      {/* Notes / table shimmer */}
      <div className="space-y-3">
        <div className={`${baseShimmer} h-6 w-40`} />
        <div className={`${baseShimmer} h-40 w-full rounded-xl`} />
      </div>

      {/* Tabs shimmer */}
      <div className="flex gap-4 mt-6 overflow-x-auto">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${baseShimmer} h-10 w-56 flex-shrink-0`} />
        ))}
      </div>

      {/* Tab content shimmer */}
      <div className={`${baseShimmer} h-64 w-full rounded-2xl mt-4`} />
    </div>
  );
};

export default CustomerHistoryShimmer;
