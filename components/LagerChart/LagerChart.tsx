'use client'
import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, } from 'recharts';
import { getChartData } from '@/apis/productsManagementApis';

// Fallback chart data (used only if API fails)
const fallbackChartData = [
    { year: '2024', Einkaufspreis: 90000, Verkaufspreis: 135000, Gewinn: 45000 }
];



export default function LagerChart() {
    const [chartData, setChartData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [hasError, setHasError] = useState<boolean>(false);

    useEffect(() => {
        let isMounted = true;
        const fetchChartData = async () => {
            try {
                const response = await getChartData();
                if (!isMounted) return;
                const apiData = Array.isArray(response?.data) ? response.data : [];
                setChartData(apiData.length > 0 ? apiData : fallbackChartData);
                setHasError(false);
            } catch (error) {
                // If API fails, use fallback to keep chart rendering
                if (!isMounted) return;
                setHasError(true);
                setChartData(fallbackChartData);
                // eslint-disable-next-line no-console
                console.error('Failed to fetch storage chart data', error);
            } finally {
                if (!isMounted) return;
                setIsLoading(false);
            }
        };
        fetchChartData();
        return () => {
            isMounted = false;
        };
    }, []);




    // Custom tooltip component
    const CustomTooltips = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
                    <p className="font-semibold text-base mb-2 pb-2 border-b border-gray-200">
                        {`Jahr: ${label}`}
                    </p>
                    <div className="space-y-2">
                        {payload.map((entry: any, index: number) => (
                            <div 
                                key={`item-${index}`} 
                                className="flex items-center gap-2 py-1"
                            >
                                <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    {entry.name}:
                                </span>
                                <span className="text-sm font-semibold" style={{ color: entry.color }}>
                                    {entry.value.toLocaleString('de-DE')} €
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full p-4 mx-auto">
            <h1 className="text-3xl font-bold mb-8">Übersicht Bestandswert</h1>
            <div className="">
                {/* bar chart  */}
                <div className="w-full overflow-x-auto">
                    <div className="min-w-[650px] h-[300px] lg:h-[500px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{ top: 20, right:0, left: 0, bottom: 20 }}
                                barGap={0}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis dataKey="year" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltips />} shared={false} />
                                <Legend iconType="circle" verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: '15px' }} />
                                <Bar dataKey="Einkaufspreis" fill="#81E6D9" name="Einkaufspreis" radius={[4, 4, 0, 0]} barSize={50} />
                                <Bar dataKey="Verkaufspreis" fill="#38B2AC" name="Verkaufspreis" radius={[4, 4, 0, 0]} barSize={50} />
                                <Bar dataKey="Gewinn" fill="#4A6FA5" name="Gewinn" radius={[4, 4, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {isLoading && (
                    <p className="text-sm text-gray-500 mt-2">Lade Daten...</p>
                )}
                {hasError && !isLoading && (
                    <p className="text-sm text-red-500 mt-2">Echte Daten konnten nicht geladen werden. Es werden Beispieldaten angezeigt.</p>
                )}
            </div>
        </div>
    )
}
