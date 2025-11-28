import React from 'react';
import { IoDocumentText, IoArrowForward } from 'react-icons/io5';

interface StockUpdateDetailsProps {
    changeDetails: Array<{ field: string, oldValue: string, newValue: string }>;
}

const StockUpdateDetails: React.FC<StockUpdateDetailsProps> = ({ changeDetails }) => {
    if (!changeDetails || changeDetails.length === 0) return null;

    return (
        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
                <IoDocumentText className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700">Änderungsdetails</span>
            </div>
            <div className="space-y-2">
                {changeDetails.map((change, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                        <span className="font-semibold text-gray-700 min-w-[140px]">{change.field}:</span>
                        <div className="flex items-center gap-2 flex-1">
                            <span className="px-2 py-0.5 bg-gray-200 rounded text-gray-700 text-xs">
                                {change.oldValue}
                            </span>
                            <IoArrowForward className="w-3 h-3 text-gray-500" />
                            <span className="px-2 py-0.5 bg-blue-200 rounded text-blue-900 font-semibold text-xs">
                                {change.newValue}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StockUpdateDetails;

