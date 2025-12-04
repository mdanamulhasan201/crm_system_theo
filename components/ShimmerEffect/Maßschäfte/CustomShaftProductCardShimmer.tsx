"use client";

import React from "react";

const baseShimmer = "animate-pulse bg-gray-200 rounded";

interface CustomShaftProductCardShimmerProps {
  count?: number;
}

const CustomShaftProductCardShimmer: React.FC<CustomShaftProductCardShimmerProps> = ({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`shimmer-${index}`}
          className="border group border-gray-300 rounded-md bg-white flex flex-col h-full"
        >
          {/* Image shimmer - matches actual Image component structure */}
          <div className="w-64 mx-auto h-full object-contain p-4 flex items-center justify-center">
            <div className={`${baseShimmer} w-full h-64`} />
          </div>
          
          {/* Content shimmer - matches actual content structure */}
          <div className="flex-1 flex flex-col justify-between p-4">
            <div>
              {/* Product name */}
              <div className={`${baseShimmer} h-5 w-3/4 mb-1`} />
              {/* Product ID */}
              <div className={`${baseShimmer} h-3 w-20 mb-2`} />
              {/* Price */}
              <div className={`${baseShimmer} h-6 w-24 mb-2`} />
            </div>
            {/* Button shimmer */}
            <div className={`${baseShimmer} h-10 w-full mt-2`} />
          </div>
        </div>
      ))}
    </>
  );
};

export default CustomShaftProductCardShimmer;
