'use client'
import { useEffect, useState } from 'react';
import { ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { getChartData } from '@/apis/productsManagementApis';

interface LagerChartItem {
    month: string
    'Value of Sale': number
    'Value of Stock': number
}

export default function LagerChart() {
    const [chartData, setChartData] = useState<LagerChartItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [hasError, setHasError] = useState<boolean>(false);

    useEffect(() => {
        let isMounted = true;
        const fetchChartData = async () => {
            try {
                const response = await getChartData();
                if (!isMounted) return;
                
                let processedData: LagerChartItem[] = [];
                
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
                <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
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
                                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0" 
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                                    {entry.name}:
                                </span>
                                <span className="text-xs sm:text-sm font-semibold shrink-0" style={{ color: entry.color }}>
                                    {formatCurrency(entry.value)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    const formatCurrency = (value: number) => {
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
        return `$${value}`;
    };

    const maxValue = chartData.length > 0
        ? Math.max(
            ...chartData.map((item) => Math.max(item['Value of Sale'], item['Value of Stock'])),
            1
        )
        : 1;

    const yAxisTicks = Array.from({ length: 5 }, (_, index) =>
        Math.round((maxValue * index) / 4)
    ).filter((value, index, array) => array.indexOf(value) === index);

    return (
        <div className="w-full p-2 sm:p-4 mx-auto">
            <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Lagerwert</h1>
                <p className="mt-1 text-sm text-gray-500">Verkaufs- und Lagerwert im Zeitverlauf.</p>
            </div>

            <div className="w-full">
                <div className="w-full overflow-x-auto -mx-2 sm:mx-0">
                    <div className="w-full min-w-[280px] h-[260px] sm:h-[320px] md:h-[380px] lg:h-[430px] px-2 sm:px-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{ top: 12, right: 18, left: 8, bottom: 12 }}
                            >
                                <defs>
                                    <linearGradient id="colorSale" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#059669" stopOpacity={0.32}/>
                                        <stop offset="95%" stopColor="#059669" stopOpacity={0.04}/>
                                    </linearGradient>
                                    <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6EE7B7" stopOpacity={0.28}/>
                                        <stop offset="95%" stopColor="#6EE7B7" stopOpacity={0.05}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" horizontal vertical={false} />
                                <XAxis 
                                    dataKey="month" 
                                    axisLine={{ stroke: '#D1D5DB' }} 
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                    dy={8}
                                />
                                <YAxis 
                                    axisLine={{ stroke: '#D1D5DB' }} 
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                    width={74}
                                    tickMargin={10}
                                    tickFormatter={formatCurrency}
                                    domain={[0, maxValue]}
                                    ticks={yAxisTicks}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend 
                                    iconType="circle" 
                                    verticalAlign="top" 
                                    align="center" 
                                    wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="Value of Sale" 
                                    stroke="#059669" 
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSale)" 
                                    dot={{ r: 0 }}
                                    activeDot={{ r: 5 }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="Value of Stock" 
                                    stroke="#34D399" 
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorStock)" 
                                    dot={{ r: 0 }}
                                    activeDot={{ r: 5 }}
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
