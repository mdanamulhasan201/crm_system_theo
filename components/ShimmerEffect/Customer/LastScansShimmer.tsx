"use client";

import React from "react";

interface LastScansShimmerProps {
  cardCount?: number;
}

const baseShimmer = "animate-pulse bg-gray-200 rounded";

const LastScansShimmer: React.FC<LastScansShimmerProps> = ({ cardCount = 5 }) => {
  const cards = Array.from({ length: cardCount });

  return (
    <div className="flex flex-col gap-4 mt-10">
      <div className="flex items-center gap-3">
        <div className={`${baseShimmer} h-7 w-56`} />
        <div className={`${baseShimmer} h-4 w-32`} />
      </div>

      <div className="relative px-4">
        <div className="overflow-hidden">
          <div className="flex">
            {cards.map((_, index) => (
              <div
                key={index}
                className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%] 2xl:flex-[0_0_20%] p-2"
              >
                <div className="border-2 border-gray-200 p-3 flex flex-col gap-3 h-[480px] overflow-hidden">
                  <div className="flex justify-center items-center">
                    <div className={`${baseShimmer} h-48 w-48 rounded-xl`} />
                  </div>
                  <div className={`${baseShimmer} h-5 w-40`} />
                  <div className={`${baseShimmer} h-4 w-32`} />
                  <div className={`${baseShimmer} h-4 w-44`} />
                  <div className={`${baseShimmer} h-4 w-40`} />

                  <div className="flex flex-col gap-2 mt-auto">
                    <div className={`${baseShimmer} h-9 w-full`} />
                    <div className={`${baseShimmer} h-9 w-full`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows shimmer */}
        <div className={`${baseShimmer} h-10 w-10 rounded-full absolute left-4 top-1/2 -translate-y-1/2`} />
        <div className={`${baseShimmer} h-10 w-10 rounded-full absolute right-4 top-1/2 -translate-y-1/2`} />
      </div>
    </div>
  );
};

export default LastScansShimmer;
