"use client";

import React from "react";

const baseShimmer = "animate-pulse bg-gray-200 rounded";

const AddProductShimmer: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 rounded-lg flex items-center justify-center">
      <div className="space-y-6 w-full p-6">
        {/* Header shimmer */}
        <div className="space-y-2">
          <div className={`${baseShimmer} h-6 w-48`} />
          <div className={`${baseShimmer} h-4 w-32`} />
        </div>
        
        {/* Form fields shimmer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className={`${baseShimmer} h-4 w-24`} />
              <div className={`${baseShimmer} h-10 w-full`} />
            </div>
          ))}
        </div>
        
        {/* Table shimmer */}
        <div className="space-y-2">
          <div className={`${baseShimmer} h-4 w-32`} />
          <div className="border rounded-lg overflow-hidden">
            <div className={`${baseShimmer} h-12 w-full`} />
            <div className="space-y-2 p-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className={`${baseShimmer} h-10 flex-1`} />
                  <div className={`${baseShimmer} h-10 flex-1`} />
                  <div className={`${baseShimmer} h-10 flex-1`} />
                  <div className={`${baseShimmer} h-10 flex-1`} />
                  <div className={`${baseShimmer} h-10 flex-1`} />
                  <div className={`${baseShimmer} h-10 flex-1`} />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Buttons shimmer */}
        <div className="flex justify-end gap-2">
          <div className={`${baseShimmer} h-10 w-24`} />
          <div className={`${baseShimmer} h-10 w-32`} />
        </div>
      </div>
    </div>
  );
};

export default AddProductShimmer;

