'use client'
import { useEffect, useState } from 'react';
import { ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { getChartData } from '@/apis/productsManagementApis';

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
                
                let processedData: any[] = [];
                
                if (Array.isArray(response?.data)) {
                    processedData = response.data;
                } else if (response?.data && typeof response.data === 'object') {
                    const currentYear = new Date().getFullYear().toString();
                    processedData = [{
                        year: currentYear,
                        Einkaufspreis: response.data.Einkaufspreis || 0,
                        Verkaufspreis: response.data.Verkaufspreis || 0,
                        Gewinn: response.data.Gewinn || 0,
                    }];
                }
                
                setChartData(processedData);
                setHasError(false);
            } catch {
                if (!isMounted) return;
                setHasError(true);
                setChartData([]);
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

    const CustomTooltips = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const year = payload[0]?.payload?.year || label || 'N/A';
            
            return (
                <div className="bg-white p-2 sm:p-3 border border-gray-200 shadow-lg rounded-lg max-w-[200px] sm:max-w-none">
                    <p className="font-semibold text-sm sm:text-base mb-2 pb-2 border-b border-gray-200">
                        {`Jahr: ${year}`}
                    </p>
                    <div className="space-y-1 sm:space-y-2">
                        {payload.map((entry: any, index: number) => (
                            <div 
                                key={`item-${index}`} 
                                className="flex items-center gap-1.5 sm:gap-2 py-0.5 sm:py-1"
                            >
                                <div 
                                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0" 
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                                    {entry.name}:
                                </span>
                                <span className="text-xs sm:text-sm font-semibold flex-shrink-0" style={{ color: entry.color }}>
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
        <div className="w-full p-2 sm:p-4 mx-auto">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8">Übersicht Bestandswert</h1>
            <div className="w-full">
                <div className="w-full overflow-x-auto -mx-2 sm:mx-0">
                    <div className="w-full min-w-[280px] h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] px-2 sm:px-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{ top: 20, right: 10, left: 0, bottom: 20 }}
                                barGap={0}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
                                <XAxis 
                                    dataKey="year" 
                                    axisLine={false} 
                                    tickLine={false}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false}
                                    tick={{ fontSize: 12 }}
                                    width={60}
                                />
                                <Tooltip content={<CustomTooltips />} shared={false} />
                                <Legend 
                                    iconType="circle" 
                                    verticalAlign="top" 
                                    align="center" 
                                    wrapperStyle={{ paddingBottom: '15px', fontSize: '12px' }}
                                />
                                <Bar 
                                    dataKey="Einkaufspreis" 
                                    fill="#81E6D9" 
                                    name="Einkaufspreis" 
                                    radius={[4, 4, 0, 0]} 
                                    barSize={40}
                                />
                                <Bar 
                                    dataKey="Verkaufspreis" 
                                    fill="#38B2AC" 
                                    name="Verkaufspreis" 
                                    radius={[4, 4, 0, 0]} 
                                    barSize={40}
                                />
                                <Bar 
                                    dataKey="Gewinn" 
                                    fill="#4A6FA5" 
                                    name="Gewinn" 
                                    radius={[4, 4, 0, 0]} 
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {isLoading && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-2 text-center">Lade Daten...</p>
                )}
                {hasError && !isLoading && (
                    <p className="text-xs sm:text-sm text-red-500 mt-2 text-center px-2">Daten konnten nicht geladen werden.</p>
                )}
            </div>
        </div>
    )
}
