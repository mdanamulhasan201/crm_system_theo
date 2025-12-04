"use client";

import React from "react";

const baseShimmer = "animate-pulse bg-gray-200 rounded";

const CustomShaftDetailsShimmer: React.FC = () => {
  return (
    <div className="px-2 md:px-6 py-8 w-full">
      {/* Back button shimmer */}
      <div className={`${baseShimmer} h-10 w-32 mb-6`} />

      {/* Title shimmer */}
      <div className={`${baseShimmer} h-8 w-64 mb-8`} />

      {/* File Upload Section shimmer */}
      <div className="mb-8 space-y-4">
        <div className={`${baseShimmer} h-6 w-48 mb-4`} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`${baseShimmer} h-32 w-full rounded-lg`} />
          <div className={`${baseShimmer} h-32 w-full rounded-lg`} />
        </div>
      </div>

      {/* Product Image and Info shimmer */}
      <div className="flex flex-col md:flex-row gap-10 items-center justify-center mb-8">
        {/* Image section */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className={`${baseShimmer} w-full h-96 rounded-lg`} />
        </div>

        {/* Product info section */}
        <div className="w-full md:w-1/2 space-y-4">
          <div className={`${baseShimmer} h-8 w-48`} />
          <div className={`${baseShimmer} h-4 w-32`} />
          <div className={`${baseShimmer} h-6 w-40`} />
          <div className={`${baseShimmer} h-20 w-full`} />
        </div>
      </div>

      {/* Product Configuration shimmer */}
      <div className="space-y-6">
        <div className={`${baseShimmer} h-6 w-56 mb-4`} />
        
        {/* Configuration options grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="space-y-2">
              <div className={`${baseShimmer} h-4 w-32`} />
              <div className={`${baseShimmer} h-10 w-full`} />
            </div>
          ))}
        </div>

        {/* Additional options */}
        <div className="space-y-4 mt-6">
          <div className={`${baseShimmer} h-4 w-40`} />
          <div className="flex gap-4">
            <div className={`${baseShimmer} h-5 w-5 rounded`} />
            <div className={`${baseShimmer} h-4 w-32`} />
          </div>
          <div className="flex gap-4">
            <div className={`${baseShimmer} h-5 w-5 rounded`} />
            <div className={`${baseShimmer} h-4 w-32`} />
          </div>
        </div>

        {/* Text areas */}
        <div className="space-y-4">
          <div className={`${baseShimmer} h-4 w-48`} />
          <div className={`${baseShimmer} h-24 w-full`} />
          <div className={`${baseShimmer} h-4 w-48`} />
          <div className={`${baseShimmer} h-24 w-full`} />
        </div>

        {/* Submit button */}
        <div className={`${baseShimmer} h-12 w-48 mx-auto mt-8`} />
      </div>
    </div>
  );
};

export default CustomShaftDetailsShimmer;
