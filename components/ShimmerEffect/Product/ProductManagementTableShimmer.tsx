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
    return (
        <div className="mt-5">
            <Table className='w-full'>
                <TableHeader>
                    <TableRow className="border-b">
                        <TableHead className="p-3 text-left">
                            <div className={`${baseShimmer} h-4 w-20`} />
                        </TableHead>
                        <TableHead className="p-3 text-left">
                            <div className={`${baseShimmer} h-4 w-24`} />
                        </TableHead>
                        <TableHead className="p-3 text-left">
                            <div className={`${baseShimmer} h-4 w-32`} />
                        </TableHead>
                        <TableHead className="p-3 text-left">
                            <div className={`${baseShimmer} h-4 w-28`} />
                        </TableHead>
                        <TableHead className="p-3 text-left">
                            <div className={`${baseShimmer} h-4 w-24`} />
                        </TableHead>
                        <TableHead className="p-3 text-left">
                            <div className={`${baseShimmer} h-4 w-20`} />
                        </TableHead>
                        <TableHead className="p-3 text-left">
                            <div className={`${baseShimmer} h-4 w-20`} />
                        </TableHead>
                        {sizeColumns.map(size => (
                            <TableHead key={size} className="p-3 text-center">
                                <div className={`${baseShimmer} h-4 w-8 mx-auto`} />
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <TableRow key={rowIndex} className="border-b">
                            <TableCell className="p-3">
                                <div className="flex items-center justify-center">
                                    <div className={`${baseShimmer} h-10 w-10 rounded`} />
                                </div>
                            </TableCell>
                            <TableCell className="p-3">
                                <div className={`${baseShimmer} h-4 w-24`} />
                            </TableCell>
                            <TableCell className="p-3">
                                <div className={`${baseShimmer} h-4 w-32`} />
                            </TableCell>
                            <TableCell className="p-3">
                                <div className={`${baseShimmer} h-4 w-28`} />
                            </TableCell>
                            <TableCell className="p-3">
                                <div className="flex items-center gap-2">
                                    <div className={`${baseShimmer} h-4 w-4 rounded-full`} />
                                    <div className={`${baseShimmer} h-4 w-24`} />
                                </div>
                            </TableCell>
                            <TableCell className="p-3">
                                <div className={`${baseShimmer} h-8 w-8 rounded`} />
                            </TableCell>
                            <TableCell className="p-3">
                                <div className="flex items-center gap-2">
                                    <div className={`${baseShimmer} h-8 w-8 rounded`} />
                                    <div className={`${baseShimmer} h-8 w-8 rounded`} />
                                </div>
                            </TableCell>
                            {sizeColumns.map(size => (
                                <TableCell key={size} className="p-3 text-center">
                                    <div className={`${baseShimmer} h-4 w-8 mx-auto`} />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default ProductManagementTableShimmer;

