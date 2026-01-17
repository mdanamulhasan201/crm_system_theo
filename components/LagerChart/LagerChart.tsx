'use client'
import { useEffect, useState } from 'react';
import { ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
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
                    // If API returns array, use it directly but ensure it has the right structure
                    processedData = response.data.map((item: any) => ({
                        month: item.month || item.period || 'M01',
                        'Value of Sale': item['Value of Sale'] || item.Verkaufspreis || 0,
                        'Value of Stock': item['Value of Stock'] || item.Einkaufspreis || 0,
                    }));
                } else if (response?.data && typeof response.data === 'object') {
                    // API returns: { Einkaufspreis, Verkaufspreis, Gewinn }
                    // Map Einkaufspreis to "Value of Stock" and Verkaufspreis to "Value of Sale"
                    // Use actual values directly without calculation
                    const currentSale = response.data.Verkaufspreis || 0;
                    const currentStock = response.data.Einkaufspreis || 0;
                    
                    // Show actual API data directly for all months
                    processedData = [
                        {
                            month: 'M01',
                            'Value of Sale': currentSale,
                            'Value of Stock': currentStock,
                        },
                        {
                            month: 'M02',
                            'Value of Sale': currentSale,
                            'Value of Stock': currentStock,
                        },
                        {
                            month: 'M03',
                            'Value of Sale': currentSale,
                            'Value of Stock': currentStock,
                        },
                    ];
                } else {
                    // Default sample data if no API response
                    processedData = [
                        { month: 'M01', 'Value of Sale': 120000, 'Value of Stock': 250000 },
                        { month: 'M02', 'Value of Sale': 300000, 'Value of Stock': 600000 },
                        { month: 'M03', 'Value of Sale': 550000, 'Value of Stock': 950000 },
                    ];
                }
                
                setChartData(processedData);
                setHasError(false);
            } catch {
                if (!isMounted) return;
                setHasError(true);
                // Set default data even on error
                setChartData([
                    { month: 'M01', 'Value of Sale': 120000, 'Value of Stock': 250000 },
                    { month: 'M02', 'Value of Sale': 300000, 'Value of Stock': 600000 },
                    { month: 'M03', 'Value of Sale': 550000, 'Value of Stock': 950000 },
                ]);
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

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 sm:p-3 border border-gray-200 shadow-lg rounded-lg">
                    <p className="font-semibold text-sm sm:text-base mb-2 pb-2 border-b border-gray-200">
                        {label}
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
                                    ${(entry.value / 1000).toFixed(0)}K
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    // Format Y-axis ticks to show values in K format
    const formatYAxis = (value: number) => {
        return `$${value / 1000}K`;
    };

    return (
        <div className="w-full p-2 sm:p-4 mx-auto">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8">Gesamtwarenwert</h1>
            <div className="w-full">
                <div className="w-full overflow-x-auto -mx-2 sm:mx-0">
                    <div className="w-full min-w-[280px] h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] px-2 sm:px-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{ top: 20, right: 10, left: 0, bottom: 20 }}
                            >
                                <defs>
                                    <linearGradient id="colorSale" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.9}/>
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.2}/>
                                    </linearGradient>
                                    <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#34D399" stopOpacity={0.9}/>
                                        <stop offset="95%" stopColor="#34D399" stopOpacity={0.2}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
                                <XAxis 
                                    dataKey="month" 
                                    axisLine={false} 
                                    tickLine={false}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false}
                                    tick={{ fontSize: 12 }}
                                    width={60}
                                    tickFormatter={formatYAxis}
                                    domain={[0, 1000000]}
                                    ticks={[0, 250000, 500000, 750000, 1000000]}
                                    interval={0}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend 
                                    iconType="circle" 
                                    verticalAlign="top" 
                                    align="center" 
                                    wrapperStyle={{ paddingBottom: '15px', fontSize: '12px' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="Value of Sale" 
                                    stackId="1"
                                    stroke="#10B981" 
                                    fillOpacity={1}
                                    fill="url(#colorSale)" 
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="Value of Stock" 
                                    stackId="1"
                                    stroke="#34D399" 
                                    fillOpacity={1}
                                    fill="url(#colorStock)" 
                                />
                            </AreaChart>
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
