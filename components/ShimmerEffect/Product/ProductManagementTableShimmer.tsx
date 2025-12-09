"use client";

import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const baseShimmer = "animate-pulse bg-gray-200 rounded";

interface ProductManagementTableShimmerProps {
    sizeColumns: string[];
    rows?: number;
}

const ProductManagementTableShimmer: React.FC<ProductManagementTableShimmerProps> = ({ 
    sizeColumns, 
    rows = 5 
}) => {
    // Calculate minimum width based on columns
    const minWidth = 7 * 150 + sizeColumns.length * 60; // 7 fixed columns + size columns
    
    return (
        <div className="mt-5 overflow-x-auto">
            <div style={{ minWidth: `${minWidth}px` }}>
                <Table className='border-2 border-gray-500 rounded-lg w-full'>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="border-2 border-gray-500 p-2 whitespace-nowrap">
                                <div className={`${baseShimmer} h-4 w-20`} />
                            </TableHead>
                            <TableHead className="border-2 border-gray-500 p-2 whitespace-nowrap">
                                <div className={`${baseShimmer} h-4 w-24`} />
                            </TableHead>
                            <TableHead className="border-2 border-gray-500 p-2 whitespace-nowrap">
                                <div className={`${baseShimmer} h-4 w-32`} />
                            </TableHead>
                            <TableHead className="border-2 border-gray-500 p-2 whitespace-nowrap">
                                <div className={`${baseShimmer} h-4 w-28`} />
                            </TableHead>
                            <TableHead className="border-2 border-gray-500 p-2 whitespace-nowrap">
                                <div className={`${baseShimmer} h-4 w-24`} />
                            </TableHead>
                            <TableHead className="border-2 border-gray-500 p-2 whitespace-nowrap">
                                <div className={`${baseShimmer} h-4 w-20`} />
                            </TableHead>
                            <TableHead className="border-2 border-gray-500 p-2 whitespace-nowrap">
                                <div className={`${baseShimmer} h-4 w-20`} />
                            </TableHead>
                            {sizeColumns.map(size => (
                                <TableHead key={size} className="border-2 border-gray-500 p-2 text-center whitespace-nowrap">
                                    <div className={`${baseShimmer} h-4 w-8 mx-auto`} />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: rows }).map((_, rowIndex) => (
                            <TableRow key={rowIndex}>
                                <TableCell className="border-2 border-gray-500 p-2 whitespace-nowrap">
                                    <div className={`${baseShimmer} h-10 w-40`} />
                                </TableCell>
                                <TableCell className="border-2 border-gray-500 p-2 whitespace-nowrap">
                                    <div className={`${baseShimmer} h-4 w-24`} />
                                </TableCell>
                                <TableCell className="border-2 border-gray-500 p-2 whitespace-nowrap">
                                    <div className={`${baseShimmer} h-4 w-32`} />
                                </TableCell>
                                <TableCell className="border-2 border-gray-500 p-2 whitespace-nowrap">
                                    <div className={`${baseShimmer} h-4 w-28`} />
                                </TableCell>
                                <TableCell className="border-2 border-gray-500 p-2 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div className={`${baseShimmer} h-4 w-4 rounded-full`} />
                                        <div className={`${baseShimmer} h-4 w-24`} />
                                    </div>
                                </TableCell>
                                <TableCell className="border-2 border-gray-500 p-2 whitespace-nowrap">
                                    <div className={`${baseShimmer} h-8 w-8 rounded`} />
                                </TableCell>
                                <TableCell className="border-2 border-gray-500 p-2 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div className={`${baseShimmer} h-8 w-8 rounded`} />
                                        <div className={`${baseShimmer} h-8 w-8 rounded`} />
                                    </div>
                                </TableCell>
                                {sizeColumns.map(size => (
                                    <TableCell key={size} className="border-2 border-gray-500 p-2 text-center whitespace-nowrap">
                                        <div className={`${baseShimmer} h-4 w-8 mx-auto`} />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default ProductManagementTableShimmer;

