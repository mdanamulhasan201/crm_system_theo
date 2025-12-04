"use client";

import React from "react";

const baseShimmer = "animate-pulse bg-gray-200 rounded";

const OrdersHeaderShimmer: React.FC = () => {
  return (
    <div className="py-5 px-8 bg-white rounded-xl shadow mb-20">
      {/* Title */}
      <div className={`${baseShimmer} h-7 w-48 mb-5`} />

      {/* Top section: left card + right chart area */}
      <div className="flex flex-col xl:flex-row items-stretch w-full gap-6">
        {/* Left card */}
        <div className="bg-white rounded-lg p-8 flex flex-col items-center justify-center min-w-[250px] border mb-4 md:mb-0 xl:w-4/12">
          <div className={`${baseShimmer} h-6 w-40 mb-3`} />
          <div className={`${baseShimmer} h-10 w-32`} />
        </div>

        {/* Right chart area */}
        <div className="w-full xl:w-8/12">
          {/* Filters */}
          <div className="flex flex-col items-end justify-end mb-4">
            <div className="flex flex-col items-center justify-end">
              <div className="flex flex-col sm:flex-row gap-3 mb-2">
                <div className={`${baseShimmer} h-9 w-[200px]`} />
                <div className={`${baseShimmer} h-9 w-[200px]`} />
              </div>
              <div className={`${baseShimmer} h-4 w-20`} />
            </div>
          </div>

          {/* Line chart */}
          <div className="overflow-x-auto" style={{ minWidth: 0 }}>
            <div className={`${baseShimmer} h-64 w-full rounded-lg`} />
          </div>
        </div>
      </div>

      <hr className="my-5 border-gray-200 border" />

      {/* Bottom stats row */}
      <div className="flex flex-col md:flex-row justify-between items-stretch w-full gap-0">
        <div className="flex-1 flex flex-col items-center justify-center border-gray-300 py-6">
          <div className={`${baseShimmer} h-5 w-44 mb-3`} />
          <div className={`${baseShimmer} h-9 w-20`} />
        </div>

        <div className="border-r border-gray-300 hidden md:block" />

        <div className="flex-1 flex flex-col items-center justify-center border-gray-300 py-6">
          <div className={`${baseShimmer} h-5 w-48 mb-3`} />
          <div className={`${baseShimmer} h-9 w-20`} />
        </div>

        <div className="border-r border-gray-300 mr-5 hidden md:block" />

        {/* Auftragssuche placeholder */}
        <div className="flex-1 flex flex-col items-center justify-center py-6">
          <div className={`${baseShimmer} h-5 w-40 mb-3`} />
          <div className={`${baseShimmer} h-9 w-28`} />
        </div>
      </div>
    </div>
  );
};

export default OrdersHeaderShimmer;
