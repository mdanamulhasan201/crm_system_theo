"use client";

import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";

interface LastScanTableShimmerProps {
  rows?: number;
}

const baseShimmer = "animate-pulse bg-gray-200 rounded";

const LastScanTableShimmer: React.FC<LastScanTableShimmerProps> = ({ rows = 6 }) => {
  const rowArray = Array.from({ length: rows });

  return (
    <>
      {rowArray.map((_, index) => (
        <TableRow key={index}>
          <TableCell className="w-[50px]">
            <div className={`${baseShimmer} h-4 w-4`} />
          </TableCell>
          <TableCell>
            <div className={`${baseShimmer} h-4 w-40 mb-2`} />
            <div className={`${baseShimmer} h-3 w-24`} />
          </TableCell>
          <TableCell>
            <div className={`${baseShimmer} h-4 w-28`} />
          </TableCell>
          <TableCell>
            <div className={`${baseShimmer} h-4 w-40`} />
          </TableCell>
          <TableCell>
            <div className={`${baseShimmer} h-4 w-32`} />
          </TableCell>
          <TableCell>
            <div className={`${baseShimmer} h-4 w-36`} />
          </TableCell>
          <TableCell>
            <div className={`${baseShimmer} h-4 w-40`} />
          </TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end gap-2">
              <div className={`${baseShimmer} h-8 w-24`} />
              <div className={`${baseShimmer} h-8 w-24`} />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default LastScanTableShimmer;
